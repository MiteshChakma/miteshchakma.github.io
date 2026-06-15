-- Update catalog/schema if you changed the notebook parameters.
USE CATALOG main;
USE SCHEMA default;

-- 1. Duplicate order IDs should return zero rows.
SELECT
  order_id,
  COUNT(*) AS duplicate_count
FROM retail_clean_orders
GROUP BY order_id
HAVING COUNT(*) > 1;

-- 2. Required fields should not be null.
SELECT
  COUNT_IF(order_id IS NULL) AS null_order_ids,
  COUNT_IF(customer_id IS NULL) AS null_customer_ids,
  COUNT_IF(order_date IS NULL) AS null_order_dates
FROM retail_clean_orders;

-- 3. Financial values should be valid.
SELECT
  COUNT_IF(quantity <= 0) AS invalid_quantity_rows,
  COUNT_IF(unit_price < 0) AS invalid_unit_price_rows,
  COUNT_IF(discount_amount < 0) AS invalid_discount_rows,
  COUNT_IF(net_amount < 0) AS negative_net_amount_rows
FROM retail_clean_orders;

-- 4. Revenue by day and channel.
SELECT
  order_date,
  channel,
  orders,
  completed_orders,
  gross_revenue,
  net_revenue,
  avg_net_order_value
FROM retail_daily_metrics
ORDER BY order_date, channel;

-- 5. Top customers by net revenue.
SELECT
  customer_id,
  customer_name,
  region,
  orders,
  lifetime_net_revenue,
  last_order_date
FROM retail_customer_metrics
ORDER BY lifetime_net_revenue DESC
LIMIT 10;
