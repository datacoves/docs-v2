---
title: Airflow Variables
sidebar_position: 123
---
Datacoves injects several environment variables into Apache Airflow to streamline workflow configurations. Below is a list of important variables you may encounter:

## Airflow information
Variables containing information about Airflow:
- `DATACOVES__AIRFLOW_NOTIFICATION_INTEGRATION`: Notification service for Airflow alerts.  May be `SLACK` or `TEAMS`
- `DATACOVES__AIRFLOW_TYPE`: May be `team_airflow` or `my_airflow`, useful for environment-specific logic like sending email alerts
- `DATACOVES__DAGS_FOLDER`: Path where Airflow searches for DAGs, typically `orchestrate/dags`
- `DATACOVES__DBT_HOME`: Read-only dbt home directory containing `dbt_project.yml`, typically `transform`
- `DATACOVES__DBT_PROFILE`: Current dbt profile, commonly `default`
- `DATACOVES__REPO_PATH`: Path to read-write copy of Airflow repo
- `DATACOVES__REPO_PATH_RO`: Path to read-only copy of Airflow repo
- `DATACOVES__YAML_DAGS_FOLDER`: Path to YAML files used by dbt-coves to generate Python DAGs, typically `orchestrate/dags_yml_definitions`

## Datacoves environment information
Variables containing information about the current Datacoves environment:
- `DATACOVES__ACCOUNT_ID`: Account ID number
- `DATACOVES__ACCOUNT_SLUG`: Account slug
- `DATACOVES__ENVIRONMENT_SLUG` Environment slug (e.g. dev123)
- `DATACOVES__PROJECT_SLUG`: Project slug (e.g. balboa-analytics-datacoves)

## Version information
Variables containing versions:
- `DATACOVES__SQLFLUFF_VERSION`: Current version of SQLFLuff
- `DATACOVES__VERSION`: Complete version of Datacoves including patch level
- `DATACOVES__VERSION_MAJOR_MINOR`: Datacoves version excluding patch level (e.g. 5.0)
- `DATACOVES__VERSION__ENV`: Complete version of Datacoves including patch level for this environment
- `DATACOVES__VERSION_MAJOR_MINOR__ENV`: Datacoves version excluding patch level for this environment
