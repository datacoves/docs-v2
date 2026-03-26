---
title: OpenAI Codex
sidebar_position: 1
---

# OpenAI Codex

[OpenAI Codex](https://openai.com/codex/) is an AI coding assistant available as both a CLI tool and a VS Code extension in Datacoves.

## Prerequisites

- A [ChatGPT](https://chatgpt.com) account
- Codex enabled in your Datacoves environment. Contact [Datacoves support](mailto:support@datacoves.com) to enable it.

## Enable device code login

Before logging in from Datacoves, enable device code login in your ChatGPT account.

**Personal accounts:** go to your [ChatGPT security settings](https://chatgpt.com/security-settings) and enable device code login.

**Workspace / Enterprise accounts:** a workspace admin must enable device code authentication in the [admin permissions](https://chatgpt.com/admin/permissions) page.

For more details, see [OpenAI's authentication docs](https://developers.openai.com/codex/auth).

## Login

1. Open a terminal in your Datacoves VS Code workspace

2. Run:

   ```bash
   codex login --device-auth
   ```

3. The CLI will display a URL and a one-time code

4. Open the URL in any browser, enter the code, and sign in with your ChatGPT account

Both the CLI and the VS Code extension are now authenticated.

:::note
You may need to reload your browser tab after CLI login for the VS Code extension to pick up the credentials.
:::

## Learn more

- [OpenAI Codex documentation](https://developers.openai.com/codex)
- [Codex authentication](https://developers.openai.com/codex/auth)
- [Codex CLI reference](https://developers.openai.com/codex/cli/reference)
