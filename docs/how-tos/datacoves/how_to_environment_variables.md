---
title: Add Custom Environment Variables to VS Code and Airflow
sidebar_label: Configure VS Code and Airflow Env Vars
description: "Configure custom environment variables for the VS Code IDE and for Airflow in Datacoves environments to pass secrets, settings, or tool configuration."
sidebar_position: 52
---
# How to use custom VS Code and Airflow Environment Variables

Even though you can create environment variables in your VSCode instance by using the traditional `export` command, having your Environment configured with custom variables can be an important time-saver, as these are not cleared when your Environment restarts (due to inactivity, maintenance, or changes in its settings)

You can configure environment variables in 3 different places:

- `Project Settings`: applies to the entire Project (with all its Environment)
- `Environment Settings`: applies to the desired Environment
- `User Settings`: applies to the user's VSCode instance.

As the UI is almost the same in the 3 pages, we'll illustrate the process using the `Environment Settings` screen

To configure custom VSCode environment variables:

- Navigate to `VS Code Environment Variables` inside your Environment settings. Once there, click `Add`

![VS Code Environment Variables](./assets/env_vars_1.png)

- A pop-up will appear, where you must specify `Key` and `Value` for your environment variable. Once set, click `Add`

![Configure ENV VAR](./assets/env_vars_2.png)

- You will be sent back to your Environment settings, where you should see the newly created environment variable.
- Once there, make sure to `Save Changes` to your Environment

![Save Changes](./assets/env_vars_3.png)

That's all! Now you can use this new persistent variable in your VSCode instance.

![VSCode](./assets/env_vars_4.png)

## Airflow Environment Variables

Admins can also add environment variables that Airflow tasks can read.

Add them in one of these places:

- `Project Settings`: for every environment in the project
- `Environment Settings`, `Airflow Environment Variables` tab: for that environment only

If a key is in both, the environment value is used.

![Airflow Environment Variables tab](./assets/airflow_env_vars_1.png)

Team Airflow and My Airflow get these variables, except the Team Airflow cleanup job.

My Airflow also gets your VS Code Environment Variables. If a key is both a VS Code and an Airflow variable,
My Airflow uses the Airflow value.

Datacoves variables can't be overridden. For example, setting `DATACOVES__ENVIRONMENT_SLUG` has no effect.

Saving changes restarts Team Airflow.
