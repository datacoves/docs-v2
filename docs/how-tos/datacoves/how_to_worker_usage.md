---
title: Worker Usage Minutes API
sidebar_position: 55
---

# Billing API

Datacoves provides API endpoints for users to retrieve billing information about their environments. Specifically, admins can get the number of minutes billed for Airflow and Airbyte services. These endpoints are secured and require a **Project-level token** for authentication.

This guide explains how to use the Datacoves Billing API to retrieve worker usage minutes for your environment(s).

## Billing API URL & Generating an API Key

To obtain the Billing API URL and your API key:

1. Navigate to your project settings in the Datacoves admin panel
2. Go to the **Keys** section
3. Copy the **Billing API URL** we will use it below 
4. Click on **Generate New API Key**

![Generate API Key](./assets/project-apikey.png)

Once generated, copy and securely store your API key. It will only be shown once.

## General API information

### Authentication

Include the key in the `Authorization` header:

```
Authorization: Token YOUR_API_KEY
```

### Service Types

The API categorizes worker usage by service type:

- **airflow**: Usage from Airflow workers
- **airbyte**: Usage from Airbyte workers  
- **unknown**: Usage that couldn't be categorized

### Notes

- API can only be accessed from within the same cluster e.g. you can run the script in the terminal in VS Code or in Airflow
- All dates should be in `YYYY-MM-DD` format
- If no dates are provided, the API defaults to providing the usage for the last 30 days
- If no `service` parameter is provided, results include both Airflow and Airbyte.
- The `amount_minutes` field represents the total minutes of worker usage excluding "warm-up" time
- Data is aggregated per day and per service.
- Times are returned in UTC format
- Only environments you have access to via your project token are included.

**Query Note:**
- Maximum allowed date range is 6 months (180 days). To query more than this, multiple queries must be run.
- If the date range exceeds 6 months, the API returns an error.

### Troubleshooting

- Ensure your token is valid and has access to the requested environments.
- Check date formats and range limits.
- For further assistance, contact Datacoves support.


## API Endpoints

The Billing API URL should be similar to `https://api.<Cluster_URL>/api/v1/billing`

### Get Usage for All Environments

**GET** `<BILLING_API_URL>/`

Returns usage data for all environments in your account.

### Get Usage for a Specific Environment

`env-slug` is the slug for the specific environment like `abc123`

**GET** `<BILLING_API_URL>/{env-slug}/`

Returns usage data for the environment specified.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `env-slug` | string | Yes | The slug identifier for your environment |

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `start_date` | string (YYYY-MM-DD) | No | Today - 30 days | The start date for the usage period |
| `end_date` | string (YYYY-MM-DD) | No | Today's date  | The end date for the usage period |
| `service` | string | No | All services | Filter by service type: `airflow`, `airbyte`, or `unknown` |

## Response Format

The API returns an array of usage records with the following fields:

| Field | Type | Description |
|-------|------|-------------|
| `environment_slug` | string | The environment identifier |
| `service` | string | The service type: `airflow`, `airbyte`, or `unknown` |
| `date` | datetime | The timestamp of the usage record |
| `amount_minutes` | integer | The number of minutes used |

### Sample Response

```json
[
  {
    "environment_slug": "abc123",
    "service": "airflow",
    "date": "2025-11-15T10:30:00Z",
    "amount_minutes": 120
  },
  {
    "environment_slug": "abc123",
    "service": "airbyte",
    "date": "2025-11-15T14:20:00Z",
    "amount_minutes": 60
  }
]
```

## Sample Error Responses

- **Invalid date format:**

  ```json
  { "error": "Invalid date format. Use YYYY-MM-DD." }
  ```

- **Date range exceeds 6 months:**

  ```json
  { "error": "Date range cannot exceed 6 months (180 days)." }
  ```

- **Start date after end date:**

  ```json
  { "error": "start_date must be before end_date." }
  ```

## Sample Python Script

Create a `.env` file with the following variables
```shell
DATACOVES__API_URL = "https://..."
DATACOVES__API_TOKEN = "...."
DATACOVES__ENVIRONMENT = "abc123"
```

Use the API in a Python script to query usage:

```python
import requests
import os
from dotenv import load_dotenv

load_dotenv()
API_URL = os.getenv("DATACOVES__API_URL")
API_KEY = os.getenv("DATACOVES__API_TOKEN")
ENV_SLUG = os.getenv("DATACOVES__ENVIRONMENT")

def get_worker_usage(start_date=None, end_date=None, service=None, env_slug=None):
    """
    Retrieve worker usage minutes for an environment or all environments.

    Args:
        env_slug (str, optional): Environment slug. If None, returns data for all environments
        start_date (str, optional): Start date in YYYY-MM-DD format
        end_date (str, optional): End date in YYYY-MM-DD format
        service (str, optional): Filter by service type (airflow, airbyte, unknown)

    Returns:
        list: Usage records
    """
    if env_slug:
        url = f"{API_URL}/{env_slug}/"
    else:
        url = f"{API_URL}/"

    params = {}
    if start_date:
        params['start_date'] = start_date
    if end_date:
        params['end_date'] = end_date
    if service:
        params['service'] = service

    response = requests.get(
        url=url,
        headers={"Authorization": f"Token {API_KEY}"},
        params=params
    )

    print(f"Fetching: {response.url}")

    if not response.ok:
        print(response.text)
        return

    response.raise_for_status()
    return response.json()

def calculate_total_minutes_by_service(usage_data):
    """
    Calculate total minutes used per service.

    Args:
        usage_data (list): Usage records from API

    Returns:
        dict: Total minutes per service
    """
    totals = {}

    for record in usage_data:
        service = record['service']
        minutes = record['amount_minutes']
        totals[service] = totals.get(service, 0) + minutes
    return totals

def print_usage_info(usage):

    totals = calculate_total_minutes_by_service(usage)

    for service, minutes in totals.items():
        hours = minutes / 60
        print(f"  {service}: {minutes} minutes ({hours:.2f} hours)")


# Example: Get usage for last 30 days
print("#### Usage for last 30 days ####")
usage = get_worker_usage()
if usage:
    print_usage_info(usage)
else:
    print("No Usage Data Returned for the last 30 days")

# Example: Specific date range
start_date = "2025-07-01"
end_date = "2025-12-27"
print(f"\n#### Usage for {start_date} through {end_date} ####")

usage = get_worker_usage(start_date, end_date)

if usage:
    print_usage_info(usage)
else:
    print(f"No Usage Data Returned for {start_date} to {end_date}")

# Example: specific environment
print(f"\n#### Usage for environment {ENV_SLUG} ####")

usage = get_worker_usage(env_slug=ENV_SLUG)

if usage:
    print_usage_info(usage)
else:
    print(f"No Usage Data Returned for environment {ENV_SLUG} from {start_date} to {end_date}")
```
