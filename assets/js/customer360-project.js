const STAGES = {
    ingest: {
        title: "1. Ingest raw CSV data",
        body: "The pipeline reads four source files from data/raw/: customers, orders, web events, and support tickets. These files are synthetic and were created by ChatGPT for this portfolio demo.",
        code: "python -m customer360.cli build --data-dir data/raw --output-dir build",
    },
    validate: {
        title: "2. Validate schemas and quality rules",
        body: "Before transformation, the code checks required columns, rejects negative order amounts, and only accepts supported order statuses. This keeps bad source data from silently entering the Customer 360 output.",
        code: "validate_raw_sources(frames)\nvalidate_customer360_file(Path('build/customer_360.csv'))",
    },
    transform: {
        title: "3. Load SQLite and run SQL transformations",
        body: "The raw frames are loaded into a local SQLite database. SQL then aggregates order, web, and support features at customer level.",
        code: "customers + orders + web_events + support_tickets\n        -> SQLite tables\n        -> sql/customer_360.sql",
    },
    export: {
        title: "4. Export the Customer 360 data product",
        body: "The SQL mart is exported to build/customer_360.csv. The output contains one row per customer with revenue, activity, support, and churn-label fields.",
        code: "build/customer360.db\nbuild/customer_360.csv",
    },
    model: {
        title: "5. Train a local churn model",
        body: "A small scikit-learn pipeline reads the Customer 360 features, one-hot encodes categorical fields, trains a classifier, and writes model artifacts.",
        code: "python -m customer360.ml.train --input build/customer_360.csv --model-dir build",
    },
    test: {
        title: "6. Verify with automated tests",
        body: "The tests cover schema validation, end-to-end pipeline output, revenue handling for returned orders, churn labels, and model artifact creation.",
        code: "pytest\n# 3 passed",
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
