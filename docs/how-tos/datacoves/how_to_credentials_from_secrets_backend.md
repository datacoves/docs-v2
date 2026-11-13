---
title: "Use Warehouse Credentials From Your Secrets Backend"
sidebar_label: "Credentials From Your Secrets Backend"
description: "Reference Snowflake key pairs, Redshift passwords, Databricks tokens and BigQuery keyfiles from your own secrets backend so Datacoves never stores them and you can rotate them in place."
sidebar_position: 50
---
# How to use warehouse credentials from your secrets backend

Instead of pasting a private key, password, token or keyfile into Datacoves, you can keep it in your own secrets backend (AWS Secrets Manager, Azure Key Vault, GCP Secret Manager or HashiCorp Vault) and give Datacoves only a reference to it. Datacoves stores the reference, never the value, and reads the secret when Airflow or VS Code use it. To rotate the credential you update the secret in your backend; nothing has to change in Datacoves.

What can be referenced:

| Warehouse | Credential | Available from |
| --- | --- | --- |
| Snowflake | Key-pair private key | Release 6.1 |
| Redshift | Password | Release 6.2 |
| Databricks | Token | Release 6.2 |
| BigQuery | Service account keyfile (JSON) | Release 6.2 |

Snowflake passwords can not be referenced: Snowflake is retiring password-only sign-in, so use a key pair instead.

## Requirements

- **The feature is enabled for your cluster.** It needs the External Secrets Operator installed in the cluster and the `external_secrets` feature turned on. Both are done by Datacoves; contact us to have it enabled. Until then, the options described below do not appear.
- **The environment has an Airflow secrets backend configured**, at the project or the environment level. Datacoves reads the credentials from that same backend, with the same credentials or identity, so there is nothing new to configure. See [configure your project's secrets backend](/docs/how-tos/datacoves/how_to_projects) and, for example, [AWS Secrets Manager](/docs/how-tos/datacoves/how_to_projects/how_to_configure_aws_secrets_manager) or [Azure Key Vault](/docs/how-tos/datacoves/how_to_projects/how_to_configure_azure_key_vault).
- **That identity can read the secrets you reference.** Grant it read access to them in your backend, the same way you grant it access to the Airflow variables and connections it reads.

### Supported backends and authentication

| Backend | Supported authentication |
| --- | --- |
| AWS Secrets Manager | Static access keys, IRSA |
| Azure Key Vault | Service principal, workload identity, managed identity |
| GCP Secret Manager | Service account keyfile |
| HashiCorp Vault | Token, AppRole, Kubernetes |

Not supported: EKS Pod Identity and GCP Workload Identity. An environment whose secrets backend uses one of them can still use it for Airflow, but credentials can not be referenced from it.

For HashiCorp Vault with Kubernetes authentication, bind the Vault role to the Airflow worker service account of the environment: `<environment slug>-airflow-worker`, or `datacoves-airflow` when the environment uses a workload identity. Airflow must be enabled in the environment.

## Store the secret

Create the secret in your backend before you reference it:

- **Snowflake key pair:** the unencrypted private key in PEM format (`-----BEGIN PRIVATE KEY-----` ...). Register the matching public key on the Snowflake user yourself; see [Snowflake key-pair authentication](https://docs.snowflake.com/en/user-guide/key-pair-auth).
- **Redshift password** or **Databricks token:** the value itself.
- **BigQuery keyfile:** the whole service account keyfile JSON.

The secret can hold the value on its own, or as one property of a secret that stores several values (a Vault KV secret, or a JSON secret in AWS Secrets Manager).

The reference is the name or path of the secret exactly as your backend calls it. The naming rules of the Airflow secrets backend (the `datacoves-` prefix, `airflow-connections-` and so on) do not apply here. For HashiCorp Vault, the path is relative to the mount point configured in the secrets backend, for example `snowflake/svc_loader` for `secret/snowflake/svc_loader`.

## Reference it from Datacoves

Every reference has two fields:

- **Secret reference:** the name or path of the secret.
- **Property:** the field that holds the value, when the secret stores several values. Leave it empty when the whole secret is the value.

### Service connections (Airflow)

In the [service connection](/docs/how-tos/datacoves/how_to_service_connections) form:

- **Snowflake:** set the authentication mechanism to key pair and choose `From your secrets backend` as the key-pair type. Fill in the reference and the property, optionally a key name, and click `Save reference`. Both delivery modes work:
  - **Airflow Connection:** the connection's private key file points to the key, so [`@task.datacoves_dbt`](/docs/reference/airflow/datacoves-decorators) works as usual.
  - **Environment Variables:** the path to the key is delivered as `DATACOVES__<NAME>__PRIVATE_KEY_PATH`.
- **Redshift, Databricks and BigQuery:** set the password, token or keyfile source to `From your secrets backend` and fill in the reference and the property. These credentials are delivered as environment variables only, so the delivery mode switches to `Environment Variables`. For BigQuery, also enter the `BigQuery project ID`: Datacoves does not hold the keyfile, so it can not take the project from it for the dbt profiles.

With environment variables, the password and the token keep the names Datacoves already uses (`DATACOVES__<NAME>__PASSWORD`, `DATACOVES__<NAME>__TOKEN`), so the profile in your repository does not change. The Snowflake key and the BigQuery keyfile are files, and the profile points to them:

```yaml
# Snowflake
private_key_path: "{{ env_var('DATACOVES__MAIN__PRIVATE_KEY_PATH') }}"

# BigQuery
method: service-account
keyfile: "{{ env_var('DATACOVES__MAIN__KEYFILE_PATH') }}"
project: "{{ env_var('DATACOVES__MAIN__PROJECT') }}"
```

Replace `MAIN` with the name of your service connection.

### Your own database connections (VS Code)

- **Snowflake:** in your user _Settings_, under _Database Authorization Keys_, click `Add` and choose `Reference from your secrets backend`. Give the key a name and fill in the reference and the property. Then, in your database connection, choose `Key pair` as the auth type and select that key.
- **Redshift, Databricks and BigQuery:** in your database connection, set the password, token or keyfile source to `From your secrets backend` and fill in the reference and the property (and the BigQuery project ID).

Datacoves writes your dbt profiles for VS Code, so there is nothing to change in them.

The reference is read from the secrets backend of the environment the connection belongs to. The same reference in two environments reads from each environment's own backend.

## Rotation

Update the secret in your backend. Datacoves reads every referenced secret again every minute, and the new value reaches your workloads without any change in Datacoves:

| Credential | Airflow | VS Code |
| --- | --- | --- |
| Snowflake key, BigQuery keyfile (files) | Within about two minutes, no restart | Within about two minutes, no restart |
| Redshift password, Databricks token (environment variables) | Tasks that start after the change | After your VS Code workspace restarts |

To rotate a Snowflake key pair without failures, keep the old key valid until Datacoves uses the new one. Snowflake accepts two public keys per user for this purpose:

1. Generate the new key pair and register the new public key in the free slot, for example `ALTER USER svc_loader SET RSA_PUBLIC_KEY_2 = '...';`.
2. Update the private key in your secrets backend.
3. Wait for the rotation notice (see below), or check that the fingerprint shown in Datacoves matches `RSA_PUBLIC_KEY_2_FP` in `DESC USER svc_loader`.
4. Once your jobs run with the new key, remove the old one: `ALTER USER svc_loader UNSET RSA_PUBLIC_KEY;`.

For passwords and tokens, keep the old value valid until running Airflow tasks finish and VS Code workspaces have restarted, where your warehouse allows it.

## Status and notifications

Credentials whose value comes from your secrets backend show a status badge in the service connections list, in the connection forms and next to your keys:

| Badge | Meaning |
| --- | --- |
| `Key pending` / `Secret pending` | Not read yet, for example right after the connection was saved. |
| `Key in sync` / `Secret in sync` | Read from your secrets backend. |
| `Key out of sync` / `Secret out of sync` | The last read failed. Datacoves keeps using the value it read before, so nothing fails yet. |
| `Key unreadable` / `Secret unreadable` | The value has never been read. Connections that use it fail until it can be read. |

Hover the badge for the error and for when the value in use last changed. For keys, the badge also shows the fingerprint of the public key in use, in the same `SHA256:...` format as Snowflake's `RSA_PUBLIC_KEY_FP`. Click it to copy it.

Datacoves also tells you, by email and as a notification in the workbench, when:

- the value in use changed (a rotation reached the environment), including the new and the previous fingerprint for keys;
- reading the secret started failing, with the error. The previous value is still in use, so do not remove it from the warehouse until this is fixed;
- reading works again.

The notices for a database connection go to its owner. The notices for a service connection go to the users who can edit service connections in the account. A rotation is noticed within about three minutes, and a secret used in several environments sends one notice per environment.

## Troubleshooting

Testing a connection (saving its form, or the `Test connection` button next to it) reads the secret again right away, without waiting for the next read, and shows the error your backend returned, for example `Secret does not exist`. After fixing the problem in your backend, test the connection again to retry.

Common errors:

- **`Secrets referenced from your secrets backend need the External Secrets Operator, which is not installed in this cluster`:** the feature is not set up in your cluster; contact Datacoves.
- **`The environment's secrets backend can't be used for keys` (or `secrets`) followed by a reason:** the environment has no secrets backend, or its authentication is not supported (see the tables above).
- **`Secret does not exist`, or an access denied error:** check the reference and that the backend identity can read it.
- **`The secret was read but it holds no ...`:** the secret exists but the property is wrong or empty. Check the property name, or leave it empty if the whole secret is the value.

If the feature is turned off for a cluster later, credentials that already reference your secrets backend keep working; only new references can not be created.
