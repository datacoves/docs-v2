---
title: "CI/CD Stage 20: Release Branch Checks in a QA Database"
sidebar_label: "20 - Release Checks"
description: "Step-by-step reference for stage 20 of the Datacoves CI/CD pipeline: building a release candidate in a QA database cloned from production before merging to main."
sidebar_position: 4
---
# Stage 20: Release checks

Stage 20 runs on every pull request (PR) that targets `main`: release branches, and also hotfix and infra branches, which skip the release branch. It builds all the changes in the release together, against a copy of production, so the release is validated as a whole before it is deployed.

In the GitHub Actions reference, `20_release_dbt_checks.yml` triggers on `pull_request` into `main` for changes in `transform/**`, on the event types `opened`, `synchronize`, `labeled` and `unlabeled`. It can also be run manually. A PR into `main` that changes nothing under `transform/`, such as an infra PR that only edits a workflow, does not trigger it, so that PR gets no branch validation either.

## Jobs

| Job | What it does | Runs when |
|---|---|---|
| Add deploy marker | Appends `[deploy:full-refresh]` to the PR title and posts a comment | The `full-refresh` label is added |
| Remove deploy marker | Removes `[deploy:full-refresh]` from the PR title and posts a comment | The `full-refresh` label is removed |
| [Validate branch](./branch-validation.md) | Checks prefix, merge direction and that the branch is up to date with `main` | Always |
| dbt | Builds the release in the QA database (steps below) | The PR is opened or updated, or the `full-refresh` label is added |
| Status | Posts a PR comment with the result of every job | Always |

### Why a deploy marker in the PR title

[Stage 30](./deploy-to-production.md) runs after the merge, when the PR and its labels are no longer available to the pipeline. It only sees the merge commit. With GitHub's default merge settings, the PR title is part of the merge commit message (and is the whole message of a squash merge), so writing `[deploy:full-refresh]` in the title is how the label's intent travels to the production deployment. If your repository customizes the default merge or squash commit message, make sure it still includes the PR title.

## QA databases

The release is built in a QA database, not in production and not in the feature PR databases:

| Database | Role |
|---|---|
| `<DATABASE>` | Production, the source of the clone. Never modified by this stage |
| `<DATABASE>_QA_TEMP` | Temporary clone where the release is built |
| `<DATABASE>_QA` | Stable QA database that users query to validate the release |

The first run of the day clones production into `_QA_TEMP`, builds the release there, and then swaps it into `_QA`. This keeps `_QA` usable while the build is running, and gives QA a database with fresh production data. Later runs on the same day (for example, after a fix is pushed to the release branch) build directly in `_QA`, which avoids cloning production again.

:::note
There is a single `_QA` database for every PR into `main`. If a release PR and a hotfix PR run stage 20 on the same day, both build into the same `_QA`, and it reflects the changes of both.
:::

## dbt steps

| # | Step | What it does | Runs when |
|---|---|---|---|
| 1 | Checkout, set secure directory, list changed files, `dbt deps` | Same as [stage 10](./feature-checks.md#steps) | Always |
| 2 | Check if QA was created today | `check_database_created_today` returns `true` when `<DATABASE>_QA` was created today | Always |
| 3 | Choose the target database | Sets `DATACOVES__MAIN__DATABASE` to `<DATABASE>_QA` if it was created today, otherwise to `<DATABASE>_QA_TEMP` | Always |
| 4 | Clone production | `clone_database` drops `<DATABASE>_QA_TEMP` if it exists and recreates it as a zero-copy clone of `<DATABASE>` | QA not created today |
| 5 | Get prod manifest | `get_artifacts.sh` downloads the production manifest for Slim CI | Always |
| 6 | dbt build | `dbt build --fail-fast --defer --state logs --select state:modified+`, or a full build when no manifest is found. Adds `--full-refresh` when the PR has the `full-refresh` label | Always |
| 7 | Swap and drop | `swap_database` swaps `_QA_TEMP` with `_QA` (creating `_QA` the first time), then drops the old database, now named `_QA_TEMP` | QA not created today |
| 8 | Grant access | `grant_db_usage` restores the grants on `<DATABASE>_QA` so QA users can query it | QA not created today |

## In Azure DevOps

The Azure DevOps implementation (`.azure-pipelines/20_release_dbt_checks.yml`) runs the same QA database logic, with these differences:

| Topic | Azure DevOps |
|---|---|
| Trigger | `pr: none`; attached to `main` through **Branch Policies › Build Validation** |
| Database names | The production, QA and QA temp database names are defined as pipeline variables, so they do not need to follow the `_QA` / `_QA_TEMP` suffix convention |
| Which branches build | The dbt job only runs for release and hotfix branches. Infra branch PRs pass after branch validation |
| Full refresh | Uses [commit markers](./feature-checks.md#variant-commit-markers-instead-of-labels) instead of a PR label, including targeted refresh of specific models |
| Selector | `@state:modified` instead of `state:modified+` |
| "Created today" tracking | After the swap, a `set_database_cloned_today` macro records that QA was refreshed today |

### Variant: block dbt changes from infra branches

Infra branches go straight to `main` and are meant for pipeline and tooling changes. To guarantee that no dbt model change skips the release process, the Azure DevOps implementation adds a step to the validation job that fails the PR when an infra branch changes anything under `transform/`:

```bash
CHANGED=$(git diff --name-only origin/$TARGET_BRANCH HEAD -- transform/ ':(exclude)transform/macros/tooling/')
if [ -n "$CHANGED" ]; then
  echo "ERROR: infra branches must not modify the transform/ folder (except transform/macros/tooling/)."
  exit 1
fi
```

The check excludes `transform/macros/tooling/`, which holds the dbt macros that the pipelines themselves use, such as database creation, clone, swap and PR database cleanup. That way an infra PR can change a pipeline and the macro it calls together. Every other change under `transform/`, such as models, other macros or `dbt_project.yml`, still has to go through a feature branch and a release. If you exclude other folders, keep them limited to code that only the pipelines run.
