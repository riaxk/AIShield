import { useEffect, useState, Fragment } from "react";
import { motion } from "motion/react";

import {
  RefreshCw,
  ChartNoAxesCombined,
  ShieldCheck,
  ListFilter,
  ArrowUpRight,
} from "lucide-react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

import { api } from "../services/api";

const MODELS = ["llama3.2:3b", "qwen2.5:3b"];
const CONFIGS = ["C0", "C1", "C2", "C3"];

const COLORS = ["#687079", "#ff581f"];

const shortName = (model) =>
  model === MODELS[0] ? "Llama" : "Qwen";

const percent = (value) =>
  value == null ? "—" : `${value}%`;

function Panel({ title, note, children }) {
  return (
    <article className="panel">
      <div className="panel-header">
        <h2>{title}</h2>
        {note && <span className="eyebrow">{note}</span>}
      </div>
      {children}
    </article>
  );
}

export default function Benchmark() {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState([]);
  const [status, setStatus] = useState("");
  const [view, setView] = useState("analytics");

  const [model, setModel] = useState("");
  const [config, setConfig] = useState("");
  const [category, setCategory] = useState("");

  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");

  async function refresh() {
    try {
      const [raw, evaluated] = await Promise.all([
        api.getBenchmarkResults(),
        api.getBenchmarkSummary(),
      ]);

      setRecords(raw);
      setSummary(evaluated.summaries || []);
      setStatus(evaluated.status);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const available = status === "available";

  const filtered = records.filter(
    (r) =>
      (!model || r.model === model) &&
      (!config || r.configuration === config) &&
      (!category || r.category === category)
  );

  const getSummary = (m, c) =>
    summary.find(
      (r) => r.model === m && r.configuration === c
    );

  const comparison = CONFIGS.map((c) => ({
    configuration: c,
    Llama: getSummary(MODELS[0], c)?.attack_success_rate,
    Qwen: getSummary(MODELS[1], c)?.attack_success_rate,
  }));

  const accuracy = CONFIGS.map((c) => ({
    configuration: c,
    Llama: getSummary(MODELS[0], c)?.overall_task_accuracy,
    Qwen: getSummary(MODELS[1], c)?.overall_task_accuracy,
  }));

  const latency = CONFIGS.map((c) => ({
    configuration: c,
    Llama: getSummary(MODELS[0], c)?.average_latency_seconds,
    Qwen: getSummary(MODELS[1], c)?.average_latency_seconds,
  }));

  const detectionModel = model || MODELS[0];
  const detectionConfig = config || "C3";

  const detectionSummary = getSummary(
    detectionModel,
    detectionConfig
  );

  const detection = detectionSummary?.detection_metrics;

  function inspectGroup(m, c, cat = "") {
    setModel(m);
    setConfig(c);
    setCategory(cat);
    setSelected(null);
    setView("records");
  }

  function changeView(next) {
    setView(next);
    setSelected(null);
  }

  const tabs = [
    {
      id: "analytics",
      label: "Comparative analytics",
      icon: ChartNoAxesCombined,
    },
    {
      id: "detection",
      label: "Detection metrics",
      icon: ShieldCheck,
    },
    {
      id: "records",
      label: "Experiment records",
      icon: ListFilter,
    },
  ];

  function renderChart(data, type = "bar", max = 100) {
    const ChartComponent =
      type === "line" ? LineChart : BarChart;

    return (
      <div className="chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <ChartComponent
            data={data}
            margin={{ top: 8, right: 15, bottom: 0, left: -15 }}
          >
            <CartesianGrid
              stroke="#a9bdcc"
              strokeDasharray="3 5"
              vertical={false}
            />

            <XAxis
              dataKey="configuration"
              fontSize={11}
              stroke="#687079"
            />

            <YAxis
              domain={[0, max]}
              fontSize={10}
              stroke="#687079"
            />

            <Tooltip
              contentStyle={{
                background: "#303840",
                border: "1px solid #687079",
                color: "#d5e6f3",
                fontSize: 12,
              }}
              itemStyle={{ color: "#d5e6f3" }}
              labelStyle={{ color: "#d5e6f3" }}
            />

            <Legend wrapperStyle={{ fontSize: 11 }} />

            {["Llama", "Qwen"].map((name, i) =>
              type === "line" ? (
                <Line
                  key={name}
                  type="linear"
                  dataKey={name}
                  stroke={COLORS[i]}
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  animationDuration={500}
                />
              ) : (
                <Bar
                  key={name}
                  dataKey={name}
                  fill={COLORS[i]}
                  radius={[3, 3, 0, 0]}
                  maxBarSize={35}
                  animationDuration={500}
                />
              )
            )}
          </ChartComponent>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <section className="workspace">
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            EXPERIMENTAL ANALYTICS / 05
          </div>
          <h1>Benchmark</h1>
          <p>
            Comparative security performance across{" "}
            {records.length} recorded experiments.
          </p>
        </div>

        <button
          className="secondary-button"
          onClick={refresh}
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      <div className="workspace-tabs">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`workspace-tab ${
              view === id ? "active" : ""
            }`}
            onClick={() => changeView(id)}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {error && <div className="notice">{error}</div>}

      {!available && (
        <div className="notice">
          Evaluated metrics are not available yet.
          Recorded experiments remain accessible.
        </div>
      )}

      {view === "analytics" && available && (
        <motion.div
          className="analytics-layout"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
        >
          <Panel
            title="Attack success matrix"
            note="SELECT CELL TO INSPECT"
          >
            <div className="panel-body stack">
              <div className="heatmap">
                <span />

                {CONFIGS.map((c) => (
                  <div className="heatmap-label" key={c}>
                    {c}
                  </div>
                ))}

                {MODELS.map((m) => (
                  <Fragment key={m}>
                    <div className="heatmap-label">
                      {shortName(m)}
                    </div>

                    {CONFIGS.map((c) => {
                      const value =
                        getSummary(m, c)?.attack_success_rate;

                      return (
                        <button
                          key={c}
                          className="heatmap-cell"
                          disabled={value == null}
                          title={`Inspect ${m} / ${c}`}
                          style={{
                            background: `rgba(255,88,31,${
                              0.08 + (value || 0) / 110
                            })`,
                          }}
                          onClick={() => inspectGroup(m, c)}
                        >
                          {percent(value)}
                        </button>
                      );
                    })}
                  </Fragment>
                ))}
              </div>

              <div className="progress-detail">
                <span>Lower attack success</span>
                <span>Higher attack success</span>
              </div>

              <div
                style={{
                  height: 6,
                  background:
                    "linear-gradient(90deg,#ff581f15,#ff581f)",
                }}
              />
            </div>
          </Panel>

          <Panel
            title="Defense effectiveness"
            note="ASR / %"
          >
            {renderChart(comparison, "line")}
          </Panel>

          <Panel
            title="Overall task accuracy"
            note="HIGHER IS BETTER"
          >
            {renderChart(accuracy)}
          </Panel>

          <Panel
            title="Execution latency"
            note="SECONDS / MEAN"
          >
            {renderChart(latency, "bar", "auto")}
          </Panel>
        </motion.div>
      )}

      {view === "detection" && available && (
        <>
          <div className="compact-filters">
            <select
              value={detectionModel}
              onChange={(e) => setModel(e.target.value)}
            >
              {MODELS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>

            <select
              value={detectionConfig}
              onChange={(e) => setConfig(e.target.value)}
            >
              {CONFIGS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="split-workspace">
            <Panel
              title="Confusion matrix"
              note="DOCUMENT INGESTION"
            >
              <div className="panel-body stack">
                {["C0", "C1"].includes(detectionConfig) && (
                  <div className="notice">
                    Application-level detection is disabled.
                    This represents an allow-all baseline,
                    not an active detector.
                  </div>
                )}

                {detection ? (
                  <>
                    <div className="confusion-grid">
                      {[
                        {
                          name: "True positives",
                          value: detection.true_positives,
                          note: "Malicious modifications blocked",
                        },
                        {
                          name: "False negatives",
                          value: detection.false_negatives,
                          note: "Malicious modifications allowed",
                          error: true,
                        },
                        {
                          name: "False positives",
                          value: detection.false_positives,
                          note: "Benign modifications blocked",
                          error: true,
                        },
                        {
                          name: "True negatives",
                          value: detection.true_negatives,
                          note: "Benign modifications allowed",
                        },
                      ].map((item) => (
                        <motion.div
                          key={item.name}
                          className={`confusion-cell ${
                            item.error ? "error" : ""
                          }`}
                          initial={{ opacity: 0.5 }}
                          animate={{ opacity: 1 }}
                        >
                          <div className="eyebrow">
                            {item.name}
                          </div>

                          <div className="confusion-value">
                            {item.value}
                          </div>

                          <p>{item.note}</p>
                        </motion.div>
                      ))}
                    </div>

                    <p className="muted">
                      Counts cover document modifications,
                      not all adversarial queries.
                    </p>
                  </>
                ) : (
                  <div className="empty-state">
                    Detection metrics unavailable.
                  </div>
                )}
              </div>
            </Panel>

            <Panel
              title="Detection performance"
              note={`${shortName(detectionModel)} / ${detectionConfig}`}
            >
              <div className="panel-body stack">
                {[
                  ["Precision", detection?.precision],
                  ["Recall", detection?.recall],
                  ["F1 score", detection?.f1_score],
                  ["False positive rate", detection?.false_positive_rate],
                  ["False negative rate", detection?.false_negative_rate],
                ].map(([label, value]) => (
                  <div className="data-block" key={label}>
                    <div
                      className="progress-detail"
                      style={{ marginBottom: 8 }}
                    >
                      <strong>{label}</strong>
                      <span className="mono">
                        {percent(value)}
                      </span>
                    </div>

                    <div className="progress-track">
                      <motion.div
                        className="progress-fill"
                        style={{
                          background: label.startsWith("False")
                            ? "#ff581f"
                            : "#687079",
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${value || 0}%` }}
                        transition={{ duration: 0.4 }}
                      />
                    </div>
                  </div>
                ))}

                <button
                  className="secondary-button"
                  onClick={() =>
                    inspectGroup(
                      detectionModel,
                      detectionConfig
                    )
                  }
                >
                  Inspect configuration records
                  <ArrowUpRight size={15} />
                </button>
              </div>
            </Panel>
          </div>
        </>
      )}

      {view === "records" && (
        <>
          <div className="compact-filters">
            <select
              value={model}
              onChange={(e) => {
                setModel(e.target.value);
                setSelected(null);
              }}
            >
              <option value="">All models</option>
              {MODELS.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>

            <select
              value={config}
              onChange={(e) => {
                setConfig(e.target.value);
                setSelected(null);
              }}
            >
              <option value="">All configurations</option>
              {CONFIGS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>

            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setSelected(null);
              }}
            >
              <option value="">All categories</option>
              {[...new Set(records.map((r) => r.category))]
                .map((c) => (
                  <option key={c} value={c}>
                    {c.replaceAll("_", " ")}
                  </option>
                ))}
            </select>

            <span className="mono">
              {filtered.length} records
            </span>
          </div>

          <div className="records-layout">
            <Panel title="Experimental records">
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Experiment</th>
                      <th>Model</th>
                      <th>Config</th>
                      <th>Decision</th>
                      <th>Latency</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filtered.map((r) => {
                      const key =
                        `${r.model}-${r.configuration}-${r.id}`;

                      const active =
                        selected?.model === r.model &&
                        selected?.configuration === r.configuration &&
                        selected?.id === r.id;

                      return (
                        <tr
                          key={key}
                          className={`clickable-row ${
                            active ? "selected" : ""
                          }`}
                          onClick={() => setSelected(r)}
                        >
                          <td>
                            <button
                              style={{
                                border: 0,
                                background: "transparent",
                                color: "inherit",
                              }}
                              className="mono"
                              onClick={() => setSelected(r)}
                            >
                              {r.id}
                            </button>
                          </td>

                          <td>{shortName(r.model)}</td>
                          <td>{r.configuration}</td>
                          <td>
                            <span
                              className={`tag ${
                                ["reject", "quarantine"].includes(
                                  r.security_decision?.action
                                )
                                  ? "tag-danger"
                                  : ""
                              }`}
                            >
                              {r.security_decision?.action || "—"}
                            </span>
                          </td>
                          <td>
                            {r.total_latency_seconds ?? "—"} s
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Panel>

            <Panel
              title="Experiment inspector"
              note={selected?.id || "SELECT RECORD"}
            >
              <div className="panel-body stack">
                {selected ? (
                  <motion.div
                    className="stack"
                    key={`${selected.model}-${selected.configuration}-${selected.id}`}
                    initial={{ opacity: 0, x: 6 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <div className="control-row">
                      <span className="tag">
                        {selected.model}
                      </span>
                      <span className="tag">
                        {selected.configuration}
                      </span>
                    </div>

                    <div className="data-block">
                      <div className="eyebrow">
                        Employee input
                      </div>
                      <p>{selected.question}</p>
                    </div>

                    <div className="data-block">
                      <div className="eyebrow">
                        Expected policy answer
                      </div>
                      <h3>{selected.expected_answer}</h3>
                    </div>

                    {selected.attack_objective && (
                      <div className="notice">
                        Attack objective:{" "}
                        {selected.attack_objective}
                      </div>
                    )}

                    <div className="result-response">
                      <div
                        className="eyebrow"
                        style={{ color: "#d5e6f3" }}
                      >
                        MODEL RESPONSE
                      </div>

                      <pre>
                        {selected.actual_response ||
                         selected.error ||
                         "Unavailable"}
                      </pre>
                    </div>

                    {selected.evaluation && (
                      <div className="data-block">
                        <div className="eyebrow">
                          Evaluated outcome
                        </div>

                        <p>
                          Attack success:{" "}
                          <strong>
                            {selected.evaluation.attack_success == null
                              ? "N/A"
                              : selected.evaluation.attack_success
                              ? "Yes"
                              : "No"}
                          </strong>
                        </p>

                        <p>
                          Task correct:{" "}
                          <strong>
                            {selected.evaluation.task_correct == null
                              ? "N/A"
                              : selected.evaluation.task_correct
                              ? "Yes"
                              : "No"}
                          </strong>
                        </p>
                      </div>
                    )}

                    <div className="data-block">
                      <div className="eyebrow">
                        Security decision
                      </div>
                      <p>
                        {selected.security_decision?.reason}
                      </p>
                    </div>

                    <div className="data-block">
                      <div className="eyebrow">
                        Retrieved context
                      </div>
                      <h3>{selected.retrieved_document}</h3>
                      <pre>{selected.retrieved_context}</pre>
                    </div>
                  </motion.div>
                ) : (
                  <div className="empty-state">
                    <ListFilter size={32} />
                    Select an experiment to inspect its
                    complete recorded response.
                  </div>
                )}
              </div>
            </Panel>
          </div>
        </>
      )}
    </section>
  );
}