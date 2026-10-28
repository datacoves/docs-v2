---
title: Account Prerequisites for Setting Up Datacoves
sidebar_label: Account Pre-reqs
description: "What you need before your Datacoves setup call: data warehouse credentials, git repository access, dbt version, and authentication method for SSO."
sidebar_position: 1
---
# Configure your account with Datacoves

Your Datacoves account is configured during a setup call with the Datacoves team, who will guide you through the account setup wizard step by step. The wizard tests your data warehouse and git connections live, and will not let you continue until they succeed, so having the access and permissions below in place **before** the call is what keeps it short.

:::caution
A common blocker is git repository permissions. You need to be able to add a deploy key to the repository (see [Git](#git)). If you can't, make sure the person who can is available during the call.
:::

## Before the Call

:::note
Email gomezn@datacoves.com with the answers to the following two questions so we can be ready for the call.
:::

1. What version of dbt are you using?
2. Do you use Google / Google Workspace or Microsoft to authenticate? Datacoves leverages your existing authentication service.

## Who Should Join the Call

- The person who will administer the Datacoves account.
- Someone with admin access to the git repository, if that's not you.
- Someone who can create users and grant privileges in your data warehouse, if that's not you.

## Prerequisites

### Data Warehouse

To set up your Datacoves account, you will need to know your data warehouse provider and have relevant access details handy. This includes the service account that Airflow will use.

| Data Warehouse Provider | Information Needed |
| --- | --- |
| Snowflake | Account, Warehouse, Database, Role, Schema, User, Password |
| Redshift | Host, Database, Schema, User, Password |
| Databricks | Host, HTTP Path, Schema, Catalog (optional), Token |
| BigQuery | Dataset, Keyfile JSON |

Your user needs to be able to use the warehouse and database, and to create objects in your development schema. The Airflow service account needs the same access to the schemas used for production runs.

:::warning
For the Snowflake `Account` field, use the `orgname-accountname` format (e.g. `myorg-myaccount`). This is the subdomain of your Snowflake URL. Do not include `snowflakecomputing.com`. Legacy account locators are also accepted.
Check out the Snowflake documentation on [finding the organization and account name for an account](https://docs.snowflake.com/en/user-guide/admin-account-identifier#finding-the-organization-and-account-name-for-an-account).
:::

**Snowflake authentication:** The setup wizard only supports username and password authentication. Make sure your Snowflake user can log in with a password. The Airflow service account can also use key-pair authentication.
- Your personal Snowflake user needs MFA (e.g. Duo) enabled. This does not apply to the Airflow service account. Have your phone handy, since you'll need to approve the push notification when the connection is tested.
- We recommend that your Snowflake administrator enables [MFA token caching](https://docs.snowflake.com/en/user-guide/security-mfa#using-mfa-token-caching-to-minimize-the-number-of-prompts-during-authentication-optional) to avoid an MFA prompt on every connection.

**Network Access:** Verify that your Data Warehouse is accessible from outside your network. You'll need to whitelist the Datacoves IP: `74.179.200.137`.

### Git

Datacoves works with any git provider that supports SSH, such as GitHub, GitLab, Bitbucket, and Azure DevOps. During the wizard, Datacoves generates two SSH keys, and both are tested before you can continue:

**Deploy Key**
Added to the repository and used by Datacoves services. You need the right role in your git provider to add it:

| Git Provider | Where the key goes | Role required |
| --- | --- | --- |
| GitHub | Repository Settings > Deploy keys | Repository admin |
| GitLab | Project Settings > Repository > Deploy keys | Maintainer or higher |
| Bitbucket Cloud | Repository settings > Access keys | Repository admin |

:::note[Azure DevOps]
Azure DevOps does not support repository deploy keys; SSH keys are added to a user profile (User settings > SSH public keys). During the wizard, add the deploy key to the profile of a user with access to the repository, and select `RSA (Azure Compatibility)` as the SSH key type, since Azure DevOps only supports RSA keys. Make sure SSH authentication is enabled in your organization's policies.

After the wizard, the project can be switched to authenticate with an Entra ID application. See [How to Clone with Azure DevOps](/docs/how-tos/datacoves/how_to_projects/how_to_configure_azure_devops) for the prerequisites.
:::

**Developer Key**
Added to **your own user account** in your git provider. Your user needs to be able to clone and push to the repository. If your organization enforces SSO (e.g. on GitHub), you may need to authorize the key for your organization.

See [How to configure an SSH Key](/docs/how-tos/git/ssh-keys) for details.

**Git Repo**
Have the repository's **SSH** clone URL handy (e.g. `git@github.com:organization/repo.git`). If this will be a new dbt project, create a new repo and ensure at least one file is in the `main` branch such as a `README.md`.

**dbt Docs**  
Create a `dbt-docs` branch in your repo.

## During Call with Datacoves

To ensure a smooth call, please have the answers to the following questions ready to go. 

- What do you want to call your account? (This is usually the company name.)
- What do you want to call your project? (This can be something like Marketing DW, Finance 360, etc.)
- Do you currently have a CI/CD process and an associated script, such as a GitHub Actions workflow? If not, do you plan on creating a CI/CD process?
- Do you need any specific Python libraries in Airflow or VS Code, outside the standard dbt-related items?
