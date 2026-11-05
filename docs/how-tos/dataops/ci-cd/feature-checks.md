---
title: "CI/CD Stage 10: Feature Branch dbt and Airflow Checks"
sidebar_label: "10 - Feature Checks"
description: "Step-by-step reference for stage 10 of the Datacoves CI/CD pipeline: PR database creation, Slim CI dbt builds, governance checks, and Airflow DAG validation."
sidebar_position: 2
---
# Stage 10: Feature checks

Stage 10 runs when a developer opens or updates a pull request (PR) from a feature branch into a release branch. It builds the change in an isolated database, enforces governance rules and validates Airflow DAGs, so reviewers only look at code that already works.

In the GitHub Actions reference there are two workflows with the same number, one per area of the repository:

| Workflow | Runs when the PR changes | What it checks |
|---|---|---|
| `10_feature_dbt_checks.yml` | `transform/**` | dbt build, tests and governance |
| `10_feature_airflow_checks.yml` | `orchestrate/**` | Airflow DAG load time, variable usage and custom DAG tests |

Both workflows:

- Trigger on `pull_request` into `release/**/*` and can also be run manually (`workflow_dispatch`).
- Use a `concurrency` group per PR with `cancel-in-progress: true`, so a new push cancels the run that is still in progress for the same PR.
- Start with the [branch validation](./branch-validation.md) job. If it fails, the dbt or Airflow job is skipped.
- End with a status job that posts (and updates) a comment on the PR summarizing each job's result.

## dbt checks

The `dbt` job runs in the `datacoves/ci-basic-dbt-snowflake` image, with `transform/` as the working directory and `automate/dbt` as `DBT_PROFILES_DIR`.

The key setting is the database name: the job sets `DATACOVES__MAIN__DATABASE` to `<DATABASE>_PR_<pr number>`, so every model in the PR is built in a database that belongs to that PR only.

### Steps

Steps run in order and the job stops at the first failure. "Always" in the last column means the step has no extra condition.

| # | Step | What it does | Runs when |
|---|---|---|---|
| 1 | Checkout branch | Checks out the PR head commit with full history (`fetch-depth: 0`) | Always |
| 2 | Set secure directory | Marks the workspace as a safe git directory inside the container | Always |
| 3 | List of files changed | Prints `git diff --name-status` against the target branch, for the log | Always |
| 4 | Install dbt packages | `dbt deps` | Always |
| 5 | Create PR database | `dbt run-operation create_database` creates `<DATABASE>_PR_<n>` if it does not exist yet. Later pushes to the same PR reuse it | Always |
| 6 | Get prod manifest | `automate/dbt/get_artifacts.sh` runs the `get_last_artifacts` macro to download the production `manifest.json` and `catalog.json` from a Snowflake stage into `logs/`. Sets the outputs `manifest_found` and `catalog_found` | Always |
| 7 | Clone incremental models | `dbt clone` of incremental models and snapshots that are downstream of the change and already exist in production (`state:modified+,config.materialized:incremental,state:old`), so they keep their history instead of being rebuilt from scratch | Manifest found |
| 8 | Governance build with empty models | `dbt build --empty` creates every affected model with no rows. This is enough to compile the SQL and run hooks, and it fails fast before spending warehouse time. Uses `--defer --state logs --select state:modified+` when the manifest exists, or the whole project when it does not | Always |
| 9 | Generate docs | `dbt-coves generate docs --merge-deferred --state logs` merges the production catalog with the PR catalog, or `dbt docs generate` when no production catalog exists. The catalog is needed by the governance checks | Always |
| 10 | Run governance checks | `pre-commit run --from-ref origin/<target> --to-ref HEAD` runs the hooks in `.pre-commit-config.yaml` only on the files changed in the PR: [dbt-checkpoint](https://github.com/dbt-checkpoint/dbt-checkpoint) (descriptions, property files, columns), [SQLFluff](https://docs.sqlfluff.com/) and yamllint | Always |
| 11 | dbt build | The real `dbt build --fail-fast`: Slim CI (`--defer --state logs --select state:modified+`) when the manifest exists, or a full build when it does not | Always |
| 12 | Check orphaned schemas | `automate/dbt/orphaned_schemas.py` compares the production manifest with the PR manifest and reports schemas that dbt will stop managing once the PR is deployed. The result is posted as a PR comment | Manifest found, even if a previous step failed |
| 13 | Grant access to PR database | `grant_access_to_pr_database` grants usage on the database and its schemas, and select on its tables and views, so reviewers can query the PR database | Always |
| 14 | Drop PR database on failure | Drops the PR database if the grants failed. A failure here usually means models were built into the wrong schema | `DATACOVES__DROP_DB_ON_FAIL` is `true` and step 13 failed |

:::note
The Balboa workflow also contains steps that are specific to that demo project, such as building an observability model first and building dynamic tables separately (`--empty` does not support them). Keep or remove steps like these based on your own project.
:::

### Slim CI and the production manifest

Steps 7, 8 and 11 rely on the production `manifest.json` that [stage 30](./deploy-to-production.md) uploads after every deployment. With it, dbt builds only what changed and its downstream models, and **defers** every unchanged upstream reference to the production database. Without it (for example, on the very first run), the job falls back to building the whole project.

### Full refresh

To build incremental models from scratch, add the `full-refresh` label to the PR. The job then appends `--full-refresh` to the `dbt build` commands.

Adding the label does not start a new run of stage 10 by itself: the label is read the next time the workflow runs, after a new push or when you re-run it. The label on a feature PR only affects that PR's database. To run a full refresh in production, add the label to the release PR into `main` (see [stage 20](./release-checks.md#why-a-deploy-marker-in-the-pr-title)).

## Airflow checks

The `airflow` job runs in the `datacoves/ci-airflow-dbt-snowflake` image, with `AIRFLOW__CORE__DAGS_FOLDER` pointing at `orchestrate/dags`.

| # | Step | What it does |
|---|---|---|
| 1 | Checkout branch | Checks out the PR head commit |
| 2 | Test DAG load time and variable usage | Runs `/usr/app/test_dags.py`, included in the image, with `--dag-loadtime-threshold 1` (fails DAGs that take more than one second to parse) and `--check-variable-usage` (fails on `Variable.get()` calls at the top level of a DAG file, outside `@task` functions). `--write-output` writes the results to a Markdown file |
| 3 | Comment results | Posts the load-time results as a PR comment when step 2 succeeds |
| 4 | Custom Airflow validation tests | Runs `pytest` on `orchestrate/test_dags/validate_dags.py`, your own DAG tests. The Balboa example checks for import errors, approved tags (`APPROVED_TAGS`), `catchup=False`, and allowed operators (`ALLOWED_OPERATORS`) |
| 5 | Comment results | Posts the custom test results as a PR comment, even when the tests fail |

See [Test Airflow DAGs in your CI/CD pipeline](/docs/how-tos/airflow/dags/test-dags) for how to write the custom tests.

## In Azure DevOps

The Azure DevOps implementation (`.azure-pipelines/10_feature_dbt_checks.yml`) follows the same steps, with these differences:

| Topic | Azure DevOps |
|---|---|
| Trigger | `trigger: none` and `pr: none`. YAML PR triggers are not supported for Azure Repos, so the pipeline is attached to the release branches through **Branch Policies › Build Validation** |
| Path filtering | Done by a `check_changes` step in the validation job: it runs `git diff --name-only` for `transform/` and `automate/dbt/` and sets `run_dbt` as an output variable. The dbt job only runs when `run_dbt` is `true` |
| Commit that is built | Azure DevOps checks out the merge of the source branch into the target branch, which includes release changes that are not in `main` yet. A step runs `git checkout --detach $(System.PullRequest.SourceCommitId)` so `state:modified` only reflects the PR's own changes |
| Database name | Set from `$(System.PullRequest.PullRequestId)` |
| Outputs | `manifest_found` and `catalog_found` are set with `##vso[task.setvariable]` and used in step `condition:` expressions |
| Drop on failure | The drop step uses `condition: failed()`, so the PR database is dropped when any previous step fails |
| Airflow checks | Not included in that implementation. Add a second job using the Airflow CI image if you need them |
| PR feedback | Results are shown as the PR's build validation status instead of PR comments |

### Variant: commit markers instead of labels

Instead of the `full-refresh` PR label, the Azure DevOps implementation reads markers from the PR's commit messages:

| Marker | Effect |
|---|---|
| `[full-refresh]` | Full-refresh build of the whole project |
| `[full-refresh: model_a, model_b]` | Full refresh of only the listed models. Models that do not exist in production yet are ignored, because they are built from scratch anyway (`automate/dbt/filter_full_refresh_models.py`) |
| `[fresh-db]` | Drops and recreates the PR database before building. It is only read from commits pushed since the previous run, so it fires once instead of on every push |

`automate/git/parse_commit_markers.py` parses the markers, and `automate/git/update_pr_full_refresh.py` copies them into the PR description. That way the markers survive a squash merge and reach the [release checks](./release-checks.md) and the [deployment](./deploy-to-production.md).

### Variant: `@state:modified` selector

The Azure DevOps implementation selects `@state:modified` instead of `state:modified+`. The `@` operator builds the changed models, their descendants, **and every parent of those descendants**. Relationship tests then compare tables that were built in the same run, instead of comparing a freshly built child against an older production parent, at the cost of a larger build.
