---
title: Migrating from Environment Service Connections
sidebar_position: 75
---
# Migrating from Environment Service Connections to Airflow Service Connections

To leverage **My Airflow** and **Datacoves Decorators**, you'll need to update your configurations and refactor your DAGs. This guide walks you through the necessary steps.

Previously, Datacoves injected environment variables into Airflow when a service connection was created. While this method is still supported, the new and recommended approach is to add credentials directly to Airflow as a connection. This transition enables seamless integration with [Datacoves Decorators](/docs/reference/airflow/datacoves-decorators) and **My Airflow**.


### Step 1: Update Your Service Connection

Edit an existing or create a new [service connection](/docs/how-tos/datacoves/how_to_service_connections), ensuring that **`Airflow Connection`** is selected as the **Delivery Mode**.

### Step 2: Start Your My Airflow Instance

Launch your [My Airflow](/docs/how-tos/my_airflow/start-my-airflow) instance to begin the migration process.

### Step 3: Import Variables and Connections

Run the [My Import](/docs/how-tos/my_airflow/my-import) process to import variables and connections from **Team Airflow** to **My Airflow**. 

:::note
Secret values will not be automatically transferred and must be manually provided via the command line. `datacoves my import` only imports connections created by a Datacoves service connections, all other connections must be imported manually.
:::
**When prompted to add secret values:**

- enter the value
- press enter
- Press Ctrl-D

### Step 4: Refactor Your DAGs

Update your DAGs by replacing [Datacoves Operators](/docs/reference/airflow/datacoves-operator) with [Datacoves Decorators](/docs/reference/airflow/datacoves-decorators) to align with the new service connection structure. 

By following these steps, you'll ensure a smooth transition to Airflow service connections while optimizing your workflow within Datacoves.
