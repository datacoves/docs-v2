---
title: "Customize the Datacoves CI/CD Pipelines"
sidebar_label: "Customize the Pipelines"
description: "How to adapt the Datacoves CI/CD pipelines: change branch prefixes, enforce branch name formats, tune PR database cleanup, update CI images, and add new stages."
sidebar_position: 6
---
# Customize the CI/CD pipelines

The pipelines are plain YAML files and scripts in your repository, so every rule can be changed. This page lists the most common changes and every file you need to touch for each one.

| Folder | Contents |
|---|---|
| `.github/workflows/` or `.azure-pipelines/` | Pipeline definitions, one file per stage |
| `automate/git/` | Scripts that talk to git and the Git provider API: branch validation, PR database cleanup |
| `automate/dbt/` | Scripts that run around dbt: artifacts, versioning, orphaned schemas, `profiles.yml` |
| `transform/macros/tooling/` | dbt macros used by the pipelines: database creation, clone, swap, grants, artifacts |

## Change branch prefixes

To use different prefixes, for example `fb/`, `rb/` and `hf/` instead of `feature/`, `release/` and `hotfix/`, change them in **all** of these places. If you only change the validator, the pipelines will stop triggering for the new branch names.

1. **`automate/git/branch_validator.py`**: update the keys and allowed targets in `BRANCH_RULES`, and the list in `VALID_TARGET_PREFIXES`:

   ```python
   BRANCH_RULES = {
       "fb": ("fb", "rb"),
       "rb": ("main",),
       "hf": ("main",),
       "infra": ("main",),
   }

   VALID_TARGET_PREFIXES = ("fb", "rb", "main")
   ```

2. **Pipeline triggers** for the release branch:
   - GitHub Actions: the `branches:` filter of stages 10 and 15, for example `- 'rb/**/*'` instead of `- 'release/**/*'`.
   - Azure DevOps: the **Branch Policies › Build Validation** of the release branches, which must point at the stage 10 pipeline.

3. **PR database cleanup scripts** used by [stage 30](./deploy-to-production.md#pr-database-cleanup):
   - `automate/git/get_feature_pr_ids.py`: the `release/` check of the deployed branch and the `feature/` filter of the PRs merged into it.
   - `automate/git/sweep_stale_pr_databases.py`: the `release/` check of the branch each PR was merged into.

4. **Docs and onboarding material** that tell developers how to name branches.

:::tip
Prefix matching in `branch_validator.py` does not include the `/`, so a branch named `featurex` passes as `feature`. If you need stricter names, use the format validation below.
:::

## Enforce a branch name format

To require more than a prefix, for example a ticket number, a date and the developer's initials, replace the prefix rules with one regular expression per prefix, as described in [Branch validation](./branch-validation.md#variant-enforce-a-branch-name-format). Include a readable format and an example for each prefix, so the error message tells developers exactly how to rename their branch.

## Change which merges are allowed

Edit the tuple of allowed targets for each prefix in `BRANCH_RULES`. For example, to stop feature branches from merging into other feature branches:

```python
"feature": ("release",),
```

To add a new branch type, add it to `BRANCH_RULES`, and to `VALID_TARGET_PREFIXES` if other branches can merge into it. Then decide which stage runs for its PRs: stage 10 runs for PRs into release branches, and stage 20 for PRs into `main`.

## Tune PR database cleanup

The sweep thresholds are environment variables of the `Sweep: identify orphaned PR databases` step in stage 30:

```yaml
env:
  PR_MAX_AGE_DAYS: "15"       # always keep databases up to this age
  PR_MAX_IDLE_DAYS: "15"      # after that, keep only if queried in this many days
  PR_HARD_MAX_AGE_DAYS: "45"  # drop past this age, even if in use
```

See [stage 30](./deploy-to-production.md#2-sweep) for the full decision rules. To drop PR databases as soon as the PR is closed, merged or not, remove the `merged == false` condition from [stage 15](./drop-pr-database.md#in-github-actions).

## Change the trigger paths

Each pipeline only runs when certain folders change. If your repository uses a different layout, update the filters:

| Stage | GitHub Actions | Azure DevOps |
|---|---|---|
| 10 dbt | `paths: - transform/**/*` | The `git diff` path list of the `check_changes` step |
| 10 Airflow | `paths: - orchestrate/**/*` | Not included by default |
| 20 | `paths: - transform/**/*` | Path filter of the Build Validation policy, if any |
| 30 | `paths:` under `on: push` | `trigger: paths: include:` |

Keep in mind that a run with no changed files in those paths will not trigger the pipeline, for example an empty commit. See [Trigger CI/CD without code changes](/docs/how-tos/dataops/trigger-cicd-workflow).

## Update the CI images

All dbt jobs use `datacoves/ci-basic-dbt-snowflake`, and the Airflow job uses `datacoves/ci-airflow-dbt-snowflake`. When your Datacoves environment is upgraded, update the image tag in every pipeline file so CI runs the same dbt and Airflow versions as your developers. Also keep the dbt versions in the SQLFluff hook of `.pre-commit-config.yaml` aligned with the image.

## Adjust the Airflow checks

- **DAG load time:** change `--dag-loadtime-threshold` (in seconds) in the `test_dags.py` step of `10_feature_airflow_checks.yml`.
- **Variable usage:** remove `--check-variable-usage` to allow `Variable.get()` outside `@task` functions. Keeping it is recommended, because top-level variable reads slow down DAG parsing.
- **Custom rules:** edit `orchestrate/test_dags/validate_dags.py`, for example the `APPROVED_TAGS` set and the `ALLOWED_OPERATORS` list. See [Test Airflow DAGs in your CI/CD pipeline](/docs/how-tos/airflow/dags/test-dags).

## Use commit markers for full refresh

The GitHub Actions reference uses the `full-refresh` PR label. If you prefer to control full refreshes from commit messages, or need to refresh only some models, port the [commit marker variant](./feature-checks.md#variant-commit-markers-instead-of-labels): add `parse_commit_markers.py`, `filter_full_refresh_models.py` and a script that copies the markers into the PR description, then gate the `--full-refresh` steps on their outputs.

## Add a new stage

Pick a number in the gap that matches when the new pipeline should run, so the folder keeps reading in lifecycle order:

| Range | Use for | Example |
|---|---|---|
| 10-14 | Checks on feature PRs into a release branch | `12_feature_python_checks.yml` for a loader codebase |
| 15-19 | Cleanup when a feature PR closes | |
| 20-29 | Checks on PRs into `main` | `25_release_security_checks.yml` |
| 30-39 | Deployment and post-deployment steps on `main` | `35_refresh_bi_extracts.yml` |
| 90-99 | Scheduled or independent jobs | `99_build_custom_image.yml` |

For checks on PRs, add the [branch validation](./branch-validation.md) job first and make the other jobs depend on it, as the existing stages do.
