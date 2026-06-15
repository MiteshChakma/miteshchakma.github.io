# Databricks Retail Pipeline Tutorial

Beginner-friendly Databricks project that turns raw retail orders into clean Delta tables and simple business metrics.

This project documents every step needed to install the Databricks CLI locally, authenticate to a Databricks workspace, upload sample data, deploy a Databricks Asset Bundle, and run a PySpark notebook workflow.

For a screenshot-by-screenshot implementation guide, use:

```text
docs/runbook-with-screenshots.md
```

Screenshot evidence should be saved in:

```text
docs/screenshots/
```

## What Was Installed Locally

Databricks CLI was installed on this Windows machine with:

```powershell
winget install Databricks.DatabricksCLI --accept-package-agreements --accept-source-agreements
```

Verification from the installed WinGet alias:

```powershell
& "$env:LOCALAPPDATA\Microsoft\WinGet\Links\databricks.exe" -v
```

Observed version:

```text
Databricks CLI v1.3.0
```

Note: the current PowerShell session did not immediately refresh PATH after install. A new terminal should usually recognize `databricks`. If it does not, use the WinGet alias path above or add this folder to PATH:

```text
C:\Users\mchak\AppData\Local\Microsoft\WinGet\Links
```

Official Databricks install docs used for the local setup:

- https://docs.databricks.com/aws/en/dev-tools/cli/install
- https://docs.databricks.com/aws/en/dev-tools/sdk-python

## Project Structure

```text
databricks-retail-pipeline/
  databricks.yml
  data/
    retail_orders.csv
  docs/
    runbook-with-screenshots.md
    screenshots/
  notebooks/
    retail_orders_pipeline.py
  sql/
    quality_checks.sql
```

## Scenario

A small ecommerce team wants to load order exports into Databricks, clean the data, and publish analytics-ready Delta tables:

- `retail_clean_orders`
- `retail_daily_metrics`
- `retail_customer_metrics`

The notebook reads the CSV, enforces useful types, derives revenue fields, filters invalid rows, and writes Delta tables.

## Prerequisites

1. Databricks workspace URL, for example:

   ```text
   https://dbc-xxxxxxxx-xxxx.cloud.databricks.com
   ```

2. Permission to create or use a cluster.
3. Unity Catalog volume or DBFS path for the sample CSV.

## Step 1: Authenticate The CLI

Open a new PowerShell terminal and run:

```powershell
databricks auth login --host https://YOUR-WORKSPACE-URL
```

If PATH has not refreshed yet:

```powershell
& "$env:LOCALAPPDATA\Microsoft\WinGet\Links\databricks.exe" auth login --host https://YOUR-WORKSPACE-URL
```

Verify authentication:

```powershell
databricks current-user me
```

## Step 2: Upload The Sample CSV

Recommended Unity Catalog volume path:

```text
/Volumes/main/default/demo/retail_orders.csv
```

Create the volume folder from Databricks SQL or the workspace UI if needed, then upload:

```powershell
databricks fs cp data/retail_orders.csv dbfs:/Volumes/main/default/demo/retail_orders.csv --overwrite
```

If your workspace does not use Unity Catalog volumes, use DBFS instead:

```powershell
databricks fs cp data/retail_orders.csv dbfs:/FileStore/databricks-retail-pipeline/retail_orders.csv --overwrite
```

Then update the notebook widget value `source_path` to match that path.

## Step 3: Deploy The Databricks Asset Bundle

From this folder:

```powershell
databricks bundle validate
databricks bundle deploy
```

The bundle creates a Databricks job named:

```text
retail-orders-pipeline
```

## Step 4: Run The Job

```powershell
databricks bundle run retail_orders_pipeline
```

The job runs `notebooks/retail_orders_pipeline.py` and writes Delta tables into the configured database/schema.

Default notebook parameters:

| Parameter | Default |
| --- | --- |
| `source_path` | `/Volumes/main/default/demo/retail_orders.csv` |
| `catalog_name` | `main` |
| `schema_name` | `default` |

## Step 5: Validate The Output

Open a Databricks SQL editor and run:

```sql
-- sql/quality_checks.sql
```

The checks look for duplicate order IDs, null customer IDs, invalid amounts, and basic revenue summaries by day and channel.

## Skills Demonstrated

- Databricks CLI installation and verification
- Databricks authentication workflow
- Databricks Asset Bundles
- PySpark CSV ingestion
- Delta table writes
- Simple data quality checks
- Analytics table design

## Resume Summary

Built a Databricks retail data pipeline tutorial that uses the Databricks CLI, Asset Bundles, PySpark, and Delta tables to load raw CSV orders, clean and enrich records, publish analytics-ready metrics, and validate output with SQL checks.
