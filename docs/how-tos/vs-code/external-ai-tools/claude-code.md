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

## Using the extension

By default the Claude Code chat opens in the right sidebar. That is where you type. The activity bar on the far left also has a Claude Code icon, but it opens the sessions list (new session, history), not the chat. Both come from the same extension. If you move the chat into the left sidebar, a second Claude Code icon shows up there for it.

### Open the chat

- Click the Claude Code icon in the editor toolbar (top-right of the editor). It shows when a file is open.
- Or open the Command Palette (`Ctrl+Shift+P`) and run **Claude Code: Focus on Claude Code View**.

### Move the panel

Drag the panel's tab or title bar to where you want it: the right sidebar, the left sidebar, or the editor area. Claude remembers the location.

### File context is automatic

The file you have open and any text you select are added to your prompt automatically. The prompt box shows the active file as a chip, and a "N lines selected" note when you select text. Press `Alt+K` to insert an @-mention with the file and line numbers.

## Trouble copying text from the terminal

If you have problems copying text from Claude Code in the VS Code terminal, run this command inside Claude Code:

```
/tui default
```

## Learn more

- [Claude Code VS Code extension documentation](https://code.claude.com/docs/en/vs-code)
