---
title: Check Worker Consumption
sidebar_position: 57
---

# Billing API

Datacoves provides API endpoints for users to retrieve billing information about their environments, specifically the number of minutes billed for Airflow and Airbyte services. These endpoints are secured and require a **Project-level token** for authentication.

## Endpoints

### 1. List Billing Info for All Environments

**GET** `/api/v1/billing/`

Returns billing data for all environments the authenticated user has access to.

### 2. Billing Info for a Specific Environment

**GET** `/api/v1/billing/<environment_slug>/`

Returns billing data for a single environment, specified by its slug.

## Authentication

Use your **Project-level token** from your Project settings. Pass it as a Bearer token in the `Authorization` header:

```shell
Authorization: Bearer <your_project_token>
```

## Query Parameters

- `start_date` (optional): Start date in `YYYY-MM-DD` format. Default is 30 days ago.
- `end_date` (optional): End date in `YYYY-MM-DD` format. Default is today.
- `service` (optional): Filter by service name (`airflow` or `airbyte`).

**Note:**  

- Maximum allowed date range is 6 months (180 days).
- If the date range exceeds 6 months, the API returns an error.

## Example Request

```http
GET /api/v1/billing/?start_date=2025-03-01&end_date=2025-03-31&service=airflow
Authorization: Bearer <your_project_token>
```

## Example Response

```json
[
  {
    "environment_slug": "prod-env",
    "service": "airflow",
    "date": "2025-03-01",
    "minutes": 120
  },
  {
    "environment_slug": "prod-env",
    "service": "airbyte",
    "date": "2025-03-01",
    "minutes": 45
  }
]
```

## Error Responses

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

## Field Descriptions

- `environment_slug`: Slug identifier for the environment.
- `service`: Either `airflow` or `airbyte`.
- `date`: Date of the tally (YYYY-MM-DD).
- `minutes`: Billed minutes for the service on that date (rounded down from seconds).

## Notes

- Data is aggregated per day and per service.
- If no `service` parameter is provided, results include both Airflow and Airbyte.
- Only environments you have access to via your project token are included.

## Troubleshooting

- Ensure your token is valid and has access to the requested environments.
- Check date formats and range limits.
- For further assistance, contact Datacoves support.
