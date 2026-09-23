---
title: Snowflake MCP Server
sidebar_label: Snowflake
description: Connect the Snowflake-managed MCP server so AI tools in VS Code can run read-only SQL against your own Snowflake account.
sidebar_position: 4
---

# Snowflake MCP Server

The Snowflake MCP server lets your AI tools run read-only SQL against your Snowflake account, so you
can ask about your tables, columns, and data and get an answer from the warehouse instead of a guess.

It is backed by
[Snowflake's managed MCP server](https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-agents-mcp),
which runs inside your own Snowflake account. Your data never leaves it.

## Prerequisites

- A Snowflake environment whose first Snowflake connection is a development connection, that is, one
  whose name contains `dev`.
- [Key pair authentication](/docs/how-tos/vs-code/initial) on that connection. Snowflake accepts a
  key pair token and nothing else for MCP, so a password-authenticated connection cannot reach the
  server.
- An MCP server object in your Snowflake account, created by an account administrator as shown
  below.
- The **Snowflake** toggle turned on for your environment by an administrator, under
  **Admin > Environments > AI Tools > MCP Servers**.

## Create the server in your Snowflake account

The MCP server is an object in your own account. Datacoves does not create it and cannot see it
until it exists. Pick the database and schema you want it in, and name the server `DATACOVES`.

```sql
create mcp server <database>.<schema>.DATACOVES from specification $$
{
  "version": 1,
  "tools": [
    {
      "title": "Read-only SQL",
      "name": "execute_sql",
      "type": "SYSTEM_EXECUTE_SQL",
      "description": "Run SELECT queries against Snowflake metadata and data.",
      "config": {
        "read_only": true,
        "query_timeout": 120,
        "warehouse": "<the warehouse your Datacoves connection uses>"
      }
    }
  ]
}
$$;
```

Then let the role your Datacoves connection uses reach it:

```sql
grant usage on mcp server <database>.<schema>.DATACOVES to role <your connection's role>;
```

`read_only` keeps the tool to `SELECT` queries, so the AI can read your data and metadata but cannot
change anything.

Your account may hold other MCP servers. Datacoves picks the one named `DATACOVES`, and when the
account holds exactly one MCP server it picks that one whatever it is called.

## How it works

**One toggle, and nothing else to configure.** Your workspace signs a token with the private key of
your Snowflake connection, asks your account which MCP servers it holds, and points your AI tools at
it. The token is short-lived and refreshed for you.

The entry is delivered to every AI tool in your workspace: Datacoves Copilot, GitHub Copilot in VS
Code, the GitHub Copilot CLI, Snowflake Cortex and OpenAI Codex. A tool you do not have installed is
skipped, so there is nothing to turn off.

The server acts as **you**, through your connection's own Snowflake role, so it sees only what that
role is allowed to see.

Until the server object exists, the entry holds a placeholder address and no token, so it cannot
reach your account: in Datacoves Copilot it sits switched off, and in the other tools it is listed
but does not connect. Once an administrator creates it, your workspace picks it up within five
minutes, with no restart.

## Use it

Ask, for example:

> Which columns does the customers table have, and how many rows are in it?

> Count yesterday's rows in the raw orders table and compare them with the day before.

You can confirm it is connected in Datacoves Copilot under **Settings > MCP Servers**, where
`snowflake` lists the `execute_sql` tool.

## Learn more

- [Snowflake-managed MCP server](https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-agents-mcp)
- [CREATE MCP SERVER](https://docs.snowflake.com/en/sql-reference/sql/create-mcp-server)
- [Set up your Snowflake connection with a key pair](/docs/how-tos/vs-code/initial)
