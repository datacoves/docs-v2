---
title: Grafana (Prometheus & Loki)
sidebar_position: 3
---

# Grafana MCP Server

The Grafana MCP server lets your AI tools query the metrics (Prometheus) and logs (Loki) for your
environment, so you can ask the AI to summarize recent failures or look up a specific log.

It is backed by [Grafana's MCP server](https://github.com/grafana/mcp-grafana).

## Prerequisites

- The **observability stack** enabled for your cluster. The Grafana MCP toggle only appears when
  it is. Contact [Datacoves support](mailto:support@datacoves.com) if you need it enabled.
- The **Grafana (Prometheus & Loki)** MCP server enabled for your environment (see
  [Enabling](#enabling)).

## How it works

**No setup required.** Datacoves provisions a per-environment service account for the server, so
there is nothing for you to configure. The server connects to your environment's Grafana, which
already has the Prometheus and Loki data sources wired up.

## Enabling

:::note
An administrator enables the server in **Admin > Environments > _your environment_ > AI Tools >
MCP Servers** by turning on **Grafana (Prometheus & Loki)**.
:::

## Use it

Start (or restart) your workspace so the AI tools pick up the server, then ask, for example:

> Query the metrics and logs for my environment and summarize recent failures.

> Show me the Loki logs for my Airflow workers in the last hour.

## Learn more

- [Grafana MCP server](https://github.com/grafana/mcp-grafana)
- [Grafana dashboards in Datacoves](/docs/how-tos/datacoves/metrics-and-logs/grafana)
