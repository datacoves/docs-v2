---
title: Customize Your Shell with .bash_custom
sidebar_position: 30
---
# How to Customize Your Shell Environment

Datacoves provides a `.bash_custom` file that allows you to personalize your shell environment. This file is sourced automatically when your terminal starts, giving you a place to define custom aliases, functions, and prompt configurations.

:::warning
The `.bash_custom` file is stored in your user volume, not in your git repository. We recommend keeping a backup of this file in case you need to restore it. If your volume is ever reset or lost, this file would need to be recreated.
:::

## Opening .bash_custom

To open or create your `.bash_custom` file, run the following command in the terminal:

```bash
code ~/.bash_custom
```

This will open the file in VS Code where you can add your customizations.

## Example: Show Git Branch in Your Prompt

A common customization is displaying the current git branch in your terminal prompt. Add the following to your `.bash_custom`:

```bash
# Function to parse git branch
parse_git_branch() {
    git branch 2> /dev/null | sed -e '/^[^*]/d' -e 's/* \(.*\)/(\1)/'
}

# Set prompt to show path and git branch
PS1="\[\e[38;2;173;216;230m\]\w \[\e[38;2;255;255;255m\]\$(parse_git_branch)\[\e[00m\]$ "
```

## Example: Custom Git Aliases

Datacoves [pre-configures several git aliases](/docs/getting-started/developer/using-git#aliased-commands) like `git co`, `git br`, `git st`, and `git l`. Since Datacoves manages the `.gitconfig` file, you can use `.bash_custom` to add additional custom git aliases:

```bash
# Add custom git aliases
git config --global alias.unstage 'reset HEAD --'
git config --global alias.last 'log -1 HEAD'
```

After saving and restarting your terminal (or running `source ~/.bash_custom`), you can use these shortcuts:

```bash
git unstage file.txt   # unstage a file
git last               # show the last commit
```

## Example: Custom Aliases

```bash
# Aliases
alias ll='ls -la'
alias cls='clear'
```

## Applying Changes

After editing `.bash_custom`, you can apply changes immediately without restarting the terminal:

```bash
source ~/.bash_custom
```

Or simply open a new terminal session.
