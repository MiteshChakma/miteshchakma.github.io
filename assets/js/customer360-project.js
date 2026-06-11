const STAGES = {
    ingest: {
        title: "1. Ingest raw CSV data",
        body: "We begin by giving the project one clear entrypoint: src/customer360/cli.py. The build command creates Customer360Pipeline from src/customer360/pipeline.py, then reads four synthetic CSV files from data/raw/ using pandas.",
        code: "python -m customer360.cli build --data-dir data/raw --output-dir build\n\nFiles used:\n- src/customer360/cli.py\n- src/customer360/pipeline.py\n- data/raw/*.csv",
    },
    validate: {
        title: "2. Validate schemas and quality rules",
        body: "Before trusting the data, we gently check that it has the shape we expect. src/customer360/validation.py checks required columns, negative order amounts, supported order statuses, and the final Customer 360 export.",
        code: "validate_raw_sources(frames)\nvalidate_customer360_file(Path('build/customer_360.csv'))\n\nTech used:\n- Python sets\n- pandas column checks\n- ValueError for readable failures",
    },
    transform: {
        title: "3. Load SQLite and run SQL transformations",
        body: "Once the data is readable and valid, pipeline.py writes each pandas DataFrame to build/customer360.db. Then sql/customer_360.sql uses CTEs, aggregations, joins, COALESCE, and CASE logic to produce one row per customer.",
        code: "pipeline.py\n  -> frame.to_sql(...)\n  -> conn.executescript(sql/customer_360.sql)\n  -> customer_360 table",
    },
    export: {
        title: "4. Export the Customer 360 data product",
        body: "After SQL creates the customer_360 table, pipeline.py reads it back from SQLite and writes build/customer_360.csv. This gives the reader a visible data product they can open and inspect.",
        code: "pd.read_sql_query('SELECT * FROM customer_360 ORDER BY customer_id', conn)\ncustomer360.to_csv('build/customer_360.csv', index=False)",
    },
    model: {
        title: "5. Train a local churn model",
        body: "To show how the data product can be reused, src/customer360/ml/train.py reads the generated CSV, one-hot encodes categorical fields, passes numeric fields through, trains a RandomForestClassifier, and writes model artifacts.",
        code: "python -m customer360.ml.train --input build/customer_360.csv --model-dir build\n\nOutputs:\n- build/churn_model.joblib\n- build/model_metrics.json",
    },
    test: {
        title: "6. Verify with automated tests",
        body: "Finally, the tests folder helps us check our work. It verifies validation failures, end-to-end pipeline output, returned-order revenue handling, churn labels, and model artifact creation.",
        code: "pytest -q\n\nFiles run:\n- tests/test_validation.py\n- tests/test_pipeline.py\n- tests/test_train.py\n\nExpected: 3 passed",
    },
};

const panel = document.getElementById("stage-panel");
const buttons = document.querySelectorAll(".stage-button");

function renderStage(stageKey) {
    const stage = STAGES[stageKey] || STAGES.ingest;
    panel.innerHTML = `
        <h3>${stage.title}</h3>
        <p>${stage.body}</p>
        <pre><code>${stage.code}</code></pre>
    `;
}

buttons.forEach((button) => {
    button.addEventListener("click", () => {
        buttons.forEach((item) => item.classList.toggle("is-active", item === button));
        renderStage(button.dataset.stage);
    });
});
