# Databricks Retail Pipeline Screenshot Runbook

Use this runbook to recreate the project later and capture proof of each step. Each step includes:

- what to do
- exact command or Databricks UI action
- expected result
- screenshot file to save

Save screenshots in:

```text
databricks-retail-pipeline/docs/screenshots/
```

Recommended screenshot format: PNG.

## Screenshot Checklist

| Step | Screenshot file | Status |
| --- | --- | --- |
| 01 | `01-winget-install-databricks-cli.png` | Captured from local install output if needed |
| 02 | `02-databricks-cli-version.png` | Ready to capture locally |
| 03 | `03-databricks-auth-login.png` | Capture after workspace login |
| 04 | `04-current-user.png` | Capture after auth verification |
| 05 | `05-project-folder.png` | Capture local project files |
| 06 | `06-upload-csv.png` | Capture CSV upload command or Databricks UI |
| 07 | `07-bundle-validate.png` | Capture `bundle validate` success |
| 08 | `08-bundle-deploy.png` | Capture `bundle deploy` success |
| 09 | `09-job-run.png` | Capture `bundle run` or Databricks job run |
| 10 | `10-delta-tables.png` | Capture Databricks Catalog tables |
| 11 | `11-quality-checks.png` | Capture SQL query results |

## Step 01: Install Databricks CLI

Open PowerShell and run:

```powershell
winget install Databricks.DatabricksCLI --accept-package-agreements --accept-source-agreements
```

Expected result:

```text
Successfully installed
```

Screenshot to save:

```text
docs/screenshots/01-winget-install-databricks-cli.png
```

![Step 01 Databricks CLI install](screenshots/01-winget-install-databricks-cli.png)

Local note from this machine:

```text
DatabricksCLI 1.3.0 was installed successfully using winget.
```

## Step 02: Verify Databricks CLI

Open a new PowerShell window and run:

```powershell
databricks -v
```

If PATH has not refreshed yet, run:

```powershell
& "$env:LOCALAPPDATA\Microsoft\WinGet\Links\databricks.exe" -v
```

Expected result from this machine:

```text
Databricks CLI v1.3.0
```

Screenshot to save:

```text
docs/screenshots/02-databricks-cli-version.png
```

![Step 02 Databricks CLI version](screenshots/02-databricks-cli-version.png)

## Step 03: Authenticate To Databricks

Replace the host with your own Databricks workspace URL:

```powershell
databricks auth login --host https://YOUR-WORKSPACE-URL
```

Expected result:

- Browser opens for Databricks login.
- PowerShell returns to the prompt after authentication succeeds.

Screenshot to save:

```text
docs/screenshots/03-databricks-auth-login.png
```

![Step 03 Databricks auth login](screenshots/03-databricks-auth-login.png)

Do not include tokens or secrets in the screenshot.

## Step 04: Verify Current User

Run:

```powershell
databricks current-user me
```

Expected result:

```text
User profile details from the authenticated Databricks workspace.
```

Screenshot to save:

```text
docs/screenshots/04-current-user.png
```

![Step 04 current user](screenshots/04-current-user.png)

Blur or crop private email addresses if you share this publicly.

## Step 05: Review Project Files

From the repository root:

```powershell
Get-ChildItem -Recurse databricks-retail-pipeline | Sort-Object FullName
```

Expected project files:

```text
databricks-retail-pipeline/
  README.md
  databricks.yml
  data/retail_orders.csv
  docs/runbook-with-screenshots.md
  notebooks/retail_orders_pipeline.py
  sql/quality_checks.sql
```

Screenshot to save:

```text
docs/screenshots/05-project-folder.png
```

![Step 05 project folder](screenshots/05-project-folder.png)

## Step 06: Upload The CSV

Option A, Unity Catalog volume:

```powershell
databricks fs cp data/retail_orders.csv dbfs:/Volumes/main/default/demo/retail_orders.csv --overwrite
```

Option B, DBFS fallback:

```powershell
databricks fs cp data/retail_orders.csv dbfs:/FileStore/databricks-retail-pipeline/retail_orders.csv --overwrite
```

Expected result:

```text
File upload completes without error.
```

Screenshot to save:

```text
docs/screenshots/06-upload-csv.png
```

![Step 06 upload CSV](screenshots/06-upload-csv.png)

## Step 07: Validate The Bundle

From `databricks-retail-pipeline/`:

```powershell
databricks bundle validate
```

Expected result:

```text
Validation OK!
```

Screenshot to save:

```text
docs/screenshots/07-bundle-validate.png
```

![Step 07 bundle validate](screenshots/07-bundle-validate.png)

## Step 08: Deploy The Bundle

From `databricks-retail-pipeline/`:

```powershell
databricks bundle deploy
```

Expected result:

```text
Deployment completes and creates/updates the retail-orders-pipeline job.
```

Screenshot to save:

```text
docs/screenshots/08-bundle-deploy.png
```

![Step 08 bundle deploy](screenshots/08-bundle-deploy.png)

## Step 09: Run The Job

From `databricks-retail-pipeline/`:

```powershell
databricks bundle run retail_orders_pipeline
```

Expected result:

```text
The job run starts and completes successfully.
```

Screenshot to save:

```text
docs/screenshots/09-job-run.png
```

![Step 09 job run](screenshots/09-job-run.png)

Also capture the Databricks workspace job run page if possible.

## Step 10: Confirm Delta Tables

In Databricks Catalog Explorer, open the target catalog and schema.

Expected tables:

```text
main.default.retail_clean_orders
main.default.retail_daily_metrics
main.default.retail_customer_metrics
```

Screenshot to save:

```text
docs/screenshots/10-delta-tables.png
```

![Step 10 Delta tables](screenshots/10-delta-tables.png)

## Step 11: Run Quality Checks

Open a Databricks SQL editor and run:

```sql
-- sql/quality_checks.sql
```

Expected result:

- duplicate order check returns zero rows
- null required field counts are zero
- invalid financial value counts are zero
- revenue and customer summary queries return rows

Screenshot to save:

```text
docs/screenshots/11-quality-checks.png
```

![Step 11 quality checks](screenshots/11-quality-checks.png)

## Final Evidence To Keep

When the project is complete, keep these artifacts together:

```text
databricks-retail-pipeline/README.md
databricks-retail-pipeline/databricks.yml
databricks-retail-pipeline/notebooks/retail_orders_pipeline.py
databricks-retail-pipeline/sql/quality_checks.sql
databricks-retail-pipeline/docs/runbook-with-screenshots.md
databricks-retail-pipeline/docs/screenshots/*.png
```

This gives you both a runnable Databricks project and a visual record of the implementation steps.
