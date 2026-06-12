-- Data quality checks and beginner analytics queries.

USE DATABASE RESUME_DEMO_DB;
USE SCHEMA RETAIL_ANALYTICS;
USE WAREHOUSE COMPUTE_WH;

-- Check 1: duplicate order IDs should be zero.
SELECT
    order_id,
    COUNT(*) AS duplicate_count
FROM ANALYTICS_ORDERS
GROUP BY order_id
HAVING COUNT(*) > 1;

-- Check 2: required customer IDs should not be null.
SELECT COUNT(*) AS null_customer_id_rows
FROM ANALYTICS_ORDERS
WHERE customer_id IS NULL;

-- Check 3: financial fields should not be negative after transformation.
SELECT COUNT(*) AS invalid_financial_rows
FROM ANALYTICS_ORDERS
WHERE gross_revenue < 0
   OR discount_amount < 0
   OR net_revenue < 0;

-- Business view 1: revenue by region.
SELECT
    region,
    COUNT_IF(is_completed) AS completed_orders,
    SUM(net_revenue) AS completed_revenue
FROM ANALYTICS_ORDERS
GROUP BY region
ORDER BY completed_revenue DESC;

-- Business view 2: channel performance.
SELECT
    channel,
    COUNT(*) AS total_orders,
    COUNT_IF(is_completed) AS completed_orders,
    COUNT_IF(is_returned) AS returned_orders,
    ROUND(SUM(net_revenue), 2) AS completed_revenue
FROM ANALYTICS_ORDERS
GROUP BY channel
ORDER BY completed_revenue DESC;

-- Business view 3: top customers.
SELECT
    customer_id,
    COUNT_IF(is_completed) AS completed_orders,
    ROUND(SUM(net_revenue), 2) AS completed_revenue
FROM ANALYTICS_ORDERS
GROUP BY customer_id
ORDER BY completed_revenue DESC
LIMIT 5;
