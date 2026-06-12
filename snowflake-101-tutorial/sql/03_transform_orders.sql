-- Transform raw rows into an analytics-ready order mart.

USE DATABASE RESUME_DEMO_DB;
USE SCHEMA RETAIL_ANALYTICS;
USE WAREHOUSE COMPUTE_WH;

CREATE OR REPLACE TABLE ANALYTICS_ORDERS AS
SELECT
    order_id,
    customer_id,
    order_date,
    INITCAP(region) AS region,
    LOWER(channel) AS channel,
    INITCAP(product_category) AS product_category,
    quantity,
    unit_price,
    quantity * unit_price AS gross_revenue,
    COALESCE(discount_amount, 0) AS discount_amount,
    CASE
        WHEN LOWER(status) = 'completed'
            THEN (quantity * unit_price) - COALESCE(discount_amount, 0)
        ELSE 0
    END AS net_revenue,
    LOWER(status) AS status,
    LOWER(status) = 'completed' AS is_completed,
    LOWER(status) = 'returned' AS is_returned,
    ROUND(COALESCE(discount_amount, 0) / NULLIF(quantity * unit_price, 0), 4) AS discount_rate,
    CURRENT_TIMESTAMP() AS loaded_at
FROM RAW_ORDERS;

SELECT *
FROM ANALYTICS_ORDERS
ORDER BY order_date, order_id;
