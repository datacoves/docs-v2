---
title: VPC Deployment
sidebar_position: 131
---
# VPC Deployment

Datacoves is designed to work on Public or Private Virtual Clouds.
The following diagram shows the main services required by Datacoves when deployed on a VPC.

## Datacoves Architecture

![Datacoves Architecture](./assets/datacoves-architecture.png)

## Dependencies

Datacoves can be deployed on AWS, Azure or Google Cloud.

Here is the list of services required, each cloud provider offers the service with a different name/brand.


| Service      |  Purpose        |  Requirements    |   Quantity |
|--------------|-----------------|--------------------------|------------|
| Database | Datacoves core services | PostgreSQL > v.14, Minimum 2vcpu, 16Gb memory __(*)__ | 1 server |
| Database | Datacoves stack services | PostgreSQL > v.14, Minimum 4vcpu, 32Gb memory __(*)__ | 1 server |
| Blob storage |  DBT artifacts  |  N/A                     | 1 bucket         |
| Blob storage |  Grafana logs   |  Lifetime policy with 30 days retention                     | 1 bucket         |
| Blob storage |  Airflow DAGs   |  N/A  | 1 bucket per Airflow instance         |
| Blob storage |  Airbyte logs   |  N/A  | 1 bucket per Airbyte instance         |
| Blob Storage |  Airflow logs   |  N/A  | 1 bucket per Airflow instance         |
| OIDC provider | Datacoves SSO | Oauth 2.0 OIDC compliant provider | 1 provider (optional) |
| Managed Kubernetes | Runs the platform | > v1.34 | Clusters are a minimum of 4 servers, sizing varies |
| Git server | DBT development version control | > v2.33 | 1 server, or github/gitlab/etc. |
| CI/CD server |  DBT development |  N/A                     | 1 server, or github/gitlab/etc.         |
| HTTPS Certificate | Security | N/A | Two certificates are needed; datacoves.yourdomain.com and *.datacoves.yourdomain.com. Certbot is supported. |
| DNS Entries | Host Resolution | N/A | Exact configuration varies per cloud provider |

__(*)__ min. requirements may vary depending on the number of environments. For smaller installations, only one database server is needed.

### Optional dependencies

| Service      |  Purpose        |  Requirements    |   Quantity |
|--------------|-----------------|--------------------------|------------|
| Docker Registry |  Docker images registry  |  Any docker API compliant image registry  | 1 service account |
| SMTP account |  Airflow notifications  |  N/A                     | 1 service account         |
| Slack account |  Airflow notifications  |  N/A                     | 1 account         |
| MS Teams account |  Airflow notifications  |  N/A                     | 1 account         |


