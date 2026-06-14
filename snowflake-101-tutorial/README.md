# Snowflake 101 Retail Analytics Tutorial

This is a beginner-friendly Snowflake project designed as a resume portfolio artifact. It demonstrates how a small ecommerce CSV extract can be staged, loaded into a raw warehouse table, transformed into an analytics-ready table, and validated with SQL checks.

## Project Goal

The goal of this project is to show practical Snowflake fundamentals in a clear, reviewable way. I wanted to build a small project that answers a common interview question: "Can you take source data and turn it into a clean analytics table inside a cloud data warehouse?"

The project is intentionally compact. Instead of hiding the important ideas behind a large framework, it focuses on the core workflow used in many data engineering and analytics engineering jobs:

- create Snowflake objects
- stage a CSV file
- load raw data with `COPY INTO`
- transform raw rows into clean analytics records
- apply business rules in SQL
- run data quality checks
- produce business summary queries

## Business Scenario

A small ecommerce team exports order data from its operational system. The team wants a clean warehouse table for reporting revenue, returns, channels, customer order behavior, and regional performance.

The source file is a simple CSV called `orders.csv`. In a real company, this file could come from an ecommerce platform, POS system, CRM export, or upstream ingestion job. For this tutorial, the dataset is synthetic so it is safe to publish on a portfolio website.

## Tech Stack And Setup

This tutorial is intentionally small. The main goal is to demonstrate Snowflake warehouse fundamentals without adding extra tools too early.

Required:

- Snowflake account or trial account
- Snowsight access in the browser
- Permission to create a database, schema, warehouse, stage, and tables
- Included CSV file: `data/orders.csv`
- Included SQL files in `sql/`

Optional:

- SnowSQL, only if you want to upload the CSV from your terminal with `PUT`. `PUT` is a SnowSQL/client command, not a normal Snowsight worksheet command.
- Git, only if you want to clone or version the project locally
- VS Code or another editor for reading SQL files
- Spreadsheet viewer for manually inspecting the CSV

Not required for this beginner version:

- Python
- Docker
- Local database
- dbt
- Airflow
- AWS S3, Azure Blob Storage, or Google Cloud Storage

## Data Source

The data is synthetic ecommerce order data created specifically for this tutorial. It is not copied from a real company, private customer system, Kaggle, or a commercial dataset.

I used synthetic data because this project is public and should be safe for a portfolio website. The rows were designed to look like a realistic order export while remaining small enough for a beginner to inspect manually.

The dataset includes:

- completed orders
- returned orders
- cancelled orders
- multiple customers
- repeated customers
- multiple regions
- web, mobile, and store channels
- product categories
- discounts

This mix allows the project to demonstrate real transformation logic. For example, a returned order should remain visible in the analytics table, but it should not increase completed revenue.

## What I Tried To Achieve

I built this project to demonstrate that I understand the first principles of Snowflake data work:

- how raw data enters Snowflake through a stage
- why file formats matter when loading CSV data
- how raw tables differ from analytics tables
- how `COPY INTO` works for batch loading
- how SQL transformations encode business rules
- how quality checks make a pipeline easier to trust
- how to explain a data pipeline clearly to technical and non-technical reviewers

This is not meant to be a production-scale warehouse. It is a Snowflake 101 tutorial that makes the foundations visible.

## Why This Flow Was Chosen

The project uses this flow:

```text
CSV file -> Snowflake internal stage -> RAW_ORDERS -> ANALYTICS_ORDERS -> quality checks
```

I chose this structure because each part has a clear job:

| Step | Why it exists | Problem it solves |
| --- | --- | --- |
| CSV source file | Represents a business export from an order system. | Gives the tutorial a realistic starting point. |
| Internal stage | Snowflake loads files from stages. | Avoids needing external cloud storage for a beginner project. |
| File format | Defines how Snowflake reads headers, quotes, blanks, and CSV fields. | Prevents parsing mistakes during load. |
| Raw table | Keeps a landing copy close to the source file. | Makes loading issues easier to debug. |
| Analytics table | Applies business rules and cleaned fields. | Produces a table suitable for reports or dashboards. |
| Quality checks | Tests whether the output can be trusted. | Catches duplicates, missing IDs, and invalid financial values. |

## Project Structure

```text
snowflake-101-tutorial/
  data/
    orders.csv
  sql/
    01_setup.sql
    02_load_raw_orders.sql
    03_transform_orders.sql
    04_quality_checks.sql
```

## Data Model

The source file contains one row per order.

| Column | Meaning |
| --- | --- |
| `order_id` | Unique order identifier |
| `customer_id` | Customer identifier |
| `order_date` | Date when the order was placed |
| `region` | Sales region |
| `channel` | Web, mobile, or store channel |
| `product_category` | Product group |
| `quantity` | Units ordered |
| `unit_price` | Price per unit |
| `discount_amount` | Discount applied to the order |
| `status` | Completed, returned, or cancelled |

## Snowflake Objects Created

The setup script creates:

- database: `RESUME_DEMO_DB`
- schema: `RETAIL_ANALYTICS`
- warehouse: `COMPUTE_WH`
- file format: `CSV_WITH_HEADER`
- internal stage: `ORDER_STAGE`
- raw table: `RAW_ORDERS`
- analytics table: `ANALYTICS_ORDERS`

## How To Run The Tutorial

Use Snowsight worksheets for the SQL files. Upload the CSV through Snowsight's stage upload screen or through a Snowflake client such as SnowSQL or Snowflake CLI.

### 0. Prepare Snowflake

Open Snowsight and choose a role that can create objects. In a personal trial account this may be `ACCOUNTADMIN`. In a shared or work account, a limited learning role with permission to create databases, schemas, warehouses, stages, and tables is better.

This matters because Snowflake permissions are role-based. If your role cannot create objects, `01_setup.sql` will fail before the tutorial starts.

### 1. Inspect The Source File

Open:

```text
data/orders.csv
```

Check that the file has:

- one header row
- 10 order rows
- `completed`, `returned`, and `cancelled` statuses
- numeric `quantity`, `unit_price`, and `discount_amount` fields
- repeated customers and multiple sales channels

This matters because the SQL logic is based on what exists in the source file. For example, the CSV has a header row, so the Snowflake file format uses `SKIP_HEADER = 1`.

### 2. Run Setup

```sql
-- sql/01_setup.sql
```

This creates the database, schema, warehouse, CSV file format, internal stage, and raw table.

Objects created:

- `RESUME_DEMO_DB`
- `RETAIL_ANALYTICS`
- `COMPUTE_WH`
- `CSV_WITH_HEADER`
- `ORDER_STAGE`
- `RAW_ORDERS`
- `ANALYTICS_ORDERS` is created later by `03_transform_orders.sql`

Important rerun note: `01_setup.sql` uses `CREATE OR REPLACE STAGE`. Replacing an internal stage removes files already uploaded to that stage. Run setup first, then upload `orders.csv`. If you rerun setup later, upload the CSV again before running the load script.

### 3. Upload The CSV

Upload this file into the `ORDER_STAGE` internal stage:

```text
data/orders.csv
```

If using SnowSQL from your terminal in the project folder, use:

```sql
PUT file://data/orders.csv @ORDER_STAGE AUTO_COMPRESS=TRUE;
```

The Snowsight upload path is easiest for beginners. The SnowSQL `PUT` command is useful if you want a more command-line-oriented workflow, but it is not something you paste into a normal Snowsight worksheet.

Optional verification after upload:

```sql
LIST @ORDER_STAGE;
```

### 4. Load Raw Data

```sql
-- sql/02_load_raw_orders.sql
```

This truncates `RAW_ORDERS`, loads the staged CSV using `COPY INTO`, and returns the raw row count.

The script uses `FORCE = TRUE` so the tutorial can be rerun with the same staged file. Without this, Snowflake's load history can skip a file that was already loaded in an earlier run.

Expected row count:

```text
10
```

### 5. Transform Into Analytics Table

```sql
-- sql/03_transform_orders.sql
```

This rebuilds `ANALYTICS_ORDERS` from `RAW_ORDERS`.

Important transformation rules:

- `region` and `product_category` are normalized with `INITCAP`
- `channel` and `status` are normalized to lowercase
- `gross_revenue` is calculated as `quantity * unit_price`
- `net_revenue` counts only completed orders
- returned and cancelled orders produce `net_revenue = 0`
- `is_completed` and `is_returned` flags are created
- `discount_rate` is calculated safely with `NULLIF`
- `loaded_at` records when the table was produced

### 6. Run Quality Checks

```sql
-- sql/04_quality_checks.sql
```

The checks look for:

- duplicate order IDs
- null customer IDs
- negative financial values
- revenue by region
- channel performance
- top customers by completed revenue

## Beginner Troubleshooting

Common issues and how to reason about them:

| Symptom | Likely cause | What to check |
| --- | --- | --- |
| Setup script fails | The selected role cannot create Snowflake objects. | Use a role with create privileges, or ask for database, schema, warehouse, stage, and table permissions. |
| `COPY INTO` loads zero rows | The file was not uploaded to `@ORDER_STAGE`, the staged filename does not match the pattern, or `FORCE = TRUE` was removed after an earlier load. | Run `LIST @ORDER_STAGE;` and confirm the file is visible. Keep `FORCE = TRUE` for repeatable tutorial runs. |
| Raw row count is more than 10 | The stage may contain extra matching files from previous attempts. | Remove old staged files or create a fresh stage, then upload only `orders.csv`. |
| Date or numeric values fail to load | The CSV structure does not match the target table or file format. | Confirm the CSV has one header row and values like `2026-01-03`, `329.99`, and `completed`. |
| Revenue looks too high | Returned or cancelled orders may have been counted as revenue. | Check the `CASE` expression in `03_transform_orders.sql`; only completed orders should contribute to `net_revenue`. |

## Expected Business Findings

Using the included data:

- North has the highest completed revenue because it includes the largest completed order.
- Completed revenue excludes returned and cancelled orders.
- Web and mobile channels both contribute meaningful revenue.
- `C001` is one of the highest-value customers because the customer has multiple completed orders.
- The cancelled order remains visible in the analytics table but contributes zero revenue.

## Skills Demonstrated

- Snowflake SQL
- Internal stages
- CSV file formats
- `COPY INTO`
- Raw table design
- Analytics table design
- SQL transformations
- Data quality checks
- Beginner data warehouse documentation

## What This Demonstrates

This project demonstrates the core warehouse workflow behind many analytics engineering tasks: receiving a source extract, staging it safely, loading a raw table, applying SQL business rules, and validating the final table before using it for reporting.

The most important skill shown is not just writing SQL. It is separating responsibilities: source data remains inspectable in `RAW_ORDERS`, business logic lives in the transformation step, and quality checks make the output easier to trust.
