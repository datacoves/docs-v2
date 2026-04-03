---
title: Rollback Strategy
sidebar_label: Rollback Strategy
sidebar_position: 132
---

# Rollback Strategy

Datacoves manages change across three distinct platform layers: infrastructure, application, and custom customer images. Each layer has different rollback considerations, summarized below.

| Layer | Rollback Capability | Responsibility |
|-------|-------------------|----------------|
| Infrastructure | Not managed by Datacoves | Cloud provider / Customer infrastructure team |
| Datacoves Application | Forward-fix model (hotfix) | Datacoves Engineering |
| Custom Customer Image | Technically feasible but strongly discouraged | Customer-initiated, Datacoves-executed |

## Infrastructure Layer

The infrastructure layer includes cloud provider services and container orchestration systems (such as Kubernetes) that host the Datacoves platform. Changes at this layer, including version upgrades, configuration modifications, and scaling adjustments, are managed by the customer's infrastructure team or cloud provider.

:::info

Datacoves does not have control over infrastructure-level changes and cannot provide a rollback plan for this layer. For example, if the underlying Kubernetes cluster is upgraded from one version to another, that operation falls outside the scope of Datacoves platform management. Customers should consult their cloud provider's documentation for rollback procedures at this layer.

:::

## Datacoves Application Layer

The Datacoves application follows a forward-coding development model. All changes, including new features, enhancements, and bug fixes, are implemented as forward-moving code changes. The platform does not support reverting to a prior application version.

If a defect or regression is identified following a release, the Datacoves engineering team will produce and deploy a **hotfix** as a new forward release that corrects the identified problem, ensuring the codebase remains in a consistent, forward-progressing state.

### Defect Resolution Process

1. The customer reports the issue through the established support channel.
2. The Datacoves engineering team triages the issue and determines severity.
3. A hotfix is developed, tested, and deployed as a new forward release.
4. The customer is notified upon successful deployment and resolution.

## Custom Customer Image Layer

Custom customer images allow customers to specify particular versions of third-party packages and tools that are not included in the standard Datacoves distribution. For example, a customer may request a specific version of the `elementary` package to be included in their environment.

### Cascading Impact Risk

:::warning

While version rollback is technically feasible at this layer, **it is strongly discouraged** due to the risk of cascading disruptions in multi-user environments.

:::

In enterprise environments where many users share the same Datacoves instance, rolling back a third-party package version can produce unintended effects across the organization. Consider the following scenario:

1. A customer requests an upgrade to Package X (a third-party dependency).
2. After deployment, the new version introduces a breaking change that affects certain pipelines.
3. **User A** detects the issue early and modifies their code to accommodate the new version, restoring normal execution.
4. **User B**, also affected, requests a rollback of Package X to the prior version.
5. If the rollback is executed, **User A's code**, which was adapted to the newer version, now breaks under the restored older version.

In an organization with dozens or hundreds of users on the platform concurrently, this type of cascading disruption can propagate rapidly and unpredictably.

### Recommended Approach

Rather than reverting a shared package version, the recommended course of action is for affected users to apply targeted fixes to their own code to accommodate the updated package. This preserves environmental consistency and avoids introducing new failures for users who have already adapted. A version rollback should be considered only as a **last resort**, after a thorough impact assessment has confirmed that no other users have made accommodations for the current version.

### Rollback Process (Last Resort)

If a rollback is determined to be necessary after impact assessment:

1. The customer identifies the package and the target version to revert to.
2. The customer submits a rollback request through the support channel.
3. Datacoves validates the request and confirms target version availability.
4. Datacoves performs an impact assessment across the customer's user base.
5. The image configuration is updated and deployed to the customer's environment.
6. The customer validates the rollback and confirms resolution.

## Summary of Responsibilities

| Scenario | Datacoves | Customer |
|----------|-----------|----------|
| Infrastructure change requires rollback | Outside Datacoves scope | Coordinate with cloud provider or internal infrastructure team |
| Application defect after release | Develop and deploy a hotfix as a forward release | Report the issue through the support channel |
| Custom image package version issue | Advise forward-fix approach; execute rollback only as a last resort after impact assessment | Identify the target version and submit the request |

## Additional Considerations

- Custom image rollbacks are limited to packages and versions that were previously configured and validated. Rolling back to an untested version may require additional validation.

:::tip

Customers are encouraged to maintain their own change logs and version records for custom image configurations to facilitate efficient communication with Datacoves support.

:::