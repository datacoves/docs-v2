---
title: Comparing Tables Across Environments
sidebar_position: 5
---

# Comparing Tables Across Environments

## Overview

When migrating data pipelines (e.g., from Streamsets to dlt), it is critical to verify that the new pipeline produces identical data to the original. This guide documents best practices and common pitfalls for comparing tables across Snowflake databases, based on real-world experience comparing production (PRD) and sandbox (SBX) environments.

### How Data is Stored

In our setup, each pipeline extracts data from a source system and writes it as JSONL files to S3. These files are then loaded into Snowflake using the `COPY INTO` command. Each row in the target table contains an `object_data` column of type `VARIANT` that holds the full JSON payload for that record. The comparison techniques in this guide operate on this `object_data` column — hashing it, parsing it, and comparing its keys and values across environments.

### Why a Single JSON Column

Storing the entire record as a single `VARIANT` column rather than mapping each field to its own Snowflake column has several advantages for the raw/landing layer:

- **Schema flexibility**: Source schemas change frequently — new columns appear, old ones are renamed or removed. A single JSON column absorbs these changes without requiring `ALTER TABLE` statements or pipeline redeployment. The raw layer never breaks due to upstream schema drift.
- **Simplified loading**: `COPY INTO` with a single VARIANT column is a straightforward, universal pattern that works for any source system. There is no need to maintain column mappings or type casts at the loading stage.
- **Full-record hashing**: Comparing entire rows across environments becomes a single `MD5(object_data)` call. With separate columns, you would need to concatenate or hash each column individually, handle NULLs, and deal with column ordering — all of which introduce edge cases.
- **Auditability**: The raw JSON is preserved exactly as it was extracted. Downstream transformations (in dbt or similar tools) parse the JSON into typed columns, but the original payload remains available for debugging and reprocessing.
- **Decoupled extract and transform**: The extraction layer only needs to get data into Snowflake reliably. All type casting, column naming, and business logic happens in the transformation layer, keeping each stage simple and independently testable.

### Table Structure Assumptions

The queries in this guide assume each raw table has the following columns:

| Column | Type | Description |
|--------|------|-------------|
| `object_data` | `VARIANT` | The full JSON payload for a single record, loaded from a JSONL file via `COPY INTO`. |
| `pipeline_start_utc` | `TIMESTAMP` | The UTC timestamp of when the pipeline run started. Every row loaded in the same pipeline execution shares the same value. This acts as a batch identifier — it allows you to isolate the latest load and compare it against the corresponding load on the other side. |

These columns are added automatically by the loading framework. The `pipeline_start_utc` column is essential for comparison because tables accumulate data from multiple pipeline runs, and you typically want to compare only the most recent run on each side.

### Prerequisites

To run cross-database comparison queries (e.g., `MINUS` between PRD and SBX), both databases must be accessible from the same Snowflake connection. This requires setting up a database link or share from the production account to the sandbox account. For example, if your production data lives in `PRD_RAW` and sandbox data in `SBX_RAW`, both databases must be queryable from a single session so you can use fully qualified names like `PRD_RAW.MY_SCHEMA.MY_TABLE` and `SBX_RAW.MY_SCHEMA.MY_TABLE` in the same query.

If PRD and SBX are on separate Snowflake accounts, you can create a database in the PRD account that points to the SBX data (e.g., via Snowflake data sharing or a replicated database), allowing cross-database queries without switching connections.

## Comparison Strategy

A layered approach works best, progressing from cheap/fast checks to expensive/thorough ones. Each layer acts as a fast-fail gate — skip deeper checks if earlier ones fail.

### Layer 1: Row Count

The simplest sanity check. Compare the number of rows for the latest pipeline run on each side. Run these two queries and compare the results:

```sql
-- Count rows for the latest pipeline run in PRD
SELECT 'PRD' AS source, COUNT(*) AS row_count
FROM PRD_RAW.MY_SCHEMA.MY_TABLE
WHERE pipeline_start_utc = (
    SELECT MAX(pipeline_start_utc) FROM PRD_RAW.MY_SCHEMA.MY_TABLE
);

-- Count rows for the latest pipeline run in SBX
SELECT 'SBX' AS source, COUNT(*) AS row_count
FROM SBX_RAW.MY_SCHEMA.MY_TABLE
WHERE pipeline_start_utc = (
    SELECT MAX(pipeline_start_utc) FROM SBX_RAW.MY_SCHEMA.MY_TABLE
);
```

If both tables have zero rows, skip all remaining checks. If row counts differ, investigate before proceeding — deeper checks will be misleading if the data volume is fundamentally different.

:::note
Row count equality does not guarantee data equality. Two tables can have the same number of rows with completely different content.
:::

### Layer 2: JSON Structure (Key Count, Case Sensitivity, Types)

Fetch a representative row from each side and compare the JSON structure of the data column (e.g., `object_data`):

- **Key count**: Do both rows have the same number of top-level keys?
- **Case sensitivity**: Are there keys that differ only in casing (e.g., `firstName` vs `FirstName`)?
- **Missing keys**: Keys that exist on one side but not the other.
- **Value types**: For shared keys, do the value types match?

:::warning
When comparing JSON structures, ensure you are comparing the **same record** on both sides. Fetching the "latest row" independently from each table may return completely different records, leading to false structural differences. Use a scored matching approach (described below in "Finding the Matching Row") to find the corresponding row.
:::

### Layer 3: Sample Hash Verification

Take a sample of rows from one table, compute their content hash, and check if those hashes exist in the other table. This catches most mismatches without scanning the full table.

```sql
-- Step 1: Get 1000 distinct hashes from PRD
WITH prd_sample AS (
    SELECT DISTINCT MD5(object_data) AS row_hash
    FROM PRD_RAW.MY_SCHEMA.MY_TABLE
    WHERE pipeline_start_utc = (
        SELECT MAX(pipeline_start_utc) FROM PRD_RAW.MY_SCHEMA.MY_TABLE
    )
    LIMIT 1000
)
-- Step 2: Check how many of those hashes exist in SBX
SELECT
    (SELECT COUNT(*) FROM prd_sample) AS prd_sample_count,
    COUNT(s.row_hash) AS found_in_sbx
FROM prd_sample p
LEFT JOIN (
    SELECT DISTINCT MD5(object_data) AS row_hash
    FROM SBX_RAW.MY_SCHEMA.MY_TABLE
    WHERE pipeline_start_utc = (
        SELECT MAX(pipeline_start_utc) FROM SBX_RAW.MY_SCHEMA.MY_TABLE
    )
) s ON p.row_hash = s.row_hash;
```

If `found_in_sbx` equals `prd_sample_count`, all sampled rows match. Otherwise, investigate the missing hashes.

:::note
Use `DISTINCT` on the hash to avoid counting duplicate rows as mismatches. Tables may contain legitimate duplicate rows that inflate the sample count.
:::

### Layer 4: Full Hash Comparison (MINUS)

Only run this after the sample check passes (to fast-fail on obvious mismatches). Use Snowflake's `MINUS` operator to find rows that exist on one side but not the other:

```sql
-- Rows in PRD that are not in SBX
SELECT MD5(object_data) AS row_hash
FROM PRD_RAW.MY_SCHEMA.MY_TABLE
WHERE pipeline_start_utc = (
    SELECT MAX(pipeline_start_utc) FROM PRD_RAW.MY_SCHEMA.MY_TABLE
)
MINUS
SELECT MD5(object_data) AS row_hash
FROM SBX_RAW.MY_SCHEMA.MY_TABLE
WHERE pipeline_start_utc = (
    SELECT MAX(pipeline_start_utc) FROM SBX_RAW.MY_SCHEMA.MY_TABLE
);
```

Run the reverse direction as well (SBX MINUS PRD) to catch rows only in SBX. For cross-database comparisons, always use fully qualified table names (`database.schema.table`).

## Common Pitfalls

### JSON Serialization Differences

Different loaders serialize JSON differently. Two records with identical data can produce different `MD5(object_data)` hashes due to:

- **Key ordering**: `{"a":1,"b":2}` vs `{"b":2,"a":1}`
- **Number formatting**: `0.0` vs `0`, or `33.99831` vs `33.998310000000004`
- **Nested object stringification**: `{"key": {"sub": 1}}` vs `{"key": "{\"sub\": 1}"}`
- **Null representation**: A key with `null` value vs the key being absent entirely

When hash mismatches occur but parsed values are identical, the difference is purely in serialization. Use Snowflake's `HASH` function on the parsed JSON for a normalized, order-independent comparison:

```sql
-- Normalized comparison (slower, ignores JSON formatting differences)
SELECT TO_VARCHAR(HASH(PARSE_JSON(object_data))) AS normalized_hash
FROM PRD_RAW.MY_SCHEMA.MY_TABLE
WHERE pipeline_start_utc = (
    SELECT MAX(pipeline_start_utc) FROM PRD_RAW.MY_SCHEMA.MY_TABLE
);
```

This is slower than `MD5` because it parses every row's JSON, but it eliminates false positives from serialization differences.

### Finding the Matching Row

When a hash mismatch is found, you need to locate the corresponding row on the other side to understand what changed. A score-based approach works well — build a `CASE` expression for every column and return the row with the highest number of matching columns:

```sql
-- Given a PRD row with values col1='ABC', col2='123', col3='XYZ'
-- find the best matching row in SBX
SELECT
    object_data,
    (
        CASE WHEN object_data:"col1"::STRING = 'ABC' THEN 1 ELSE 0 END +
        CASE WHEN object_data:"col2"::STRING = '123' THEN 1 ELSE 0 END +
        CASE WHEN object_data:"col3"::STRING = 'XYZ' THEN 1 ELSE 0 END
    ) AS match_score
FROM SBX_RAW.MY_SCHEMA.MY_TABLE
WHERE pipeline_start_utc = (
    SELECT MAX(pipeline_start_utc) FROM SBX_RAW.MY_SCHEMA.MY_TABLE
)
ORDER BY match_score DESC
LIMIT 1;
```

:::tip
Compare all columns as `STRING` to avoid type cast errors. For example, a date stored as `'2026-03-12'` on one side and as an epoch integer on the other will fail a `::NUMBER` cast.
:::

### Floating Point Precision

When extracting `DECIMAL`/`NUMERIC` columns through connectors that use `float64` internally (like ConnectorX), precision drift can occur:

| Source Value | float64 Representation |
|-------------|----------------------|
| `33.99831` | `33.998310000000004` |

**Fix**: In the extraction query (run against the **source database**, not Snowflake), cast the column to `FLOAT` with `ROUND` to the original scale. The scale can be detected from the source's metadata. For example, in MSSQL:

```sql
-- Run on the source MSSQL database: detect the scale for DECIMAL/NUMERIC columns
SELECT COLUMN_NAME, NUMERIC_SCALE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'my_table'
  AND DATA_TYPE IN ('decimal', 'numeric');

-- Then apply ROUND in the extraction query (also on the source database)
SELECT ROUND(CAST(my_column AS FLOAT), 5) AS my_column  -- 5 = NUMERIC_SCALE
FROM dbo.my_table;
```

### Timestamp and Timezone Handling

Timestamp conversion is the most common source of data mismatches between different extraction tools.

**Understanding the problem**: Many source databases store timestamps without timezone information (naive timestamps). When converting these to epoch milliseconds (UTC), the extraction tool must assume a timezone. Different tools may apply this conversion differently, especially around Daylight Saving Time (DST) transitions.

**DST Spring-Forward**: During the spring-forward transition (e.g., last Sunday of March in Europe), clocks jump from 02:00 to 03:00. A timestamp at 01:00 CET is unambiguous, but checking its timezone offset against the offset one hour later (which is now CEST) reveals a change. Some implementations incorrectly add a 1-hour correction here.

The fix: only apply the correction during **fall-back** (last Sunday of October), when the timezone offset decreases (e.g., from CEST +02:00 back to CET +01:00). During fall-back, the hour between 02:00 and 03:00 repeats, creating genuine ambiguity. During spring-forward, there is no ambiguity — the offset increases but no correction is needed.

In MSSQL (run against the **source database** as part of the extraction query), you can detect this by comparing the timezone offset of the value against the offset of the value plus one hour:

```sql
-- MSSQL source query: correct — only trigger when timezone offset decreases (fall-back)
CASE WHEN DATEPART(TZOFFSET, CAST(my_col AS DATETIME2) AT TIME ZONE 'W. Europe Standard Time')
        > DATEPART(TZOFFSET, CAST(DATEADD(HOUR, 1, my_col) AS DATETIME2) AT TIME ZONE 'W. Europe Standard Time')
     THEN 3600000
     ELSE 0
END

-- MSSQL source query: wrong — triggers on any timezone offset change (including spring-forward)
CASE WHEN DATEPART(TZOFFSET, CAST(my_col AS DATETIME2) AT TIME ZONE 'W. Europe Standard Time')
       != DATEPART(TZOFFSET, CAST(DATEADD(HOUR, 1, my_col) AS DATETIME2) AT TIME ZONE 'W. Europe Standard Time')
     THEN 3600000
     ELSE 0
END
```

Here, `DATEPART(TZOFFSET, ...)` returns the UTC offset in minutes for a timezone-aware value. During fall-back the offset goes from 120 (CEST) to 60 (CET), so `120 > 60` is true and the correction applies. During spring-forward the offset goes from 60 to 120, so `60 > 120` is false and no correction is applied.

**Oracle-specific pitfalls**: Oracle's `FROM_TZ` function, which assigns a timezone to a naive timestamp, has additional edge cases:

- **Pre-1900 dates** (sentinel values like year 1111): Oracle uses historical Local Mean Time (LMT) for named timezones. For `Europe/Brussels`, LMT is `+0:17:30`, not `+01:00`. But JDBC/Java uses CET (`+01:00`) for all historical dates. This 43-minute difference causes mismatches. Fix: use a fixed offset `'+01:00'` instead of the named timezone for dates before 1900.
- **Far-future dates** (sentinel values like year 9621): Oracle's timezone data has a limited range. Beyond ~2100, `FROM_TZ` falls back to standard time regardless of the month. But Java extrapolates DST rules forever. Fix: apply the offset manually — use `'+02:00'` (CEST) for April–September and `'+01:00'` (CET) for October–March.
- **Normal dates (1900–2100)**: Use the named timezone (e.g., `'Europe/Brussels'`) and let Oracle handle DST transitions, which matches Java behavior.

```sql
-- Oracle source query: timezone selection with sentinel value handling
FROM_TZ(
    CAST(my_col AS TIMESTAMP),
    CASE
        WHEN my_col < DATE '1900-01-01' THEN '+01:00'
        WHEN my_col > DATE '2100-01-01' THEN
            CASE WHEN EXTRACT(MONTH FROM my_col) BETWEEN 4 AND 9
                 THEN '+02:00' ELSE '+01:00' END
        ELSE 'Europe/Brussels'
    END
) AT TIME ZONE 'UTC'
```

**DATE vs DATETIME**: Columns stored as `DATE` (no time component) should be converted to epoch milliseconds at midnight in the target timezone. JDBC-based tools like Streamsets do this automatically; custom pipelines must handle it explicitly. In Oracle specifically, `DATE` columns store both date and time, but some connectors (like ConnectorX) may read them as date-only, losing the time component. Detect these from `ALL_TAB_COLUMNS` metadata and force a `TIMESTAMP` cast.

### Null Column Handling

Different extraction systems handle null columns differently:

- **Streamsets** creates columns for the union of all fields across all records, filling `null` for records that don't have a given field.
- **dlt** by default strips keys with null values during JSON serialization.
- **Elasticsearch** returns only the fields that exist in each document.

When columns are always null (they only exist in the schema, never populated in the data), they may be stripped by the new pipeline. This leads to "only in PRD" differences where every missing column has a value of `None`.

Solutions include declaring expected columns via schema hints, patching the serializer to preserve null values, or collecting all keys across all records and backfilling `null` for missing ones.

### Nested Object Flattening

Different systems flatten nested JSON in incompatible ways:

| System | Input | Output |
|--------|-------|--------|
| Streamsets | `{a: {b: 1}}` | `a.b: 1` (dot-separated) |
| Streamsets | `{a: [{b: 1}, {b: 2}]}` | `a.0.b: 1, a.1.b: 2` (indexed arrays) |
| dlt (max_table_nesting=0) | `{a: {b: 1}}` | `a: "{\"b\": 1}"` (stringified) |
| dlt (default) | `{a: {b: 1}}` | Separate child table |

When migrating from Streamsets and the downstream models depend on the dot-notation column names, custom flattening logic may be needed to match the expected format with indexed arrays.

## Recommended Comparison Workflow

1. **Row count** first — skip everything if both sides have zero rows
2. **JSON structure** — compare key counts, names, and types on matched rows
3. **Sample verification** (1000 rows) — fast-fail on hash mismatches
4. **Full MINUS comparison** — only if sampling passes
5. **Row-level diff** — for mismatched rows, use scored matching and column-by-column comparison
6. **Raw JSON diff** — when parsed values match but hashes differ, compare the raw JSON strings to identify serialization differences
