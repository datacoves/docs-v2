---
title: "CI/CD Pipelines for dbt and Airflow in Datacoves"
sidebar_label: "CI/CD Pipelines"
description: "How the Datacoves reference CI/CD pipelines work: numbered stages 10, 15, 20 and 30, branching model, database lifecycle, and setup for GitHub Actions and Azure DevOps."
sidebar_position: 65
---
# CI/CD pipelines

Datacoves provides a reference CI/CD implementation that validates every change before it reaches production and then deploys it with zero downtime. The reference implementation uses **GitHub Actions** and lives in the `.github/workflows` folder of the [Balboa demo repository](https://github.com/datacoves/balboa). The same logic has been adapted to **Azure DevOps Pipelines**: the stages and the decisions they make are the same, they use equivalent scripts and dbt macros, and the platform-specific pieces (triggers, variables, API calls) change. Some features exist in only one of the two implementations; they are marked as variants on each page.

This section explains what each stage does, step by step, and how to adapt it to your team.

## Numbered stages

Pipeline files are prefixed with a number that tells you where in the delivery lifecycle they run. Gaps between numbers are intentional, so you can add your own stages without renaming existing files.

| Stage | GitHub Actions file | Azure DevOps file | Runs when | Purpose |
|---|---|---|---|---|
| **10** | `10_feature_dbt_checks.yml`, `10_feature_airflow_checks.yml` | `10_feature_dbt_checks.yml` | A pull request (PR) from a feature branch targets a release branch | Build and test the change in an isolated PR database, run governance checks, validate Airflow DAGs |
| **15** | `15_drop_feature_db.yml` | `15_cleanup_pr_database.yml` | A PR into a release branch is closed | Drop the PR database when the PR was abandoned |
| **20** | `20_release_dbt_checks.yml` | `20_release_dbt_checks.yml` | A PR targets `main` (release, hotfix or infra branch) | Build the release in a QA database cloned from production |
| **30** | `30_deploy_changes_to_production.yml` | `30_deploy_to_production.yml` | A commit lands on `main` | Blue/green deploy to production, clean up, publish docs and artifacts, tag the version |

Each stage has its own page:

- [Branch validation](./branch-validation.md), shared by stages 10 and 20
- [Stage 10: Feature checks](./feature-checks.md)
- [Stage 15: Drop PR database](./drop-pr-database.md)
- [Stage 20: Release checks](./release-checks.md)
- [Stage 30: Deploy to production](./deploy-to-production.md)
- [Customize the pipelines](./customize.md)

## Branching model

The pipelines enforce the release-based branching strategy described in [Git best practices](/docs/best-practices/git):

![Diagram of the CI/CD branch flow: a feature branch pull request into a release branch runs stage 10, an abandoned feature pull request runs stage 15, a release pull request into main runs stage 20, and a merge to main runs stage 30 to deploy to the production database. Hotfix and infra branches skip the release branch and open pull requests directly into main, which also run stage 20.](./assets/cicd-branch-flow.png)

| Source branch | Can merge into | Pipelines that run on the PR |
|---|---|---|
| `feature/*` | `feature/*`, `release/*` | 10 (only when the target is `release/*`), 15 on close |
| `release/*` | `main` | 20 |
| `hotfix/*` | `main` | 20 |
| `infra/*` | `main` | 20 |

In the GitHub Actions reference, stages 10 and 20 only run when the PR changes the folders in their `paths` filter (`transform/` for dbt, `orchestrate/` for Airflow). A PR that changes nothing in those folders, such as an infra PR that only edits a workflow, runs no checks.

The prefixes are defined in `automate/git/branch_validator.py`. See [Customize the pipelines](./customize.md#change-branch-prefixes) to change them.

## Database lifecycle

Every stage works against a different Snowflake database, all derived from the base database name you configure (`DATACOVES__MAIN__DATABASE`). In the diagram and the table, `<DATABASE>` is that base name.

![Diagram of the database lifecycle across CI/CD stages: the PR database is created in stage 10, kept while the release is open and dropped after the stage 30 deploy, or in stage 15 if the PR is abandoned. The QA temp database is cloned and built in stage 20 and swapped into the stable QA database. The staging database is cloned and built in stage 30 and swapped with production.](./assets/cicd-database-lifecycle.png)

| Database | Created by | Used for | Dropped by |
|---|---|---|---|
| `<DATABASE>_PR_<pr number>` | Stage 10 | Building and reviewing a single feature PR | Stage 15 if the PR is abandoned; stage 30 after the release that includes it is deployed |
| `<DATABASE>_QA_TEMP` | Stage 20 | Temporary clone of production where the release is built | Stage 20, after it is swapped into QA |
| `<DATABASE>_QA` | Stage 20 | Stable QA database with the release candidate | Replaced on the next stage 20 run of a later day |
| Blue/green staging database | Stage 30 (`dbt-coves blue-green`) | Building the new production version | Not dropped: it is swapped in and becomes production |
| `<DATABASE>` | Exists before the first deployment | Production | On every deployment the previous production version is swapped out and dropped by `dbt-coves blue-green` |

## Required configuration

All stages connect to Snowflake through `automate/dbt/profiles.yml`, which reads its values from environment variables.

| Name | Type | Description |
|---|---|---|
| `DATACOVES__MAIN__ACCOUNT` | Variable | Snowflake account |
| `DATACOVES__MAIN__DATABASE` | Variable | Base (production) database name, without suffixes |
| `DATACOVES__MAIN__SCHEMA` | Variable | Default schema |
| `DATACOVES__MAIN__ROLE` | Variable | Role used by the CI service user |
| `DATACOVES__MAIN__WAREHOUSE` | Variable | Warehouse |
| `DATACOVES__MAIN__USER` | Variable | CI service user |
| `DATACOVES__MAIN__PRIVATE_KEY` | **Secret** | Private key of the service user, in P8 format (see [Snowflake key-pair authentication](/docs/how-tos/snowflake/snowflake-key-based-auth)) |
| `DATACOVES__DROP_DB_ON_FAIL` | Variable | When `true`, stage 10 drops the PR database if grants cannot be applied |

- **GitHub Actions:** add them under **Settings › Secrets and variables › Actions**, as repository variables and secrets. The workflows read them with `${{ vars.NAME }}` and `${{ secrets.NAME }}`.
- **Azure DevOps:** create a **Variable Group** (for example `ci-snowflake`) with the same names, mark the private key as secret, and reference the group from each pipeline. Secret variables are not exposed to scripts automatically, so every step that runs dbt passes the key explicitly with `env: DATACOVES__MAIN__PRIVATE_KEY: $(DATACOVES__MAIN__PRIVATE_KEY)`.

The production manifest used for Slim CI is read from, and written to, a Snowflake internal stage by the `get_last_artifacts` and `upload_artifacts` macros (default `RAW.DBT_ARTIFACTS.ARTIFACTS`).

## CI images

Jobs run inside Datacoves CI images, so the tools match what developers use in their Datacoves environment:

| Image | Used by | Includes |
|---|---|---|
| `datacoves/ci-basic-dbt-snowflake:<version>` | dbt jobs in stages 10, 15, 20 and 30 | dbt, dbt-coves, pre-commit and SQLFluff. The other pre-commit hooks, such as dbt-checkpoint and yamllint, are installed by pre-commit from `.pre-commit-config.yaml` when the job runs |
| `datacoves/ci-airflow-dbt-snowflake:<version>` | Airflow job in stage 10 | Airflow, the Datacoves Airflow providers, and the `/usr/app/test_dags.py` script |

Pin the image tag to the Datacoves release your environment uses. See [Datacoves versioning](/docs/reference/datacoves/versioning) for the available tag formats.

## GitHub Actions and Azure DevOps at a glance

| Concept | GitHub Actions | Azure DevOps |
|---|---|---|
| Pipeline location | `.github/workflows/` | `.azure-pipelines/` |
| PR triggers (stages 10 and 20) | `on: pull_request` with `branches` and `paths` filters | `pr: none` in YAML; triggered by **Branch Policies › Build Validation** on the target branch. Path filtering is done in a script step |
| PR close trigger (stage 15) | `on: pull_request: types: [closed]` | Service hook (*Pull request updated*) that calls an **Incoming Webhook** pipeline resource |
| Deploy trigger (stage 30) | `on: push: branches: [main]` | `trigger: branches: include: [main]` |
| Configuration | Repository variables and secrets | Variable Group |
| Passing values between steps | `$GITHUB_OUTPUT` / `$GITHUB_ENV` | `##vso[task.setvariable ...]` logging commands |
| API access | `GITHUB_TOKEN` and the GitHub REST API | `System.AccessToken` and the Azure DevOps REST API |
| PR feedback | Comments on the PR | PR status checks and the PR description |

## Related guides

- [Develop and release a feature](/docs/how-tos/dataops/releasing-new-feature)
- [Trigger CI/CD without code changes](/docs/how-tos/dataops/trigger-cicd-workflow)
- [Test Airflow DAGs in your CI/CD pipeline](/docs/how-tos/airflow/dags/test-dags)
- [Configure a project's CI/CD in Datacoves](/docs/how-tos/datacoves/how_to_projects)
