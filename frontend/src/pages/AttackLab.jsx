import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Play, Crosshair, Database } from "lucide-react";
import { api } from "../services/api";

export default function AttackLab() {
  const [params] = useSearchParams();

  const [cases, setCases] = useState([]);
  const [category, setCategory] = useState("");
  const [selected, setSelected] = useState(null);

  const [model, setModel] = useState("llama3.2:3b");
  const [config, setConfig] = useState(
    params.get("config") || "C0"
  );

  const [result, setResult] = useState(null);
  const [source, setSource] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getTestCases()
      .then((data) => {
        setCases(data);
        setSelected(
          data.find((c) => c.id === params.get("case")) ||
          data.find((c) => c.category === "direct_injection") ||
          data[0]
        );
      })
      .catch((err) => setError(err.message));
  }, [params]);

  const filtered = cases.filter(
    (c) => !category || c.category === category
  );

  function selectCase(item) {
    setSelected(item);
    setResult(null);
    setError("");
  }

  async function run(recorded = false) {
    if (!selected) return;

    setBusy(true);
    setError("");
    setResult(null);

    try {
      if (recorded) {
        const records = await api.getBenchmarkResults({
          model,
          configuration: config,
        });

        const match = records.find(
          (r) => r.id === selected.id
        );

        if (!match) {
          throw new Error(
            "This experiment has not been recorded yet."
          );
        }

        setResult(match);
        setSource("Recorded benchmark");
      } else {
        const response = await api.runExperiment({
          case_id: selected.id,
          model,
          configuration: config,
        });

        setResult(response);
        setSource("Interactive experiment");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="workspace">
      <div className="page-heading">
        <div>
          <div className="eyebrow">EXPERIMENT WORKSPACE / 02</div>
          <h1>Attack Lab</h1>
          <p>Inspect and execute controlled adversarial scenarios.</p>
        </div>
        <span className="tag">{cases.length} scenarios</span>
      </div>

      <div className="split-workspace">
        <article className="panel">
          <div className="panel-header">
            <h2>Scenario library</h2>
            <Crosshair size={18} />
          </div>

          <div className="panel-body stack">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All categories</option>

              {[...new Set(cases.map((c) => c.category))].map(
                (item) => (
                  <option key={item} value={item}>
                    {item.replaceAll("_", " ")}
                  </option>
                )
              )}
            </select>

            <div className="case-list">
              {filtered.map((item) => (
                <button
                  key={item.id}
                  disabled={busy}
                  className={`case-item ${
                    selected?.id === item.id ? "selected" : ""
                  }`}
                  onClick={() => selectCase(item)}
                >
                  <span className="mono">{item.id}</span>
                  <p>{item.question}</p>
                </button>
              ))}
            </div>
          </div>
        </article>

        <article className="panel">
          <div className="panel-header">
            <h2>Experiment configuration</h2>
            <span className="mono">{selected?.id || "—"}</span>
          </div>

          <div className="panel-body stack">
            <div className="control-row">
              <div className="field" style={{ flex: 1 }}>
                <label>Language model</label>
                <select
                  disabled={busy}
                  value={model}
                  onChange={(e) => {
                    setModel(e.target.value);
                    setResult(null);
                  }}
                >
                  <option value="llama3.2:3b">Llama 3.2 — 3B</option>
                  <option value="qwen2.5:3b">Qwen 2.5 — 3B</option>
                </select>
              </div>

              <div className="field" style={{ flex: 1 }}>
                <label>Defense configuration</label>
                <select
                  disabled={busy}
                  value={config}
                  onChange={(e) => {
                    setConfig(e.target.value);
                    setResult(null);
                  }}
                >
                  <option value="C0">C0 — Baseline</option>
                  <option value="C1">C1 — Prompt defense</option>
                  <option value="C2">C2 — Application defense</option>
                  <option value="C3">C3 — Hybrid defense</option>
                </select>
              </div>
            </div>

            {selected && (
              <>
                <div className="data-block">
                  <div className="eyebrow">Employee input</div>
                  <p>{selected.question}</p>
                </div>

                <div className="control-row">
                  <span className="tag">
                    Expected: {selected.expected_answer}
                  </span>

                  {selected.attack_objective && (
                    <span className="tag tag-danger">
                      Target: {selected.attack_objective}
                    </span>
                  )}
                </div>

                {selected.document_modification && (
                  <div className="data-block">
                    <div className="eyebrow">
                      Document modification /{" "}
                      {selected.document_modification.uploader}
                    </div>
                    <pre>
                      {selected.document_modification.content}
                    </pre>
                  </div>
                )}
              </>
            )}

            <div className="control-row">
              <button
                className="primary-button"
                disabled={busy || !selected}
                onClick={() => run(false)}
              >
                <Play size={15} />
                {busy ? "Processing..." : "Execute experiment"}
              </button>

              <button
                className="secondary-button"
                disabled={busy || !selected}
                onClick={() => run(true)}
              >
                <Database size={15} />
                Load recorded result
              </button>
            </div>

            {error && <div className="notice">{error}</div>}

            {result && (
              <>
                <div className="eyebrow">
                  EXPERIMENT OUTPUT / {source}
                </div>

                <div className="result-response">
                  <pre>
                    {result.actual_response ||
                     result.error ||
                     "No response available."}
                  </pre>
                </div>

                <div className="data-block">
                  <div className="eyebrow">Security decision</div>
                  <pre>
                    {JSON.stringify(
                      result.security_decision || {},
                      null,
                      2
                    )}
                  </pre>
                </div>

                <div className="data-block">
                  <div className="eyebrow">Retrieved context</div>
                  <p className="mono">
                    {result.retrieved_document || "Unavailable"}
                  </p>
                  <pre>{result.retrieved_context}</pre>
                </div>

                {result.evaluation && (
                  <div className="data-block">
                    <div className="eyebrow">Evaluation</div>
                    <pre>
                      {JSON.stringify(result.evaluation, null, 2)}
                    </pre>
                  </div>
                )}

                <span className="mono">
                  Total latency:{" "}
                  {result.total_latency_seconds ?? "—"} seconds
                </span>
              </>
            )}
          </div>
        </article>
      </div>
    </section>
  );
}