---
title: Snowflake Cortex
sidebar_position: 2
---

# Snowflake Cortex

[Snowflake Cortex Code](https://docs.snowflake.com/en/user-guide/cortex-code/cortex-code-cli) is
Snowflake's AI coding assistant, available as a CLI tool in Datacoves.

## Prerequisites

- A Snowflake-based (`dbt-snowflake`) environment. Cortex is only available on Snowflake
  environments.
- Cortex enabled in your Datacoves environment. Contact
  [Datacoves support](mailto:support@datacoves.com) to enable it, or an administrator can turn it
  on under **Admin > Environments > _your environment_ > AI Tools**.

## Login and usage

Cortex authenticates against Snowflake and is driven from a terminal in your Datacoves VS Code
workspace. See
[Snowflake's Cortex Code CLI documentation](https://docs.snowflake.com/en/user-guide/cortex-code/cortex-code-cli)
for the authentication and usage steps.

## MCP servers

Cortex can use the Datacoves [MCP servers](/docs/how-tos/vs-code/mcp) (GitHub, Airflow, Grafana)
when they are enabled for your environment.

## Learn more

- [Snowflake Cortex Code documentation](https://docs.snowflake.com/en/user-guide/cortex-code/cortex-code-cli)
