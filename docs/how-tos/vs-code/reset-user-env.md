---
title: Reset Your User Environment in Datacoves VS Code
sidebar_label: Reset User Env
description: "How to reset your personal VS Code user environment in Datacoves when the project's git repository changes or your workspace becomes inconsistent."
sidebar_position: 80
---
# Reset the User's Env if the git Repository is Changed in the Project. 

If you need to reset your user environment because you change the repo associated with your environment after one has already been cloned or if the repo fails to clone, you will need to remove the workspace folder and reset the environment. 

- Open terminal and enter the following commands. If you get an error when opening the terminal because you don't have a `transform` folder or similar, simply right click in the file area and select `Open in Integrated Terminal`

```bash
cd ~/
```
```bash
rm -rf workspace
```
```bash
mkdir workspace
```

- Click `Transform` tab
- Select `Reset my Environment` 
- Select `OK, Go ahead` 
