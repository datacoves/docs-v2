---
title: "Use Azure Key Vault as the Airflow Secrets Backend"
sidebar_label: "Configure Azure Key Vault"
description: "Select Azure Key Vault as the Airflow secrets backend in Datacoves, using Managed Identity or a service principal to read secrets."
sidebar_position: 52
---
# Configuring Azure Key Vault

Datacoves can use Azure Key Vault as the Airflow secrets backend so that Airflow fetches variables and connections directly from your vault at runtime. Secret values never pass through or get stored in Datacoves; Airflow talks to Azure Key Vault directly from within your environment.

:::note
Selecting an external backend replaces the Datacoves Secrets Manager for Airflow: secrets created in the Datacoves Secrets admin are no longer served to Airflow, and if no project in your account uses the Datacoves Secrets Manager, the `Secrets` item is hidden from the admin menu.
:::

## Table of Contents
- [Prereqs](#prereqs)
- [Choose an authentication method](#choose-an-authentication-method)
- [Create your Secret in Azure Key Vault](#create-your-secret-in-azure-key-vault)
- [Configure your Secrets Backend](#configure-your-secrets-backend)
  - [Project-level configuration](#project-level-configuration)
  - [Environment-level configuration](#environment-level-configuration)

## Prereqs

1. An Azure Key Vault.
2. An identity that Airflow can use to read secrets from the vault: either the Managed Identity already used by your Datacoves cluster (recommended when Datacoves runs in your Azure subscription) or a service principal with a client secret.
3. That identity needs permission to read secrets on the vault. With Azure RBAC, assign the `Key Vault Secrets User` role scoped to the vault. If your vault uses access policies instead, grant the `Get` and `List` secret permissions.

## Choose an authentication method

### Managed Identity (recommended on Azure-hosted Datacoves)

When your Datacoves cluster runs on AKS and Airflow is configured with an Azure identity (Workload Identity or a node-attached Managed Identity), no credentials are needed at all. The Airflow pods already carry the identity, so the backend configuration is just the vault URL:

```json
{
  "vault_url": "https://<your-vault-name>.vault.azure.net/"
}
```

Grant that Managed Identity the `Key Vault Secrets User` role on your vault and you are done. If you are not sure whether your cluster is set up this way, or which identity it uses, contact us at support@datacoves.com.

:::note
If your cluster uses a node-attached Managed Identity and the node carries more than one user-assigned identity, add `"managed_identity_client_id": "<client-id>"` to the configuration so the Azure SDK selects the right one.
:::

### Service principal with a client secret

This works on any Datacoves deployment, including clusters that do not run on Azure.

**Step 1:** In the Azure Portal, go to **Microsoft Entra ID** -> **App registrations** -> **New registration** and register an application (any name works, e.g. `datacoves-airflow-secrets`). No redirect URI is needed.

**Step 2:** On the app's **Overview** page, copy the **Application (client) ID** and the **Directory (tenant) ID**.

**Step 3:** Go to **Certificates & secrets** -> **New client secret**. Copy the secret's **Value** immediately after creating it (not the Secret ID); it is only shown once.

**Step 4:** On your Key Vault, go to **Access control (IAM)** -> **Add role assignment**, pick the `Key Vault Secrets User` role, and under **Members** select **User, group, or service principal** and search for the app you registered.

:::note
If this role assignment is missing (or was created moments ago and has not propagated yet), secret lookups fail with `Forbidden: Caller is not authorized to perform action on resource` even though authentication itself succeeded. The same applies to the Managed Identity variant. Role assignments can take a few minutes to become effective.
:::

The backend configuration is:

```json
{
  "vault_url": "https://<your-vault-name>.vault.azure.net/",
  "tenant_id": "<directory-tenant-id>",
  "client_id": "<application-client-id>",
  "client_secret": "<client-secret-value>"
}
```

## Create your Secret in Azure Key Vault

:::note
With the (recommended) Azure RBAC permission model, data plane roles are separate from management roles: even the subscription Owner cannot create or view secrets until they assign themselves a data plane role. If you see "The operation is not allowed by RBAC" or "You are unauthorized to view these contents" on the vault's Secrets page, assign yourself the `Key Vault Secrets Officer` role under **Access control (IAM)** and wait a few minutes for the role assignment to propagate. Airflow's identity only needs the read-only `Key Vault Secrets User` role, not Officer. Also watch out for the similarly named certificate roles when searching: `Key Vault Certificates Officer` and `Key Vault Certificate User` grant access to certificates, not secrets, and picking them by mistake leads to generic "An error occurred while creating the secret" failures.
:::

Airflow maps variables and connections to Key Vault secret names using a prefix:

- Variable `<key>` is read from the secret named `airflow-variables-<key>`
- Connection `<conn_id>` is read from the secret named `airflow-connections-<conn_id>`

### Things to note:

1. Any variable key or connection id is looked up in Key Vault first, and falls back to Airflow's own variables and connections when not found; no special prefix is required. For example, to use `Variable.get("my-secret")` in a DAG, create a Key Vault secret named `airflow-variables-my-secret`.
2. Azure Key Vault secret names only allow letters, numbers and dashes. Underscores in a variable key or connection id are automatically translated to dashes when building the secret name, so `Variable.get("my_secret")` also reads the secret `airflow-variables-my-secret`.
3. Store the value as plain text. For connections, store either an Airflow connection URI (for example `snowflake://user:password@account/`) or a JSON object with the connection fields.

## Configure your Secrets Backend

Azure Key Vault can be configured at the project level, at the environment level, or both. When configured at the project level, all environments under that project will use it by default. Individual environments can have their own configuration that takes precedence, or they can be set to inherit the project-level settings.

### Project-level configuration

This configuration applies to all environments under the project unless overridden at the environment level.

**Step 1:** Navigate to the Projects Admin page and click on the edit icon for the desired project.

**Step 2:** Scroll down to the `Airflow Secrets Backend` section and select `Azure Key Vault` from the `Secrets Backend` dropdown (the default selection, `Datacoves Secrets Manager`, is the built-in backend).

**Step 3:** Paste the JSON configuration for the authentication method you chose above.

:::tip
See the [Azure Key Vault secrets backend documentation](https://airflow.apache.org/docs/apache-airflow-providers-microsoft-azure/stable/secrets-backends/azure-key-vault.html) for more customization options, such as `connections_prefix`, `variables_prefix` and `sep`.
:::

:::tip
For security purposes, once this has been saved you will not be able to view the values. To modify the configuration, switch the Secrets Backend back to `Datacoves Secrets Manager`, save the changes, and then start the setup again.
:::

### Environment-level configuration

Azure Key Vault can also be configured directly at the environment level, independently of the project settings. This is useful when only specific environments should use Azure Key Vault, or when different environments need different vaults (for example, one vault for development and another for production).

**Step 1:** Navigate to the Environments Admin page and click on the edit icon for the desired environment.

**Step 2:** Go to **Services Configuration**, then select **Airflow settings**.

**Step 3:** Scroll down to the **Airflow Secrets Backend** section. Select `Azure Key Vault` to configure it for this environment. Leave the field set to `Use Project Settings` to inherit the project-level selection, or pick `Datacoves Secrets Manager` to force the built-in backend on this environment regardless of the project setting.

:::note
The configuration fields available at the environment level are the same as those at the project level. Any values entered here will take precedence over the project settings for this environment only.
:::

To learn how to read a variable from Azure Key Vault in a DAG, check out [How to use Azure Key Vault in Airflow](/docs/how-tos/airflow/use-azure-key-vault).
