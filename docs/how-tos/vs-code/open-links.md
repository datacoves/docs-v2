---
title: Open Links from Datacoves VS Code
sidebar_label: Open Links
description: "Pick where links in VS Code open: the VS Code browser, a new browser tab, or the clipboard."
sidebar_position: 25
---
# How to open links from VS Code

Ctrl-clicking a link (Cmd-click on Mac) in the VS Code terminal or editor opens a popup that asks how you want
to open it:

![Open links popup](assets/link_popup.png)

The popup shows the URL and 3 choices.

## Open in VS Code browser

Opens the link in a tab inside VS Code. This is the Datacoves browser.

## Open in new browser window

Opens the URL in a new browser tab.

## Copy link

Copies the URL to the clipboard. The status bar shows `Link copied to the clipboard.`

## Cancel

Click **Cancel**, press Escape or close the popup to open nothing.

## Sign-in pages

Sign-in pages, such as `https://github.com/login/device`, show the same popup. So do the pages that a command
in the terminal opens for you, such as the sign-in page of `claude login`. A sign-in page that finishes on a
`localhost` callback only completes when you open it in the VS Code browser.
