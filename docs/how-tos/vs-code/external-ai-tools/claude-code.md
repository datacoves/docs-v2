---
title: Use Claude Code in the Datacoves VS Code IDE
sidebar_label: Claude Code
description: "Set up and log in to Claude Code in the Datacoves VS Code environment to get AI-powered help for SQL and Python files."
sidebar_position: 2
---

# Claude Code

[Claude Code](https://www.anthropic.com/claude-code) is an AI coding assistant available as both a CLI tool and a VS Code extension in Datacoves.

## Prerequisites

- A [Claude](https://claude.ai) account
- Claude Code enabled in your Datacoves environment. Contact [Datacoves support](mailto:support@datacoves.com) to enable it.

## Login

1. Open a terminal in your Datacoves VS Code workspace

2. Run:

   ```bash
   claude login
   ```

3. Follow the instructions in the terminal

4. When you get the prompt **"Do you want code-server to open the external website?"**, click **Cancel**

5. Ctrl-click (Cmd-click on Mac) the link shown in the terminal

6. Click open in the promp that appears

7. Authenticate in the browser tab that opens

8. Copy the code shown after authentication and paste it back in the terminal where prompted

9. Press **Enter**

Both the CLI and the VS Code extension are now authenticated.

## Trouble copying text from the terminal

If you have problems copying text from Claude Code in the VS Code terminal, run this command inside Claude Code:

```
/tui default
```
