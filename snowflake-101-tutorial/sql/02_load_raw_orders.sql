-- Load the staged CSV file into the raw Snowflake table.
-- Upload data/orders.csv to @ORDER_STAGE before running this file.

USE DATABASE RESUME_DEMO_DB;
USE SCHEMA RETAIL_ANALYTICS;
USE WAREHOUSE COMPUTE_WH;

TRUNCATE TABLE RAW_ORDERS;

COPY INTO RAW_ORDERS
FROM @ORDER_STAGE
FILE_FORMAT = (FORMAT_NAME = CSV_WITH_HEADER)
PATTERN = '.*orders.*[.]csv[.]gz|.*orders.*[.]csv'
ON_ERROR = 'ABORT_STATEMENT';

SELECT COUNT(*) AS raw_order_rows
FROM RAW_ORDERS;
