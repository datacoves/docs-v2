---
title: Rollback Strategy
sidebar_label: Rollback Strategy
sidebar_position: 132
---

# Rollback Strategy

Datacoves manages change across three distinct platform layers: infrastructure, platform services, and customer image. Each layer has different rollback considerations, summarized below.

| Layer | Rollback Capability | Responsibility |
|-------|-------------------|----------------|
| Infrastructure | Cannot be undone once applied | Datacoves + Customer (collaborative upgrade, no rollback) |
| Platform Services (Airflow, Python, etc.) | Cannot be rolled back | Datacoves Engineering |
| Customer Image (dbt, packages, libraries) | Technically feasible but strongly discouraged | Customer-initiated, Datacoves-executed |

## Infrastructure Layer

The infrastructure layer includes cloud provider services and container orchestration systems (such as Kubernetes) that host the Datacoves platform. Datacoves works collaboratively with the customer's team to plan and execute infrastructure upgrades. Both parties participate in testing prior to applying changes.

:::warning

Once an infrastructure upgrade is applied, it cannot be undone. Customers and Datacoves should ensure thorough testing before proceeding with any infrastructure-level change.

:::

## Platform Services Layer

Platform-level services, such as Airflow versions, Python versions, and other core components managed by Datacoves, follow a forward-fix model. These versions cannot be rolled back once upgraded.

If a defect or regression is identified following a platform release, the Datacoves engineering team will produce and deploy a **hotfix** as a new forward release that corrects the identified problem, ensuring the platform remains in a consistent, forward-progressing state.

### Defect Resolution Process

1. The customer reports the issue through the established support channel.
2. The Datacoves engineering team triages the issue and determines severity.
3. A hotfix is developed, tested, and deployed as a new forward release.
4. The customer is notified upon successful deployment and resolution.

## Customer Image Layer

The customer image defines the specific versions of packages and libraries used in the customer's environment, including both standard components (such as dbt) and any additional tools. For example, if dbt is upgraded from version 1.10 to 1.11 and an issue is discovered, the image can be reverted to use dbt 1.10.

### Cascading Impact Risk

:::warning

While version rollback is technically feasible at this layer, **it is strongly discouraged** due to the risk of cascading disruptions in multi-user environments.

:::

In enterprise environments where many users share the same Datacoves instance, rolling back a package version can produce unintended effects across the organization. Consider the following scenario:

1. A customer requests an upgrade to Package X (a third-party dependency).
2. After deployment, the new version introduces a breaking change that affects certain pipelines.
3. **User A** detects the issue early and modifies their code to accommodate the new version, restoring normal execution.
4. **User B**, also affected, requests a rollback of Package X to the prior version.
5. If the rollback is executed, **User A's code**, which was adapted to the newer version, now breaks under the restored older version.

Additionally, rolling back a single package may introduce dependency conflicts. For example, if both a Snowflake connector library and dbt were upgraded together because they share a common dependency, rolling back only dbt could create an incompatibility between the two libraries.

In an organization with dozens or hundreds of users on the platform concurrently, this type of cascading disruption can propagate rapidly and unpredictably.

### Recommended Approach

Rather than reverting a shared package version, the recommended course of action is:

1. **Test before promoting to production.** Customers who maintain a separate testing cluster or environment can identify issues before they reach production users.
2. **Apply targeted fixes.** Affected users should update their own code to accommodate the new package version, preserving environmental consistency and avoiding new failures for users who have already adapted.

A version rollback should be considered only as a **last resort**.

### Rollback Process (Last Resort) {#pis-rollback-process}

If a rollback is determined to be necessary:

1. The customer identifies the package and the target version to revert to.
2. The customer submits a rollback request through the support channel.
3. Datacoves validates the request and confirms target version availability, including a review of potential dependency conflicts with other libraries in the image.
4. The image configuration is updated and deployed to the customer's environment.
5. The customer validates the rollback and confirms resolution.

:::info

If a rollback introduces new issues (for example, breaking other users' workflows or creating dependency conflicts), the customer assumes responsibility for resolving those downstream effects.

:::

## Summary of Responsibilities

| Scenario | Datacoves | Customer |
|----------|-----------|----------|
| Infrastructure upgrade | Collaborate on planning and execution | Participate in testing before applying changes |
| Infrastructure rollback | Cannot be undone | Cannot be undone |
| Platform service defect after release | Develop and deploy a hotfix as a forward release | Report the issue through the support channel |
| Customer image package version issue | Advise forward-fix approach; execute rollback only as a last resort with dependency review | Identify the target version, submit the request, and accept responsibility for downstream effects |