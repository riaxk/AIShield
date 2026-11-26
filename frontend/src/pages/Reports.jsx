import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";

import {
  Download,
  ArrowUpRight,
  FileText,
} from "lucide-react";

import { api } from "../services/api";

const sections = [
  "Executive summary",
  "Methodology",
  "Key findings",
  "Research limitations",
  "Conclusion",
];

const percent = (v) =>
  v == null ? "—" : `${v}%`;

function combinedASR(rows, config) {
  const group = rows.filter(
    (r) => r.configuration === config
  );

  const attacks = group.reduce(
    (sum, r) => sum + r.total_attacks, 0
  );

  const successes = group.reduce(
    (sum, r) => sum + r.successful_attacks, 0
  );

  return attacks
    ? Number((successes / attacks * 100).toFixed(2))
    : null;
}

export default function Reports() {
  const [data, setData] = useState(null);
  const [section, setSection] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getBenchmarkSummary()
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  const available = data?.status === "available";

  const rows = available
    ? data.summaries || []
    : [];

  const baseline = combinedASR(rows, "C0");
  const hybrid = combinedASR(rows, "C3");

  const reduction =
    baseline && hybrid != null
      ? Number(
          ((baseline - hybrid) / baseline * 100)
            .toFixed(2)
        )
      : null;

  const completed = rows.reduce(
    (sum, r) => sum + r.completed_experiments,
    0
  );

  const applicationRows = rows.filter(
    (r) => ["C2", "C3"].includes(r.configuration)
  );

  const fp = applicationRows.reduce(
    (sum, r) =>
      sum + (r.detection_metrics?.false_positives || 0),
    0
  );

  const tn = applicationRows.reduce(
    (sum, r) =>
      sum + (r.detection_metrics?.true_negatives || 0),
    0
  );

  const falsePositiveRate =
    fp + tn > 0
      ? Number((fp / (fp + tn) * 100).toFixed(2))
      : null;

  function exportMetrics() {
    const blob = new Blob(
      [JSON.stringify(rows, null, 2)],
      { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "AIShield-evaluation-summary.json";
    link.click();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function exportReport() {
    const lines = [
      "# AIShield — Technical Research Report",
      "",
      "Adversarial Security Benchmarking & Defense Evaluation for LLM Applications",
      "",
      "## Executive summary",
      `Completed experiments: ${completed}`,
      `Baseline ASR: ${percent(baseline)}`,
      `Hybrid ASR: ${percent(hybrid)}`,
      `Relative ASR reduction: ${percent(reduction)}`,
      `Application-control false positive rate: ${percent(falsePositiveRate)}`,
      "",
      "## Methodology",
      "Controlled fictional HR RAG application.",
      "60 synthetic scenarios, two local language models and four defense configurations.",
      "Evaluation combines numeric matching with AI-assisted semantic review.",
      "",
      "## Results",
      "| Model | Config | ASR | Overall accuracy | Benign accuracy |",
      "|---|---|---|---|---|",
      ...rows.map(
        (r) =>
          `| ${r.model} | ${r.configuration} | ${percent(r.attack_success_rate)} | ${percent(r.overall_task_accuracy)} | ${percent(r.benign_accuracy)} |`
      ),
      "",
      "## Limitations",
      "- Synthetic and template-based dataset.",
      "- Simulated uploader identities.",
      "- Rule-based document screening.",
      "- Numeric matching may miss semantic errors.",
      "- AI-assisted labels have not been independently human-validated.",
      "- Results are specific to the tested environment.",
      "",
      "## Conclusion",
      "The benchmark provides a controlled comparison of security effectiveness and legitimate task performance.",
      "The results should not be interpreted as a guarantee of production security.",
    ];

    const blob = new Blob(
      [lines.join("\n")],
      { type: "text/markdown" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "AIShield-Technical-Report.md";
    link.click();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <section className="workspace">
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            RESEARCH DOCUMENTATION / 06
          </div>
          <h1>Research Reports</h1>
          <p>
            Experimental findings, methodology and
            documented research limitations.
          </p>
        </div>

        <div className="control-row">
          <button
            className="secondary-button"
            disabled={!available}
            onClick={exportMetrics}
          >
            <Download size={15} />
            JSON
          </button>

          <button
            className="primary-button"
            disabled={!available}
            onClick={exportReport}
          >
            <FileText size={15} />
            Export report
          </button>
        </div>
      </div>

      {error && <div className="notice">{error}</div>}

      {!available && (
        <div className="notice">
          Final evaluated metrics are unavailable.
        </div>
      )}

      <div className="research-layout">
        <aside className="research-index">
          <div
            className="eyebrow"
            style={{
              color: "#d5e6f3",
              marginBottom: 15,
            }}
          >
            RESEARCH INDEX
          </div>

          {sections.map((name, i) => (
            <button
              key={name}
              className={section === i ? "active" : ""}
              onClick={() => setSection(i)}
            >
              <span
                className="mono"
                style={{ marginRight: 9, opacity: 0.6 }}
              >
                0{i + 1}
              </span>
              {name}
            </button>
          ))}

          <div
            style={{
              marginTop: 28,
              borderTop: "1px solid #ffffff25",
              paddingTop: 18,
            }}
          >
            <div
              className="eyebrow"
              style={{ color: "#d5e6f3" }}
            >
              RESEARCH RECORD
            </div>

            <h2 style={{ marginTop: 8 }}>
              AS / 2026
            </h2>

            <p style={{ opacity: 0.7, fontSize: 12 }}>
              Controlled experimental study
            </p>
          </div>
        </aside>

        <article className="panel">
          <div className="panel-header">
            <h2>{sections[section]}</h2>
            <span className="mono">
              0{section + 1} / 05
            </span>
          </div>

          <motion.div
            key={section}
            className="research-content"
            initial={{ opacity: 0, x: 5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            {section === 0 && (
              <>
                <div className="eyebrow">
                  AISHIELD / TECHNICAL RESEARCH RECORD
                </div>

                <h1 style={{ margin: "12px 0" }}>
                  Adversarial Security Benchmarking
                  & Defense Evaluation for LLM Applications
                </h1>

                <p>
                  A controlled investigation into the
                  effectiveness of layered security controls
                  in retrieval-augmented generation systems.
                </p>

                <div className="research-metrics">
                  <div className="research-metric">
                    <strong>{completed}</strong>
                    <span>Completed experiments</span>
                  </div>

                  <div className="research-metric">
                    <strong>{percent(reduction)}</strong>
                    <span>Relative ASR reduction</span>
                  </div>

                  <div className="research-metric">
                    <strong>{percent(falsePositiveRate)}</strong>
                    <span>Document false positive rate</span>
                  </div>
                </div>

                <h2>Research objective</h2>

                <p>
                  Compare prompt-level defenses,
                  application-level security controls and
                  their combined effectiveness against direct
                  injection, indirect injection and knowledge
                  base poisoning.
                </p>

                <div className="data-block">
                  <div className="eyebrow">
                    Baseline versus hybrid defense
                  </div>

                  <h1>
                    {percent(baseline)}
                    <span className="orange"> → </span>
                    {percent(hybrid)}
                  </h1>

                  <p>
                    Combined attack success rates across
                    the two evaluated language models.
                  </p>
                </div>
              </>
            )}

            {section === 1 && (
              <>
                <h2>Experimental environment</h2>

                <p>
                  A fictional Nexora Technologies HR
                  assistant retrieves company policy
                  documents using semantic embeddings and
                  cosine similarity.
                </p>

                <div className="research-metrics">
                  {[
                    ["60", "Test scenarios"],
                    ["2", "Local language models"],
                    ["4", "Defense configurations"],
                  ].map(([value, label]) => (
                    <div
                      className="research-metric"
                      key={label}
                    >
                      <strong>{value}</strong>
                      <span>{label}</span>
                    </div>
                  ))}
                </div>

                <h2>Scenario distribution</h2>

                {[
                  ["Direct prompt injection", 15],
                  ["Indirect prompt injection", 15],
                  ["Knowledge base poisoning", 10],
                  ["Normal employee queries", 10],
                  ["Benign document modifications", 10],
                ].map(([label, count]) => (
                  <div
                    className="category-row"
                    key={label}
                    style={{ marginBottom: 10 }}
                  >
                    <span>{label}</span>
                    <div className="category-track">
                      <div
                        style={{
                          width: `${count / 15 * 100}%`,
                        }}
                      />
                    </div>
                    <span>{count}</span>
                  </div>
                ))}

                <h2 style={{ marginTop: 20 }}>
                  Evaluation procedure
                </h2>

                <p>
                  Responses were evaluated through numeric
                  matching and AI-assisted semantic review
                  of flagged responses. Document ingestion
                  decisions were evaluated separately using
                  confusion-matrix metrics.
                </p>
              </>
            )}

            {section === 2 && (
              <>
                <h2>Comparative experimental results</h2>

                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Model</th>
                      <th>Config</th>
                      <th>ASR</th>
                      <th>Benign accuracy</th>
                      <th>Overall accuracy</th>
                      <th>Latency</th>
                    </tr>
                  </thead>

                  <tbody>
                    {rows.map((r) => (
                      <tr
                        key={`${r.model}-${r.configuration}`}
                      >
                        <td>{r.model}</td>
                        <td>{r.configuration}</td>
                        <td>
                          {percent(r.attack_success_rate)}
                        </td>
                        <td>
                          {percent(r.benign_accuracy)}
                        </td>
                        <td>
                          {percent(r.overall_task_accuracy)}
                        </td>
                        <td>
                          {r.average_latency_seconds} s
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div
                  className="notice"
                  style={{ marginTop: 16 }}
                >
                  Normal-query accuracy and overall task
                  accuracy measure different aspects of
                  usability. A refusal may prevent an attack
                  while failing the legitimate task.
                </div>

                <Link
                  to="/benchmark"
                  className="secondary-button"
                  style={{ marginTop: 16 }}
                >
                  Explore benchmark analytics
                  <ArrowUpRight size={15} />
                </Link>
              </>
            )}

            {section === 3 && (
              <>
                {[
                  [
                    "Synthetic dataset",
                    "The scenarios include template-based variations and do not represent every real-world attack.",
                  ],
                  [
                    "Simulated source verification",
                    "Uploader identities are simulated metadata, not a production authentication system.",
                  ],
                  [
                    "Rule-based content screening",
                    "Keyword and pattern-based detection can block legitimate content or miss malicious modifications.",
                  ],
                  [
                    "Evaluation limitations",
                    "Numeric matching may miss semantic errors. AI-assisted classifications have not been independently human-validated.",
                  ],
                  [
                    "Limited generalizability",
                    "Results apply to the selected models, policy repository and experimental configurations.",
                  ],
                ].map(([title, text]) => (
                  <div
                    className="data-block"
                    key={title}
                    style={{ marginBottom: 12 }}
                  >
                    <h3>{title}</h3>
                    <p style={{ margin: "6px 0 0" }}>
                      {text}
                    </p>
                  </div>
                ))}
              </>
            )}

            {section === 4 && (
              <>
                <h2>Security effectiveness</h2>

                <p>
                  The combined attack success rate changed
                  from {percent(baseline)} under the baseline
                  configuration to {percent(hybrid)} under
                  hybrid defense.
                </p>

                <h2>Security-usability trade-off</h2>

                <p>
                  Application-level controls produced a
                  document false positive rate of{" "}
                  {percent(falsePositiveRate)}. This
                  highlights the need to evaluate legitimate
                  content handling alongside attack resistance.
                </p>

                <h2>Future research directions</h2>

                <div className="stack">
                  {[
                    "Context-aware document screening",
                    "Authenticated document provenance",
                    "Independent human validation",
                    "Larger and more diverse attack datasets",
                    "Evaluation across additional language models",
                  ].map((item, i) => (
                    <div className="data-block" key={item}>
                      <span
                        className="mono orange"
                        style={{ marginRight: 12 }}
                      >
                        0{i + 1}
                      </span>
                      {item}
                    </div>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        </article>
      </div>
    </section>
  );
}