import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowUpRight, ShieldCheck } from "lucide-react";

const configurations = [
  {
    id: "C0",
    name: "Baseline",
    description: "Original system prompt. No additional ingestion controls.",
  },
  {
    id: "C1",
    name: "Prompt defense",
    description: "Hardened system prompt and explicit security instructions.",
  },
  {
    id: "C2",
    name: "Application defense",
    description: "Uploader verification and document content screening.",
  },
  {
    id: "C3",
    name: "Hybrid defense",
    description: "Combined prompt-level and application-level controls.",
  },
];

export default function DefenseLab() {
  const [selected, setSelected] = useState("C3");

  const promptActive = ["C1", "C3"].includes(selected);
  const appActive = ["C2", "C3"].includes(selected);

  const layers = [
    { title: "Uploader verification", active: appActive },
    { title: "Content screening", active: appActive },
    { title: "Semantic retrieval", active: true },
    { title: "Hardened system prompt", active: promptActive },
    { title: "LLM inference", active: true },
  ];

  return (
    <section className="workspace">
      <div className="page-heading">
        <div>
          <div className="eyebrow">SECURITY CONTROLS / 03</div>
          <h1>Defense Lab</h1>
          <p>Inspect the framework's layered security configurations.</p>
        </div>

        <Link
          to={`/attack?config=${selected}`}
          className="primary-button"
        >
          Test configuration
          <ArrowUpRight size={15} />
        </Link>
      </div>

      <div className="split-workspace">
        <article className="panel">
          <div className="panel-header">
            <h2>Defense configurations</h2>
            <ShieldCheck size={18} />
          </div>

          <div className="panel-body stack">
            <div className="config-grid">
              {configurations.map((item) => (
                <button
                  key={item.id}
                  className={`config-option ${
                    selected === item.id ? "selected" : ""
                  }`}
                  onClick={() => setSelected(item.id)}
                >
                  <div className="config-code">{item.id}</div>
                  <h3>{item.name}</h3>
                  <p>{item.description}</p>
                </button>
              ))}
            </div>

            <div className="data-block">
              <div className="eyebrow">Active controls</div>

              <p>
                Uploader verification:{" "}
                <strong>{appActive ? "Enabled" : "Disabled"}</strong>
              </p>

              <p>
                Content screening:{" "}
                <strong>{appActive ? "Enabled" : "Disabled"}</strong>
              </p>

              <p>
                Hardened prompt:{" "}
                <strong>{promptActive ? "Enabled" : "Disabled"}</strong>
              </p>
            </div>

            <div className="notice">
              Uploader identities are simulated metadata.
              Content screening is rule-based and may miss
              sophisticated attacks.
            </div>
          </div>
        </article>

        <article className="panel panel-dark">
          <div className="panel-header">
            <h2>Security control layers</h2>
            <span className="mono">{selected}</span>
          </div>

          <div className="architecture-body">
            <svg
              viewBox="0 0 480 390"
              className="architecture-svg"
            >
              <text
                x="240"
                y="25"
                textAnchor="middle"
                fill="#d5e6f3"
                fontSize="11"
                fontFamily="IBM Plex Mono"
              >
                DOCUMENT INGESTION
              </text>

              {layers.map((layer, index) => {
                const y = 45 + index * 63;

                return (
                  <g key={layer.title}>
                    <path
                      d={`M240 ${y - 17} V${y}`}
                      stroke="#d5e6f3"
                      strokeDasharray="3 3"
                    />

                    <motion.rect
                      x="90"
                      y={y}
                      width="300"
                      height="46"
                      rx="3"
                      animate={{
                        fill: layer.active ? "#303840" : "#7d8790",
                        stroke: layer.active ? "#ff581f" : "#a7b8c6",
                      }}
                      strokeWidth="1.5"
                    />

                    <circle
                      cx="110"
                      cy={y + 23}
                      r="4"
                      fill={layer.active ? "#ff581f" : "#a7b8c6"}
                    />

                    <text
                      x="124"
                      y={y + 27}
                      fill="#d5e6f3"
                      fontSize="13"
                      fontFamily="Chakra Petch"
                    >
                      {layer.title}
                    </text>

                    <text
                      x="375"
                      y={y + 27}
                      textAnchor="end"
                      fill="#d5e6f3"
                      fontSize="9"
                      fontFamily="IBM Plex Mono"
                    >
                      {layer.active ? "ACTIVE" : "BYPASSED"}
                    </text>
                  </g>
                );
              })}

              <text
                x="240"
                y="370"
                textAnchor="middle"
                fill="#d5e6f3"
                fontSize="11"
                fontFamily="IBM Plex Mono"
              >
                RESPONSE EVALUATION
              </text>
            </svg>
          </div>

          <div className="architecture-caption">
            <span>CONFIGURATION VISUALIZATION</span>
            <span>NOT A LIVE ATTACK RESULT</span>
          </div>
        </article>
      </div>
    </section>
  );
}