---
title: "Find Slow-Parsing DAGs with the REST API"
sidebar_label: "DAG parsing times"
description: "Use the Airflow REST API to list DAG parse durations and find slow-parsing DAGs in Team Airflow and My Airflow on Datacoves."
sidebar_position: 40
---
# Find slow-parsing DAGs with the REST API

Every DAG file is re-parsed continuously by the dag-processor. A DAG that is slow to parse (top-level code doing imports, API calls, or file reads) delays scheduling for every DAG in the environment, so parse times are one of the first things to check when Airflow feels sluggish.

On Airflow 3 environments, the dag-processor records each DAG's most recent parse duration and the REST API exposes it, so you can get the real parsing-time report with a simple API call: no access to the dag-processor pod is needed.

:::info
This guide targets **Team Airflow** on Airflow 3 environments. For **My Airflow**, use the [`datacoves my parse-logs`](/docs/reference/airflow/datacoves-commands#datacoves-my-parse-logs) command instead, which shows the same report plus the parse log of individual DAG files.

Airflow 2 does not expose parse durations through its API; see [the note below](#airflow-2-environments).
:::

## What you need

1. An Airflow API token for the target environment: in the launchpad, go to **Environments**, open your environment's **Keys**, and click **Generate New Airflow Token**. Copy the token immediately -- it is only shown once.
2. The **Airflow API URL** shown on that same page (`https://airflow-<env>.<your-domain>/api/v2/`).
3. Store both in a `.env` file (and add it to `.gitignore`):

```env
AIRFLOW_API_URL = "https://airflow-your-env.your-domain.com/api/v2/"
AIRFLOW_API_TOKEN = "your-token-here"
```

The script works the same from CI, from Datacoves VSCode, or from any environment you use to reach Datacoves -- the Airflow API endpoints are reachable from all of them.

## Get the parsing-time report

The `GET /dags` endpoint returns `last_parse_duration` (seconds) and `last_parsed_time` for every DAG. The script below fetches all DAGs (paginated) and prints them slowest-first, the same shape as the `datacoves my parse-logs` report:

```python
# dag_parse_times.py
import os

import requests
from dotenv import load_dotenv

load_dotenv()
API_URL = os.getenv("AIRFLOW_API_URL").rstrip("/")
HEADERS = {"Authorization": f"Bearer {os.getenv('AIRFLOW_API_TOKEN')}"}


def fetch_all_dags():
    dags, offset = [], 0
    while True:
        response = requests.get(
            f"{API_URL}/dags",
            headers=HEADERS,
            params={"limit": 100, "offset": offset},
        )
        response.raise_for_status()
        payload = response.json()
        dags.extend(payload["dags"])
        offset += 100
        if offset >= payload["total_entries"]:
            return dags


def print_parse_report(dags):
    dags.sort(key=lambda d: d.get("last_parse_duration") or 0, reverse=True)
    print(f"{'DAG':<50} {'Parse time':>12} {'Last parsed'}")
    for dag in dags:
        duration = dag.get("last_parse_duration")
        duration = f"{duration:.3f}s" if duration is not None else "-"
        parsed_at = dag.get("last_parsed_time") or "-"
        print(f"{dag['dag_id']:<50} {duration:>12} {parsed_at}")


if __name__ == "__main__":
    print_parse_report(fetch_all_dags())
```

Example output:

```
DAG                                                  Parse time Last parsed
daily_loan_run                                           2.153s 2026-08-18T14:02:11.480217Z
variables_python_script                                  0.310s 2026-08-18T14:02:10.912304Z
simple_bash_dag                                          0.052s 2026-08-18T14:02:10.598721Z
```

A parse time consistently above ~1 second is worth investigating: the usual cause is work done at the top level of the DAG file (imports of heavy libraries, `Variable.get` outside a task, reading files or calling APIs during parsing). See [Airflow's best practices on top-level code](https://airflow.apache.org/docs/apache-airflow/stable/best-practices.html#top-level-python-code) for how to restructure it.

:::tip
`last_parse_duration` reflects the most recent parse by the environment's dag-processor -- the number that actually matters for scheduling latency. Running `airflow dags report` inside a DAG task measures a worker's copy of the files under different conditions and can be misleading.
:::

## Alternative: authenticate as your own user

The Airflow API token above belongs to the environment's service account and is a JWT with an expiration date, so long-lived automation would need re-generating it. As an alternative, you can authenticate with your personal Datacoves API key (generated under [User Settings > My Airflow API](/docs/how-tos/my_airflow/use-my-airflow-api) -- despite the name, it is a general Datacoves key): exchange it for a short-lived Airflow JWT at `POST /auth/token` using the special `__datacoves_token__` username. This authenticates you as **your own user** with your permissions, the key does not expire, and the same key works against **any environment you have access to**:

```python
def get_jwt(base_url, datacoves_api_key):
    """Exchange a Datacoves API key for a short-lived Airflow JWT."""
    response = requests.post(
        f"{base_url}/auth/token",
        json={"username": "__datacoves_token__", "password": datacoves_api_key},
    )
    response.raise_for_status()
    return response.json()["access_token"]
```

Use the returned token in the same `Authorization: Bearer` header as above (`base_url` is the Airflow URL without `/api/v2`).

## Airflow 2 environments

Airflow 2 records when each DAG was last parsed (`last_parsed_time`) but not how long it took, and its REST API does not expose parse durations. This is a known limitation; parse times there only exist in the dag-processor manager logs. Since new Datacoves environments run Airflow 3, no Airflow 2-specific tooling is provided -- upgrading is the path to this report.
