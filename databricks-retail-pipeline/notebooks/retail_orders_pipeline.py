# Databricks notebook source
from pyspark.sql import functions as F
from pyspark.sql import types as T

dbutils.widgets.text("source_path", "/Volumes/main/default/demo/retail_orders.csv")
dbutils.widgets.text("catalog_name", "main")
dbutils.widgets.text("schema_name", "default")

source_path = dbutils.widgets.get("source_path")
catalog_name = dbutils.widgets.get("catalog_name")
schema_name = dbutils.widgets.get("schema_name")

target_namespace = f"{catalog_name}.{schema_name}"

schema = T.StructType(
    [
        T.StructField("order_id", T.IntegerType(), False),
        T.StructField("order_date", T.DateType(), False),
        T.StructField("customer_id", T.StringType(), False),
        T.StructField("customer_name", T.StringType(), True),
        T.StructField("region", T.StringType(), True),
        T.StructField("channel", T.StringType(), True),
        T.StructField("product_category", T.StringType(), True),
        T.StructField("quantity", T.IntegerType(), True),
        T.StructField("unit_price", T.DoubleType(), True),
        T.StructField("discount_amount", T.DoubleType(), True),
        T.StructField("status", T.StringType(), True),
    ]
)

raw_orders = (
    spark.read.option("header", True)
    .option("dateFormat", "yyyy-MM-dd")
    .schema(schema)
    .csv(source_path)
)

clean_orders = (
    raw_orders.withColumn("status", F.lower(F.trim(F.col("status"))))
    .withColumn("channel", F.lower(F.trim(F.col("channel"))))
    .withColumn("gross_amount", F.round(F.col("quantity") * F.col("unit_price"), 2))
    .withColumn(
        "net_amount",
        F.when(F.col("status") == "completed", F.col("gross_amount") - F.col("discount_amount")).otherwise(F.lit(0.0)),
    )
    .withColumn("is_completed", F.col("status") == "completed")
    .withColumn("is_returned", F.col("status") == "returned")
    .withColumn("loaded_at", F.current_timestamp())
    .filter(F.col("order_id").isNotNull())
    .filter(F.col("customer_id").isNotNull())
    .filter(F.col("quantity") > 0)
    .filter(F.col("unit_price") >= 0)
    .filter(F.col("discount_amount") >= 0)
)

daily_metrics = (
    clean_orders.groupBy("order_date", "channel")
    .agg(
        F.count("*").alias("orders"),
        F.sum(F.when(F.col("is_completed"), 1).otherwise(0)).alias("completed_orders"),
        F.round(F.sum("gross_amount"), 2).alias("gross_revenue"),
        F.round(F.sum("net_amount"), 2).alias("net_revenue"),
        F.round(F.avg("net_amount"), 2).alias("avg_net_order_value"),
    )
    .orderBy("order_date", "channel")
)

customer_metrics = (
    clean_orders.groupBy("customer_id", "customer_name", "region")
    .agg(
        F.count("*").alias("orders"),
        F.round(F.sum("net_amount"), 2).alias("lifetime_net_revenue"),
        F.max("order_date").alias("last_order_date"),
    )
    .orderBy(F.desc("lifetime_net_revenue"))
)

spark.sql(f"CREATE SCHEMA IF NOT EXISTS {target_namespace}")

clean_orders.write.mode("overwrite").format("delta").option("overwriteSchema", "true").saveAsTable(
    f"{target_namespace}.retail_clean_orders"
)
daily_metrics.write.mode("overwrite").format("delta").option("overwriteSchema", "true").saveAsTable(
    f"{target_namespace}.retail_daily_metrics"
)
customer_metrics.write.mode("overwrite").format("delta").option("overwriteSchema", "true").saveAsTable(
    f"{target_namespace}.retail_customer_metrics"
)

display(daily_metrics)
