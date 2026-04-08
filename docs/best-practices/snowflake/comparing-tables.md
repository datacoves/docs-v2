---
title: Comparing Tables Across Environments
sidebar_position: 5
---

# Comparing Tables Across Environments

## Overview

When migrating data pipelines (e.g., from Streamsets to dlt), it is critical to verify that the new pipeline produces identical data to the original. This guide documents best practices and common pitfalls for comparing JSON-based tables across Snowflake databases, based on real-world experience comparing production (PRD) and sandbox (SBX) environments.

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
FROM MY_SCHEMA.MY_TABLE
WHERE pipeline_start_utc = (
    SELECT MAX(pipeline_start_utc) FROM MY_SCHEMA.MY_TABLE
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

**Fix**: In the extraction query, cast the column to `FLOAT` with `ROUND` to the original scale. The scale can be detected from `INFORMATION_SCHEMA.COLUMNS`:

```sql
-- Detect the scale for DECIMAL/NUMERIC columns
SELECT COLUMN_NAME, NUMERIC_SCALE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'my_table'
  AND DATA_TYPE IN ('decimal', 'numeric');

-- Then apply ROUND in the extraction query
SELECT ROUND(CAST(my_column AS FLOAT), 5) AS my_column  -- 5 = NUMERIC_SCALE
FROM dbo.my_table;
```

### Timestamp and Timezone Handling

Timestamp conversion is the most common source of data mismatches between different extraction tools.

**DST Spring-Forward**: When converting naive timestamps to UTC using `AT TIME ZONE`, the DST transition can cause 1-hour differences. For example, on March 31 at 01:00 CET, adding 1 hour crosses into CEST (offset changes from +1 to +2). When implementing DST ambiguity correction, only trigger on **fall-back** (offset decreases), not spring-forward (offset increases):

```sql
-- Correct: only trigger on fall-back (offset decreases)
CASE WHEN DATEPART(TZOFFSET, CAST(my_col AS DATETIME2) AT TIME ZONE 'W. Europe Standard Time')
        > DATEPART(TZOFFSET, CAST(DATEADD(HOUR, 1, my_col) AS DATETIME2) AT TIME ZONE 'W. Europe Standard Time')
     THEN 3600000
     ELSE 0
END

-- Wrong: triggers on both spring-forward AND fall-back
CASE WHEN DATEPART(TZOFFSET, CAST(my_col AS DATETIME2) AT TIME ZONE 'W. Europe Standard Time')
       != DATEPART(TZOFFSET, CAST(DATEADD(HOUR, 1, my_col) AS DATETIME2) AT TIME ZONE 'W. Europe Standard Time')
     THEN 3600000
     ELSE 0
END
```

**DATE vs DATETIME**: Columns stored as `DATE` (no time component) should be converted to epoch milliseconds at midnight in the target timezone. JDBC-based tools like Streamsets do this automatically; custom pipelines must handle it explicitly.

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
