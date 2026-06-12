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

Open a Snowflake worksheet and run the SQL files in order.

### 1. Run Setup

```sql
-- sql/01_setup.sql
```

This creates the database, schema, warehouse, stage, file format, and tables.

### 2. Upload The CSV

Upload this file into the `ORDER_STAGE` internal stage:

```text
data/orders.csv
```

If using SnowSQL from the project folder, use:

```sql
PUT file://data/orders.csv @ORDER_STAGE AUTO_COMPRESS=TRUE;
```

### 3. Load Raw Data

```sql
-- sql/02_load_raw_orders.sql
```

This truncates `RAW_ORDERS`, loads the staged CSV using `COPY INTO`, and returns the raw row count.

Expected row count:

```text
10
```

### 4. Transform Into Analytics Table

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

### 5. Run Quality Checks

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

## Resume Summary

Built a Snowflake 101 retail analytics tutorial that stages synthetic ecommerce CSV data, loads it into a raw Snowflake table with `COPY INTO`, transforms it into an analytics-ready order mart, and validates the output with SQL data quality checks and business summary queries.
