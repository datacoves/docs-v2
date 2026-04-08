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

The simplest sanity check. Compare the number of rows for the latest pipeline run on each side.

```sql
SELECT COUNT(*)
FROM schema.table
WHERE pipeline_start_utc = (SELECT MAX(pipeline_start_utc) FROM schema.table)
```

If both tables have zero rows, skip all remaining checks. If row counts differ, investigate before proceeding — deeper checks will be misleading if the data volume is fundamentally different.

:::note
Row count equality does not guarantee data equality. Two tables can have the same number of rows with completely different content.
:::

### Layer 2: JSON Structure (Key Count, Case Sensitivity, Types)

Fetch a representative row from each side and compare the `object_data` JSON structure:

- **Key count**: Do both rows have the same number of top-level keys?
- **Case sensitivity**: Are there keys that differ only in casing (e.g., `firstName` vs `FirstName`)?
- **Only in PRD / Only in SBX**: Keys that exist on one side but not the other.
- **Value types**: For shared keys, do the value types match?

:::warning
When comparing JSON structures, ensure you are comparing the **same record** on both sides. Fetching the "latest row" independently from each table may return completely different records, leading to false structural differences. Use a scored matching approach to find the corresponding row.
:::

### Layer 3: Sample Hash Verification

Take a sample of rows from PRD (e.g., 1000), compute their hash, and check if those hashes exist in SBX. This is a fast check that catches most mismatches without scanning the full table.

```sql
-- PRD: Get sample hashes
SELECT DISTINCT md5(object_data), object_data
FROM prd_table
WHERE pipeline_start_utc = :latest
LIMIT 1000

-- SBX: Check if hashes exist
SELECT object_data_hash
FROM sbx_table
WHERE pipeline_start_utc = :latest
AND object_data_hash IN (:hash_list)
```

:::note
Use `DISTINCT` on the hash to avoid counting duplicate rows as mismatches. Tables may contain legitimate duplicate rows that inflate the sample count.
:::

### Layer 4: Full Hash Comparison (MINUS)

Only run this after the sample check passes (to fast-fail on obvious mismatches). Use Snowflake's `MINUS` operator to find rows that exist on one side but not the other.

```sql
-- Rows in PRD but not in SBX
SELECT md5(object_data) AS hash
FROM prd_db.schema.table
WHERE pipeline_start_utc = :prd_latest
MINUS
SELECT object_data_hash AS hash
FROM sbx_db.schema.table
WHERE pipeline_start_utc = :sbx_latest
```

For cross-database comparisons, always use fully qualified table names (`database.schema.table`) since the query runs through a single connection.

## Common Pitfalls

### JSON Serialization Differences

Different loaders serialize JSON differently. Two records with identical data can produce different `md5(object_data)` hashes due to:

- **Key ordering**: `{"a":1,"b":2}` vs `{"b":2,"a":1}`
- **Number formatting**: `0.0` vs `0`, or `33.99831` vs `33.998310000000004`
- **Nested object stringification**: `{"key": {"sub": 1}}` vs `{"key": "{\"sub\": 1}"}`
- **Null representation**: A key with `null` value vs the key being absent entirely

When hash mismatches occur but parsed values are identical, the difference is purely in serialization. Use `HASH(PARSE_JSON(object_data))` for a normalized, order-independent comparison — but note this is slower since it parses every row's JSON.

```sql
-- Normalized comparison (slower, ignores formatting)
SELECT TO_VARCHAR(HASH(PARSE_JSON(object_data))) AS hash
FROM table
```

### Finding the Matching Row

When a hash mismatch is found, you need to locate the corresponding row on the other side to understand what changed. A score-based approach works well — score every column and return the row with the highest match:

```sql
SELECT object_data,
  (CASE WHEN object_data:"col1"::STRING = 'val1' THEN 1 ELSE 0 END +
   CASE WHEN object_data:"col2"::STRING = 'val2' THEN 1 ELSE 0 END +
   ...) AS match_score
FROM sbx_table
WHERE pipeline_start_utc = :latest
ORDER BY match_score DESC
LIMIT 1
```

:::tip
Compare all columns as `STRING` to avoid type cast errors (e.g., a date string failing a `::NUMBER` cast).
:::

### Floating Point Precision

When extracting `DECIMAL`/`NUMERIC` columns through connectors that use `float64` internally (like ConnectorX), precision drift can occur:

| Source Value | float64 Representation |
|-------------|----------------------|
| `33.99831` | `33.998310000000004` |

**Fix**: Cast the column to `FLOAT` with `ROUND` to the original scale in the extraction SQL query. The scale can be detected from `INFORMATION_SCHEMA.COLUMNS`:

```sql
ROUND(CAST([column] AS FLOAT), 5) AS [column]  -- 5 = original NUMERIC_SCALE
```

### Timestamp and Timezone Handling

Timestamp conversion is the most common source of data mismatches between different extraction tools.

**DST Spring-Forward**: When converting naive timestamps to UTC using `AT TIME ZONE`, the DST transition can cause 1-hour differences. For example, on March 31 at 01:00 CET, adding 1 hour crosses into CEST (offset changes from +1 to +2). When implementing DST ambiguity correction, only trigger on **fall-back** (offset decreases), not spring-forward (offset increases):

```sql
-- Correct: only trigger on fall-back (offset decreases)
CASE WHEN DATEPART(TZOFFSET, value AT TIME ZONE 'tz')
        > DATEPART(TZOFFSET, DATEADD(HOUR, 1, value) AT TIME ZONE 'tz')
     THEN 3600000 ELSE 0 END

-- Wrong: triggers on both spring-forward AND fall-back
CASE WHEN DATEPART(TZOFFSET, value AT TIME ZONE 'tz')
       != DATEPART(TZOFFSET, DATEADD(HOUR, 1, value) AT TIME ZONE 'tz')
     THEN 3600000 ELSE 0 END
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
