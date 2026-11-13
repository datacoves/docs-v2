---
title: "Trigger CI/CD Pipelines Without Code Changes"
sidebar_label: "Trigger CI/CD"
description: "How to manually trigger a CI/CD workflow in Datacoves without committing code changes, using an empty commit or repository dispatch event."
sidebar_position: 72
---
# How to trigger a CI/CD run without code changes

Sometimes you need to re-run your CI/CD pipeline without making any actual code changes. Common scenarios include:

- A previous CI/CD run failed due to a transient error (network timeout, service unavailability)
- You need to rebuild/redeploy after an infrastructure change
- You want to verify the pipeline is working correctly
- External dependencies have been updated and you need to refresh the build

## Using an empty commit

Git allows you to create a commit with no file changes using the `--allow-empty` flag. This commit will trigger your CI/CD pipeline just like any other commit.

```bash
git commit --allow-empty -m "trigger workflow"
git push
```

:::warning

How path filters (`paths:`) treat an empty commit depends on the event that triggers the workflow:

- **`push`**: the filter only looks at the files changed by the push. An empty commit changes no files, so a workflow with path filters is **not** triggered.
- **`pull_request`**: the filter looks at all the files changed in the pull request. An empty commit pushed to the PR's branch triggers the workflow if the PR changes any file that matches the paths.

For example, this deployment workflow will not be triggered by an empty commit pushed to `main`:

```yaml
on:
  push:
    branches:
      - main
    paths:
      - .github/workflows/**
      - automate/**
      - transform/**
```

For a `push` workflow with path filters, you'll need to either make an actual file change or modify the workflow to support manual triggers using `workflow_dispatch`.

:::

## Best practices

**Use a descriptive commit message** - Instead of a generic message, describe why you're triggering the workflow:

```bash
git commit --allow-empty -m "Re-trigger CI after fixing Snowflake connection"
git commit --allow-empty -m "Rebuild to pick up updated dbt packages"
git commit --allow-empty -m "Re-run tests after transient failure"
```

**Consider your branch** - The empty commit will trigger CI/CD for whatever branch you're on. Make sure you're on the correct branch before running the command.

**Check the pipeline first** - Before creating an empty commit, verify that the issue causing the previous failure has been resolved.
