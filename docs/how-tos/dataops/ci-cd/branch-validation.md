---
title: "CI/CD Branch Validation: Naming and Merge Rules"
sidebar_label: "Branch Validation"
description: "How the Datacoves branch validator enforces branch prefixes, merge direction and up-to-date branches in stages 10 and 20 of the CI/CD pipeline."
sidebar_position: 1
---
# Branch validation

Before any dbt or Airflow check runs, stages [10](./feature-checks.md) and [20](./release-checks.md) run a `validate-branch` job. It executes `automate/git/branch_validator.py`, and the dbt and Airflow jobs depend on it: if the validation fails, they are skipped.

## What it checks

The validator runs three checks, in this order:

1. **Source branch prefix.** The PR's source branch must start with one of the allowed prefixes: `feature`, `release`, `hotfix` or `infra`. The target branch must start with `feature`, `release` or `main`.
2. **Merge direction.** Each source prefix can only merge into specific targets.
3. **Up to date with `main`.** The source branch must contain every commit in `main`. This check always compares against `main`, even when the PR targets a release branch, so merge conflicts are resolved by the developer on the feature branch, before they reach the release.

If the source and target branches are the same, validation is skipped.

### Merge rules

The rules live in the `BRANCH_RULES` dictionary at the top of the script:

```python
# Allowed merge targets per source branch prefix
BRANCH_RULES = {
    "feature": ("feature", "release"),
    "release": ("main",),
    "hotfix": ("main",),
    "infra": ("main",),
}

VALID_TARGET_PREFIXES = ("feature", "release", "main")
```

| Source prefix | Allowed targets |
|---|---|
| `feature` | `feature`, `release` |
| `release` | `main` |
| `hotfix` | `main` |
| `infra` | `main` |

Prefixes are matched case-insensitively and longest-first, so a short prefix never shadows a longer one.

## Error messages

| Message | Cause | Fix |
|---|---|---|
| `Source branch must start with one of: ...` | The branch name does not use an allowed prefix | Create a new branch with a valid prefix and open a new PR |
| `Target branch must start with one of: ...` | The PR targets a branch that is not `feature`, `release` or `main` | Change the PR's target branch |
| `'feature' branch can only be merged to: feature, release` | The merge direction is not allowed (for example `feature` into `main`) | Target the correct branch, for example a release branch |
| `There are N commit(s) in the main branch that are not in source branch` | The source branch is behind `main` | Merge or rebase `main` into your branch and push |

## Required environment variables

| Variable | GitHub Actions | Azure DevOps |
|---|---|---|
| `SOURCE_BRANCH` | `${{ github.head_ref }}` | `$(System.PullRequest.SourceBranch)` |
| `TARGET_BRANCH` | `${{ github.base_ref }}` | `$(System.PullRequest.TargetBranch)` |
| Authentication | `GITHUB_TOKEN`, `GITHUB_REPOSITORY` (the up-to-date check uses the GitHub Compare API) | None (the up-to-date check uses `git rev-list` against `origin/main`, so the checkout needs `fetchDepth: 0`) |

The `refs/heads/` prefix that Azure DevOps adds to branch names is stripped by the script.

:::caution
For PR builds, Azure DevOps checks out a merge of the source branch into the target branch, not the source branch itself. If `git rev-list` counts from `HEAD`, it measures that merge commit, which already contains the target branch. For PRs into `main`, the check then always passes, and for PRs into a release branch it passes whenever the release branch is up to date. To check the source branch itself, count from the source commit instead: pass `$(System.PullRequest.SourceCommitId)` to the script and run `git rev-list --count <source commit>..origin/main`.
:::

## Variant: enforce a branch name format

The Azure DevOps implementation goes one step further and validates the **full branch name**, not just the prefix. Each prefix has a regular expression, a human-readable format and an example that is shown in the error message. For example:

```python
BRANCH_PATTERNS = {
    "fb": {
        "regex": re.compile(r"^fb/.+_\d{8}_[a-zA-Z]+$", re.IGNORECASE),
        "format": "fb/<jira or project>_yyyymmdd_<initials>",
        "example": "fb/PROJ-123_20250527_jd",
        "allowed_targets": ("fb", "rb"),
    },
    "rb": {
        "regex": re.compile(r"^rb/\d{2}-\d{8}$", re.IGNORECASE),
        "format": "rb/<two digits>-yyyymmdd",
        "example": "rb/01-20250527",
        "allowed_targets": ("main",),
    },
    # hf and infra follow the same structure
}
```

The format is checked on both the source and the target branch, and the `yyyymmdd` part must be a valid date. Use it when you want branch names to carry a ticket, date and owner. That implementation also uses shorter prefixes (`fb`, `rb`, `hf`, `infra`), which shows that the prefixes are fully configurable. See [Change branch prefixes](./customize.md#change-branch-prefixes).
