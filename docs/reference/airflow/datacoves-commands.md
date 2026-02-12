---
title: Datacoves CLI Commands
sidebar_position: 126
---
# Datacoves CLI Commands
The `datacoves` bash commands are meant to simplify your workflow. Currently, the datacoves command has the following sub commands: 

- `my` 
  
## Datacoves My

The `my` subcommand executes commands for My Airflow. 

Currently, the `datacoves my` subcommand has the following subcommands:
- `my import`
- `my pytest`
- `my api-key`

### datacoves my import

:::note
For security purposes secret values will not be automatically imported. The tool will ask you to enter the secret value. 
:::

This command will import your variables and connections from Team Airflow to [My Airflow](/docs/how-tos/my_airflow/). You only need to complete this once or whenever new variables/connections are added to team airflow. 

```bash
datacoves my import
```

### datacoves my pytest

:::note
My Airflow [must be instantiated](/how-tos/my_airflow/start-my-airflow.md) for this command to work.
:::

This command allows you to run pytest validations straight from the command line. Simply create your python file with your desired tests inside the `orchestrate` directory. Then pass the file path as an argument as seen below. 

```bash
datacoves my pytest -- orchestrate/test_dags/validate_dags.py
```

### datacoves my api-key

Manage My Airflow API keys from the command line. These keys allow you to access the My Airflow API programmatically.

#### List existing keys

```bash
datacoves my api-key list
```

This displays all environments where My Airflow is enabled, along with the API URL and any existing keys.

#### Generate a new key

```bash
datacoves my api-key generate
```

You can optionally provide a name for the key:

```bash
datacoves my api-key generate --name "My Script"
```

The command will output the API URL and key. Save the key immediately as it won't be shown again.

#### Delete a key

```bash
datacoves my api-key delete <token-prefix>
```

Use the first 8 characters of the token (shown in the list command) to identify which key to delete.

```bash
datacoves my api-key delete abc12345
```
