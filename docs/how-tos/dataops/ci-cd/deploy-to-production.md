---
title: "CI/CD Stage 30: Blue/Green Deployment to Production"
sidebar_label: "30 - Deploy to Production"
description: "Step-by-step reference for stage 30 of the Datacoves CI/CD pipeline: blue/green dbt deployment, versioning, orphan cleanup, artifacts, docs, and PR database cleanup."
sidebar_position: 5
---
# Stage 30: Deploy to production

Stage 30 runs when changes land on `main`, after a release, hotfix or infra pull request (PR) is merged. It deploys the dbt project to production with a blue/green deployment, so users never see a half-built database, and then cleans up and publishes everything the next runs need.

In the GitHub Actions reference, `30_deploy_changes_to_production.yml` triggers on `push` to `main` when files change in `.github/workflows/**`, `automate/**` or `transform/**`. It can also be run manually.

## Steps

The job runs in the `datacoves/ci-basic-dbt-snowflake` image with `DATACOVES__MAIN__DATABASE` set to the production database.

| # | Step | What it does |
|---|---|---|
| 1 | Checkout, set secure directory, `dbt deps` | Checks out `main` with full history and installs packages |
| 2 | Get prod manifest | `get_artifacts.sh` downloads the manifest of the **previous** deployment, used to deploy only what changed |
| 3 | Check for full-refresh marker | Looks for `[deploy:full-refresh]` in the latest commit message (added by [stage 20](./release-checks.md#why-a-deploy-marker-in-the-pr-title)). If found, the deployment uses `--full-refresh` |
| 4 | Set deployment version and tag | `automate/dbt/set_deployment_version.sh` (see [Versioning](#versioning)) |
| 5 | Blue/green deployment | `dbt-coves blue-green --defer` when a production manifest exists, or `dbt-coves blue-green` for a full build when it does not (see [Blue/green deployment](#bluegreen-deployment)) |
| 6 | Restore grants | `grant_db_usage` restores the select grants on tables, views and dynamic tables that are not carried across the database swap |
| 7 | Drop orphaned relations | `drop_orphaned_relations` drops tables and views that still exist in production but are no longer defined in dbt |
| 8 | Drop orphaned schemas | `orphaned_schemas.py` compares the previous production manifest with the new one to find schemas whose models were all deleted, and `drop_orphaned_schemas` drops them. Only schemas that dbt created are considered, and schemas that contain objects dbt did not build are kept |
| 9 | Generate and publish docs | `dbt docs generate`, then publishes `transform/target` to the `dbt-docs` branch, which Datacoves serves as the project's dbt docs |
| 10 | Upload dbt artifacts | `upload_artifacts` uploads `manifest.json`, `run_results.json` and `catalog.json` to the Snowflake stage, where stages 10, 20 and the next deployment read them |
| 11 | Push version changes | Pushes the version commit and tag created in step 4 to `main` |
| 12 | PR database cleanup | Drops the feature PR databases that are no longer needed (see [PR database cleanup](#pr-database-cleanup)) |

:::note
The Balboa workflow includes additional steps that belong to that demo, such as deploying a Streamlit app, uploading artifacts to S3 for DataHub, and pushing artifacts to the Datacoves dbt API. Add steps like these after the core deployment when your project needs them.
:::

## Blue/green deployment

`dbt-coves blue-green` builds the new version of production next to the current one, and swaps them only when everything succeeded:

1. Creates a staging database (by default `<DATABASE>_STAGING`) and clones production's schemas and grants into it.
2. Runs `dbt build` against the staging database. With `--defer`, only modified models and their descendants are built.
3. Copies the database-level grants from production to staging.
4. Swaps staging and production with `ALTER DATABASE ... SWAP WITH ...`.
5. Drops the previous production database, which now has the staging name.

If any model or test fails, the swap never happens and production is not touched. The failed staging database is left in place for debugging, unless `--drop-staging-db-on-failure` is used.

:::warning
While a failed staging database exists, the next `dbt-coves blue-green` run stops with an error because the staging database already exists. Drop it before re-running the deployment, or add `--drop-staging-db-at-start` or `--drop-staging-db-on-failure` to the command.
::: See the [`dbt-coves blue-green` reference](https://github.com/datacoves/dbt-coves/tree/main/docs/commands/blue-green) for all options, such as `--staging-database` to use a fixed staging database name and `--keep-staging-db-on-success` to keep the previous production version as a rollback copy.

## Versioning

Every deployment gets a version in the format `YYYYMMDD.N.0`, where `N` is the deployment number for that day. For example, the second deployment on August 1, 2026 is `20260801.2.0`.

`set_deployment_version.sh`:

1. Fetches existing tags and finds the highest `N` already used today.
2. Writes the new version to the `version:` key of `dbt_project.yml`. The trailing `.0` keeps it a valid three-part semantic version, as dbt requires.
3. Commits the change and creates a git tag with the same name. Both include `[skip ci]` so the push does not trigger stage 30 again.

The version is bumped **before** any step writes dbt artifacts, because dbt stores a hash of `dbt_project.yml` in `partial_parse.msgpack`. Artifacts built before the bump could not be reused against the version that ends up on `main`.

## PR database cleanup

Feature PR databases (`<DATABASE>_PR_<n>`) are kept after the PR is merged into a release branch, so QA can still query them while the release is validated. Once the release is in production they are no longer needed. Stage 30 removes them in two passes. Both run only after a successful deployment, use `continue-on-error`, and never fail the deployment: anything left behind is retried on the next deployment.

### 1. Targeted cleanup

`automate/git/get_feature_pr_ids.py`:

1. Finds the PR that produced the commit being deployed, using the API, so it works with merge commits, squash merges and custom commit messages.
2. If that PR came from a release branch, lists every feature PR that was merged into that release branch.
3. Returns their IDs, and the next step drops each `<DATABASE>_PR_<id>`.

Deployments from hotfix or infra branches are skipped here and handled by the sweep.

### 2. Sweep

The sweep catches everything the targeted cleanup misses: hotfix and infra deployments, abandoned releases, branches that do not follow the naming convention, and drops that failed on a previous run.

1. The `show_pr_databases` macro lists every `<DATABASE>_PR_*` database with its creation date and the date it was last queried (from `SNOWFLAKE.ACCOUNT_USAGE.QUERY_HISTORY`, excluding queries by the CI user, so builds do not count as activity). The role that runs the deployment needs `IMPORTED PRIVILEGES` on the `SNOWFLAKE` database.
2. `automate/git/sweep_stale_pr_databases.py` checks the PR behind each database and decides whether to drop it.
3. The next step drops the selected databases.

Decision per database:

| PR state | Decision |
|---|---|
| Abandoned (closed without merging) | Drop |
| Not found (deleted) | Drop |
| Open | Keep |
| Merged into a branch that is not a release branch | Drop |
| Merged into a release branch | Depends on the release, see below |
| Any other API error | Keep and retry on the next deployment |

For PRs merged into a release branch, the release rules are evaluated in order, and the first match wins:

| # | Release state | Decision |
|---|---|---|
| 1 | The release has an **open** PR to `main` | Keep (release in QA) |
| 2 | The release has a **merged** PR to `main` | Drop (release shipped) |
| 3 | The release has an **abandoned** PR to `main` | Drop (release abandoned) |
| 4 | The release branch exists but has no PR to `main` yet | Keep, subject to the age limits below |
| 5 | The release branch was deleted and has no PR to `main` | Drop (release discarded) |

Rule 1 is evaluated first because a release PR can be abandoned and reopened. Rule 4 has age limits because release branches are not deleted after merging, so a release that never gets a PR to `main` would otherwise keep its PR databases forever:

| Setting | Default | Meaning |
|---|---|---|
| `PR_MAX_AGE_DAYS` | `15` | Databases up to this age are always kept |
| `PR_MAX_IDLE_DAYS` | `15` | Older databases are kept only if someone queried them in this many days |
| `PR_HARD_MAX_AGE_DAYS` | `45` | Databases older than this are dropped even if they are in use |

The settings are environment variables of the sweep step. An invalid value aborts the sweep without dropping anything.

## In Azure DevOps

The Azure DevOps implementation (`.azure-pipelines/30_deploy_to_production.yml`) runs the same deployment, with these differences:

| Topic | Azure DevOps |
|---|---|
| Trigger | `trigger: branches: include: [main]` with `paths` filters, and `pr: none` |
| Permissions | The project's build service identity needs **Contribute** permission on the repository to push the version commit, the tag and the `dbt-docs` branch, and read access to pull requests for the cleanup |
| Docs | Published by a script that commits `target/` to the `dbt-docs` branch, and also as a pipeline artifact (`PublishPipelineArtifact`) |
| Full refresh | [Commit markers](./feature-checks.md#variant-commit-markers-instead-of-labels) are read from every commit since the last deployment tag. Targeted models are refreshed before the blue/green run and excluded from it |
| Blue/green selector | `dbt-coves blue-green --staging-database <name> --dbt-selector="--defer --state logs -s @state:modified"`, so every parent of a rebuilt model is rebuilt in the same run |
| Failed deployment | A step with `condition: failed()` drops the staging database |
| PR database cleanup | Equivalent scripts with the same rules, using the Azure DevOps REST API with `System.AccessToken`. Each cleanup step uses `continueOnError: true`. Azure DevOps uses its own PR status names (active, completed, abandoned) for the same states |
