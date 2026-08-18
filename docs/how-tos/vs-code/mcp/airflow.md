---
title: Airflow
sidebar_position: 2
---

# Airflow MCP Server

The Airflow MCP server lets your AI tools read your DAGs, runs, and task logs, so you can ask the
AI to investigate a failed task and recommend a fix without leaving VS Code.

It is backed by [Astronomer's Airflow MCP server](https://github.com/astronomer/agents/tree/main/astro-airflow-mcp)
and works with both Airflow 2 and Airflow 3.

## Prerequisites

- The **Airflow** MCP server enabled for your environment (see [Enabling](#enabling)).
- Airflow enabled and running for your environment.

## How it works

- **No setup required.** The server authenticates as **you**, using your Datacoves identity, so it
  only sees what your Airflow permissions allow.
- **Read-only by default.** The server is configured for read access, so the AI can inspect DAGs,
  runs, and logs but cannot trigger, pause, or change anything.
- Works with both your team's Airflow and, when enabled, your personal **My Airflow** instance.

## Enabling

:::note
An administrator enables the server in **Admin > Environments > _your environment_ > AI Tools >
MCP Servers** by turning on **Airflow**.
:::

## Use it

Start (or restart) your workspace so the AI tools pick up the server, then ask, for example:

> Check the log of the task that failed in my last DAG run and recommend a fix.

> Which DAGs failed today, and what was the error?

## Learn more

- [Astronomer Airflow MCP server](https://github.com/astronomer/agents/tree/main/astro-airflow-mcp)
