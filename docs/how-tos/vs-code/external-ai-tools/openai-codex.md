---
title: Use OpenAI Codex in the Datacoves VS Code IDE
sidebar_label: OpenAI Codex
description: "Set up and use OpenAI Codex in the Datacoves VS Code environment to get AI-powered code suggestions and autocompletion for SQL and Python files."
sidebar_position: 1
---

# OpenAI Codex

[OpenAI Codex](https://openai.com/codex/) is an AI coding assistant available as both a CLI tool and a VS Code extension in Datacoves.

## Prerequisites

- A [ChatGPT](https://chatgpt.com) account
- OpenAI Codex enabled in your Datacoves environment. An administrator enables **OpenAI Codex** under
  **Admin > Environments > _your environment_ > AI Tools > AI Extensions**, and **OpenAI Codex CLI** under
  **AI Tools**.

## Enable device code login

Before logging in from Datacoves, enable device code login in your ChatGPT account.

**Personal accounts:** go to your [ChatGPT security settings](https://chatgpt.com/security-settings) and enable device code login.

**Workspace / Enterprise accounts:** a workspace admin must enable device code authentication in the [admin permissions](https://chatgpt.com/admin/permissions) page.

For more details, see [OpenAI's authentication docs](https://developers.openai.com/codex/auth).

## Login

1. Open a terminal in your Datacoves VS Code workspace, with **OpenAI Codex CLI** enabled.

2. Run:

   ```bash
   codex login --device-auth
   ```

3. The CLI will display a URL and a one-time code

4. Open the URL in any browser, enter the code, and sign in with your ChatGPT account

The CLI is now signed in. The CLI and the extension share the same Codex login.

With **OpenAI Codex** enabled, you can also sign in from the Codex view with **Sign in with ChatGPT**. It asks
for confirmation, opens the OpenAI page, and signs the extension in.

The view also offers **Use device code**, which shows a one-time code. Enter that code on the OpenAI device
login page.

:::note
You may need to reload your browser tab after CLI login for the VS Code extension to pick up the credentials.
:::

## Learn more

- [OpenAI Codex documentation](https://developers.openai.com/codex)
- [Codex authentication](https://developers.openai.com/codex/auth)
- [Codex CLI reference](https://developers.openai.com/codex/cli/reference)
