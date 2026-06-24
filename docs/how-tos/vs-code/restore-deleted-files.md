---
title: Restore Deleted Files
sidebar_label: Restore Deleted Files
sidebar_position: 90
description: Recover accidentally deleted files or restore previous file versions using VS Code's built-in Local History feature.
---

# Restore Deleted Files Using Local History

VS Code keeps a local history of your files, allowing you to recover deleted files or restore previous versions even if you haven't committed your changes to Git.

<iframe
  width="800"
  height="500"
  src="https://www.youtube.com/embed/BW-TnzVSJXM"
  frameborder="0"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
  allowfullscreen
></iframe>

## When to Use This

- You accidentally deleted a file that wasn't committed to Git.
- You made changes to a file but didn't commit them and want to go back to an earlier version.
- You closed a file after deleting it and need to recover its contents.

## Steps to Restore a File

1. Open the **Command Palette** (`Ctrl+Shift+P` / `Cmd+Shift+P`).
2. Search for **Local History: Find Entry to Restore**.
3. Type the name of the file you want to recover.
4. Select the snapshot you want to restore. If the file had multiple saves, you will see multiple snapshots to choose from.
5. In the history view, click the **checkmark icon** (✓) on the right side of the snapshot entry to restore the file.
