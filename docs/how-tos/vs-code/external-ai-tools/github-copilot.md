---
title: GitHub Copilot
description: Enable and log in to GitHub Copilot in your Datacoves VS Code workspace, and use it with the Datacoves MCP servers.
sidebar_position: 3
---

# GitHub Copilot

[GitHub Copilot](https://github.com/features/copilot) is built into the Datacoves VS Code
workspace as the GitHub Copilot and Copilot Chat extensions. The GitHub Copilot CLI is installed
alongside them.

## Prerequisites

- A GitHub account with an active GitHub Copilot subscription.
- GitHub Copilot enabled in your Datacoves environment. An administrator enables it under
  **Admin > Environments > _your environment_ > AI Tools > AI Extensions**. This also enables the
  CLI.

## Login

1. Open your Datacoves VS Code workspace.
2. Open the Copilot Chat view, or click the Copilot icon in the status bar.
3. Choose to sign in and follow the GitHub authentication prompt in your browser.
4. Once authorized, Copilot is ready in both inline suggestions and chat.

## GitHub Copilot CLI

The CLI is enabled and disabled together with the GitHub Copilot extension.

1. Open a terminal in your Datacoves VS Code workspace.
2. Run `copilot`.
3. Run `/login` and follow the instructions.

## MCP servers

GitHub Copilot can use the Datacoves [MCP servers](/docs/how-tos/vs-code/mcp) (GitHub, Airflow,
Grafana, Snowflake) when they are enabled for your environment. The GitHub Copilot CLI gets the
[Snowflake server](/docs/how-tos/vs-code/mcp/snowflake) too.

## Learn more

- [GitHub Copilot documentation](https://docs.github.com/en/copilot)
- [GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/use-copilot-cli)
