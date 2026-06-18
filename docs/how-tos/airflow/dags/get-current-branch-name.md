---
title: Get the Git Branch Name from an Airflow DAG Task
sidebar_label: Get Git Branch Name
description: "Retrieve the current git branch name from within an Airflow DAG task in Datacoves for branch-specific logic or conditional pipeline behavior."
sidebar_position: 24
---
# Retrieving the Current Branch Name in a Git Repository

In Airflow, Datacoves will place your repo into `/opt/airflow/dags/` 

To retrieve the current branch name in a Git repository. 


``` bash
cat /opt/airflow/dags/.git/HEAD | sed 's~ref: refs/heads/~~'
```

### This command consists of two parts:

`cat .git/HEAD`: This part of the command displays the content of the HEAD file, which contains a reference to the current branch in the Git repository.

`sed 's~ref: refs/heads/~~'`: The output of the cat command is then piped to the sed command, which is used to remove the `ref: refs/heads/` prefix from the branch name, thereby extracting the current branch name.

