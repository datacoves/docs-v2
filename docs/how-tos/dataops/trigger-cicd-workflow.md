---
title: Trigger CI/CD without code changes
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

## Best practices

**Use a descriptive commit message** - Instead of a generic message, describe why you're triggering the workflow:

```bash
git commit --allow-empty -m "Re-trigger CI after fixing Snowflake connection"
git commit --allow-empty -m "Rebuild to pick up updated dbt packages"
git commit --allow-empty -m "Re-run tests after transient failure"
```

**Consider your branch** - The empty commit will trigger CI/CD for whatever branch you're on. Make sure you're on the correct branch before running the command.

**Check the pipeline first** - Before creating an empty commit, verify that the issue causing the previous failure has been resolved.
