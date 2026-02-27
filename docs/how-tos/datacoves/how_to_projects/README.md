---
title: Configure Projects
sidebar_position: 48
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# How to Create/Edit a Project

Navigate to the Projects page:

![Projects Page](../assets/menu_projects.gif)

![Projects Create or Edit Page](../assets/projects_editnew_page.png)

A Project configuration consists of the following fields:

- **Name:** This is what will be displayed in the Datacoves landing page.
- **Git Repo:** This is the git repository associated with this project.
  - **Clone strategy:** Determines how Datacoves will communicate with your git repository (SSH, HTTPS, or Azure DevOps Secret/Certificate). Select your desired cloning strategy to see configuration instructions:

<Tabs>
<TabItem value="ssh" label="SSH" default>

When SSH is selected, an SSH public key will be automatically generated for you to configure in your git provider as a deployment key.

![Repo SSH Key](../assets/projects_ssh_key.png)

</TabItem>

<TabItem value="https" label="HTTPS">

When HTTPS is selected, the following fields must be filled in: `Git HTTPS url`, `Username`, and `Password`.

![Repo User Password Prompt](../assets/projects_https_data.png)

</TabItem>

<TabItem value="azure-secret" label="Azure DevOps Secret">

When Azure DevOps Secret is selected, a secret key is required for authentication. This assumes you have already created your EntraID application and added it as a user.

See this [how-to guide on configuring Azure DevOps](/docs/how-tos/datacoves/how_to_projects/how_to_configure_azure_DevOps) for detailed configuration information.

- **Git SSH url:** [Cloning URL](/docs/how-tos/datacoves/how_to_projects/how_to_configure_azure_DevOps) found in Azure DevOps Portal
- **Azure HTTPS Clone url:** [Cloning URL](/docs/how-tos/datacoves/how_to_projects/how_to_configure_azure_DevOps) found in Azure DevOps Portal
- **Tenant ID:** [ID found in Azure Portal](/docs/how-tos/datacoves/how_to_projects/how_to_configure_azure_DevOps)
- **Application ID:** [ID found in Azure Portal](/docs/how-tos/datacoves/how_to_projects/how_to_configure_azure_DevOps)
- **Client Secret:** [Secret value](/docs/how-tos/datacoves/how_to_projects/how_to_configure_azure_DevOps) found in Azure DevOps Portal
- **Release Branch:** This will be the branch you would like to clone. Typically `main`.

</TabItem>

<TabItem value="azure-cert" label="Azure DevOps Certificate">

When Azure DevOps Certificate is selected, a certificate is needed for secure communication.

See this [how-to guide on configuring Azure DevOps](/docs/how-tos/datacoves/how_to_projects/how_to_configure_azure_DevOps) for detailed instructions.

- **Certificate PEM file:** Copy the PEM file to your desktop and [upload in Azure](/docs/how-tos/datacoves/how_to_projects/how_to_configure_azure_DevOps)
- **Git SSH url:** [Cloning URL](/docs/how-tos/datacoves/how_to_projects/how_to_configure_azure_DevOps) found in Azure DevOps Portal
- **Azure HTTPS Clone url:** [Cloning URL](/docs/how-tos/datacoves/how_to_projects/how_to_configure_azure_DevOps) found in Azure DevOps Portal
- **Tenant ID:** [ID found in Azure Portal](/docs/how-tos/datacoves/how_to_projects/how_to_configure_azure_DevOps)
- **Application ID:** [ID found in Azure Portal](/docs/how-tos/datacoves/how_to_projects/how_to_configure_azure_DevOps)
- **Release Branch:** Defines the default branch in your repository. Typically `main` or `master`.

</TabItem>
</Tabs>

- **CI/CD Provider:** When provided, this will display a link to your CI/CD jobs on the Observe tab of a Datacoves environment. Once you choose your provider, you will be able to specify your `CI jobs home URL`.
- **Secrets Backend:** Datacoves provides a Secrets Backend out of the box; you can also configure additional Secrets Backends for your projects such as [AWS Secrets Manager](/docs/how-tos/datacoves/how_to_projects/how_to_configure_aws_secrets_manager).

![Project Secrets Backend](../assets/edit_project_secrets_backend.jpg)
