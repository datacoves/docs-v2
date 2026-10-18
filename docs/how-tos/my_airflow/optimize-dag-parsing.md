---
title: "Optimize and Debug DAG Parsing in My Airflow"
sidebar_label: "Optimize DAG Parsing"
description: "Use the datacoves my parse-logs command to find slow-parsing DAGs and diagnose import errors in your personal My Airflow instance in Datacoves."
sidebar_position: 79
---
# Optimize and debug DAG parsing

Every DAG file is repeatedly read and executed by Airflow's dag-processor so it can build the DAGs it schedules. Slow or failing parsing shows up as DAGs that take a long time to appear, DAGs that never appear, or import errors in the UI. The `datacoves my parse-logs` command surfaces this information directly in your terminal so you can act on it while you develop.

:::note
My Airflow [must be instantiated](/docs/how-tos/my_airflow/start-my-airflow) for this command to work.
:::

## Find slow-parsing DAGs

Run the command with no arguments to get a report of how long each DAG file takes to parse, sorted slowest first:

```bash
datacoves my parse-logs
```

```text
                 My Airflow DAG parsing times (slowest first)
 File                                     Parse time   DAGs   Tasks
 dbt_dag.py                                   0.794s      1       1
 daily_loan_run.py                            0.400s      1       7
 other_examples/variable_via_secrets_...      0.250s      0       0
 notifications_examples/yaml_slack_dag.py     0.029s      1       1
 ...
```

The files at the top of the list are the ones worth optimizing. Common causes of slow parsing are heavy top-level imports, network or database calls made at parse time (rather than inside a task), and expensive module-level code. Move that work inside your tasks so it runs only when the task executes, not every time the file is parsed.

If you prefer the output exactly as Airflow produces it, add `--raw`:

```bash
datacoves my parse-logs --raw
```

## Debug a DAG that fails to parse or does not appear

When a DAG is missing from the UI or shows an import error, look at the parse log for that specific file. Pass `--file` with the DAG file name (a partial name is fine):

```bash
datacoves my parse-logs --file my_dag.py
```

The output shows the import errors, deprecation warnings, and other messages the dag-processor emitted while parsing that file, which usually points straight at the problem.

To watch the log update live while you edit and save the file, add `--follow` (`-f`):

```bash
datacoves my parse-logs --file my_dag.py --follow
```

Use `--lines` (`-n`) to control how many lines are shown (the default is 100).

## Reference

See [Datacoves CLI Commands](/docs/reference/airflow/datacoves-commands#datacoves-my-parse-logs) for the full list of options.
