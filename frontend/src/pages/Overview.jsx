import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Crosshair } from "lucide-react";

import { api } from "../services/api";
import ArchitectureMap from "../components/ArchitectureMap";

const categoryNames = {
  direct_injection: "Direct injection",
  indirect_injection: "Indirect injection",
  knowledge_poisoning: "Knowledge poisoning",
  benign: "Normal queries",
  benign_modification: "Benign modifications",
};

export default function Overview() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function refresh() {
      try {
        const result = await api.getOverview();

        if (active) {
          setData(result);
          setError("");
        }
      } catch (err) {
        if (active) setError(err.message);
      }
    }

    refresh();

    const timer = setInterval(refresh, 5000);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  if (!data) {
    return (
      <div className="loading-state">
        {error || "CONNECTING TO RESEARCH ENGINE..."}
      </div>
    );
  }

  const metrics = [
    {
      label: "Test scenarios",
      value: data.total_cases,
      note: "Adversarial and benign",
    },
    {
      label: "Language models",
      value: data.total_models,
      note: "Local inference",
    },
    {
      label: "Defense modes",
      value: data.total_configurations,
      note: "C0 through C3",
    },
    {
      label: "Completed runs",
      value: data.completed_experiments,
      note: `Of ${data.total_planned_experiments} planned`,
    },
  ];

  return (
    <section className="workspace">
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            RESEARCH CONSOLE / 01
          </div>
          <h1>System overview</h1>
          <p>
            Adversarial benchmarking and defense evaluation
            for LLM applications.
          </p>
        </div>

        <Link to="/attack" className="primary-button">
          <Crosshair size={16} />
          Open Attack Lab
          <ArrowUpRight size={14} />
        </Link>
      </div>

      {error && <div className="notice">{error}</div>}

      <div className="metrics-strip">
        {metrics.map((metric) => (
          <div className="metric" key={metric.label}>
            <div className="metric-label">{metric.label}</div>
            <div className="metric-value">{metric.value}</div>
            <div className="metric-note">{metric.note}</div>
          </div>
        ))}
      </div>

      <div className="overview-grid">
        <article className="panel panel-dark architecture-panel">
          <div className="panel-header">
            <h2>System topology</h2>
            <span className="eyebrow">INTERACTIVE MAP</span>
          </div>

          <div className="architecture-body">
            <ArchitectureMap />
          </div>

          <div className="architecture-caption">
            <span>RAG SECURITY PIPELINE</span>
            <span>SELECT ANY NODE ↗</span>
          </div>
        </article>

        <article className="panel">
          <div className="panel-header">
            <h2>Benchmark execution</h2>
            <Link to="/benchmark">
              <ArrowUpRight size={18} />
            </Link>
          </div>

          <div className="panel-body stack">
            <div className="progress-number">
              {data.progress_percentage}%
            </div>

            <div className="progress-track">
              <div
                className="progress-fill"
                style={{
                  width: `${Math.min(
                    data.progress_percentage,
                    100
                  )}%`,
                }}
              />
            </div>

            <div className="progress-detail">
              <span>
                {data.attempted_experiments} /{" "}
                {data.total_planned_experiments} runs
              </span>
              <span>{data.execution_errors} errors</span>
            </div>

            {data.last_experiment && (
              <div className="data-block">
                <div className="eyebrow">
                  Latest recorded experiment
                </div>
                <div className="mono">
                  {data.last_experiment.id}
                </div>
                <p>
                  {data.last_experiment.model} /{" "}
                  {data.last_experiment.configuration}
                </p>
              </div>
            )}
          </div>
        </article>

        <article className="panel">
          <div className="panel-header">
            <h2>Scenario distribution</h2>
            <span className="mono">{data.total_cases}</span>
          </div>

          <div className="panel-body stack">
            {Object.entries(data.category_distribution).map(
              ([category, count]) => (
                <div className="category-row" key={category}>
                  <span>
                    {categoryNames[category] || category}
                  </span>

                  <div className="category-track">
                    <div
                      style={{
                        width: `${
                          (count / data.total_cases) * 100
                        }%`,
                      }}
                    />
                  </div>

                  <span className="mono">{count}</span>
                </div>
              )
            )}
          </div>
        </article>
      </div>
    </section>
  );
}