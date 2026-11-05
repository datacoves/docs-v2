---
title: "CI/CD Stage 15: Drop the PR Database of Abandoned PRs"
sidebar_label: "15 - Drop PR Database"
description: "How stage 15 of the Datacoves CI/CD pipeline drops the temporary PR database when a feature pull request is closed without merging, and how to run it manually."
sidebar_position: 3
---
# Stage 15: Drop PR database

Every feature pull request (PR) gets its own database, `<DATABASE>_PR_<pr number>`, created by [stage 10](./feature-checks.md). Stage 15 removes that database when it is no longer needed because the PR was **abandoned**.

## When it runs

| PR outcome | What happens to `<DATABASE>_PR_<n>` |
|---|---|
| Closed **without merging** (abandoned) | Stage 15 drops it immediately |
| **Merged** into the release branch | Stage 15 does nothing. The database is kept so QA can keep querying it while the release is being validated, and [stage 30](./deploy-to-production.md#pr-database-cleanup) drops it once the release that includes the PR is deployed to production |
| Still open | Kept |

## Steps

The job runs in the `datacoves/ci-basic-dbt-snowflake` image with `DATACOVES__MAIN__DATABASE` set to `<DATABASE>_PR_<n>`.

| # | Step | What it does |
|---|---|---|
| 1 | Checkout branch | Checks out the PR head commit |
| 2 | Set secure directory | Marks the workspace as a safe git directory inside the container |
| 3 | Install dbt packages | `dbt deps` |
| 4 | Drop PR database | `dbt run-operation drop_recreate_db --args '{db_name: <DATABASE>_PR_<n>, recreate: False}'` |

## In GitHub Actions

`15_drop_feature_db.yml` triggers on `pull_request` events of type `closed` for PRs into `release/**/*`. GitHub sends the same event for merged and abandoned PRs, so the job checks the `merged` flag of the event:

```yaml
drop-pr-db-on-close:
  if: github.event_name == 'workflow_dispatch' || github.event.pull_request.merged == false
```

Manual runs (`workflow_dispatch`) skip the `merged` check, but the workflow has no input for the PR number and builds the database name from `github.event.number`, which is empty in a manual run. To drop a specific PR database by hand, add a `pr_number` input to the workflow and use it in the database name, or run `dbt run-operation drop_recreate_db --args '{db_name: <DATABASE>_PR_<n>, recreate: False}'` from your Datacoves environment with a role that owns the database.

## In Azure DevOps

Azure Repos cannot trigger a pipeline when a PR is closed, so `15_cleanup_pr_database.yml` is triggered through a webhook:

1. In **Project Settings › Service connections**, create an **Incoming Webhook** service connection.
2. In **Project Settings › Service hooks**, create a **Web Hooks** subscription for the event **Pull request updated**, pointing at the webhook URL of that service connection. Set **Resource details to send** to **All**, so the payload includes the PR ID and status.
3. In the pipeline, declare the webhook as a resource and read the PR ID from its payload:

```yaml
resources:
  webhooks:
    - webhook: prupdatedwebhook
      connection: pr-updated-webhook

parameters:
  - name: prId
    displayName: "Pull Request ID (for manual runs only)"
    type: string
    default: "0"
```

The *Pull request updated* event fires for many changes (pushes, reviewers, completion), and the service hook cannot be reliably limited to abandoned PRs. The pipeline therefore reads `resource.status` from the webhook payload in a first step and sets an output variable (`should_drop`) that gates the remaining steps: the database is only dropped when the status is `abandoned`.

For manual runs, start the pipeline and enter the PR ID in the `prId` parameter. Manual runs skip the status check and always drop the database.
