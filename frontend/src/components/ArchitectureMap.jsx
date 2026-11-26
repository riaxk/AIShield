import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";

const nodes = [
  {
    x: 32, y: 44, w: 136, h: 64,
    title: "Attack vectors",
    sub: "ADVERSARIAL INPUT",
    path: "/attack",
    accent: true,
  },
  {
    x: 32, y: 230, w: 136, h: 64,
    title: "Knowledge base",
    sub: "POLICY DOCUMENTS",
    path: "/knowledge",
  },
  {
    x: 232, y: 44, w: 136, h: 64,
    title: "Defense engine",
    sub: "C0 / C1 / C2 / C3",
    path: "/defense",
  },
  {
    x: 232, y: 230, w: 136, h: 64,
    title: "Retrieval engine",
    sub: "SEMANTIC SEARCH",
    path: "/knowledge",
  },
  {
    x: 432, y: 44, w: 136, h: 64,
    title: "LLM inference",
    sub: "LLAMA / QWEN",
    path: "/attack",
  },
  {
    x: 432, y: 230, w: 136, h: 64,
    title: "Evaluation",
    sub: "BENCHMARK METRICS",
    path: "/benchmark",
  },
];

const connections = [
  "M168 76 H232",
  "M168 262 H232",
  "M300 108 V230",
  "M368 76 H432",
  "M368 262 H400 V76 H432",
  "M500 108 V230",
];

export default function ArchitectureMap() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();

  return (
    <svg
      viewBox="25 10 550 320"
preserveAspectRatio="xMidYMid meet"
      className="architecture-svg"
      aria-label="Interactive AIShield system architecture"
    >
      <defs>
        <pattern
          id="technical-grid"
          width="20"
          height="20"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M20 0 H0 V20"
            fill="none"
            stroke="#d5e6f3"
            strokeOpacity=".09"
          />
        </pattern>

        <marker
          id="arrow"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="5"
          markerHeight="5"
          orient="auto-start-reverse"
        >
          <path d="M0 0 L10 5 L0 10 Z" fill="#d5e6f3" />
        </marker>
      </defs>

      <rect width="600" height="340" fill="url(#technical-grid)" />

      <text
        x="32"
        y="23"
        fill="#d5e6f3"
        opacity=".65"
        fontSize="9"
        fontFamily="IBM Plex Mono"
      >
        FIG.01 / EXPERIMENTAL SYSTEM MAP
      </text>

      {connections.map((path, index) => (
        <g key={path}>
          <path
            d={path}
            stroke="#d5e6f3"
            strokeWidth="1.2"
            opacity=".65"
            fill="none"
            markerEnd="url(#arrow)"
          />

          <motion.path
            d={path}
            fill="none"
            stroke="#ff581f"
            strokeWidth="2"
            strokeDasharray="5 24"
            animate={
              reduceMotion
                ? undefined
                : { strokeDashoffset: [0, -58] }
            }
            transition={{
              duration: 2 + index * 0.25,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </g>
      ))}

      <circle
        cx="300"
        cy="169"
        r="35"
        fill="#687079"
        stroke="#d5e6f3"
        strokeDasharray="2 5"
      />

      <circle
        cx="300"
        cy="169"
        r="25"
        fill="#303840"
        stroke="#ff581f"
      />

      <path
        d="M300 151 L314 157 V170 Q311 182 300 187
           Q289 182 286 170 V157 Z"
        stroke="#d5e6f3"
        strokeWidth="1.5"
        fill="none"
      />

      <path
        d="M293 169 L298 174 L307 163"
        fill="none"
        stroke="#ff581f"
        strokeWidth="2"
      />

      {nodes.map((node, index) => (
        <g
          key={node.title}
          className="architecture-node"
          role="link"
          tabIndex={0}
          aria-label={`Open ${node.title}`}
          onClick={() => navigate(node.path)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              navigate(node.path);
            }
          }}
        >
          <rect
            x={node.x}
            y={node.y}
            width={node.w}
            height={node.h}
            rx="3"
            fill="#303840"
            stroke={node.accent ? "#ff581f" : "#a7b8c6"}
          />

          <rect
            x={node.x}
            y={node.y}
            width="4"
            height={node.h}
            fill={node.accent ? "#ff581f" : "#a7b8c6"}
          />

          <text
            x={node.x + 12}
            y={node.y + 15}
            fill="#d5e6f3"
            opacity=".6"
            fontSize="9"
            fontFamily="IBM Plex Mono"
          >
            0{index + 1}
          </text>

          <text
            x={node.x + 12}
            y={node.y + 34}
            fill="#d5e6f3"
            fontSize="13"
            fontWeight="600"
            fontFamily="Chakra Petch"
          >
            {node.title}
          </text>

          <text
            x={node.x + 12}
            y={node.y + 49}
            fill="#d5e6f3"
            opacity=".7"
            fontSize="8"
            fontFamily="IBM Plex Mono"
          >
            {node.sub}
          </text>

          <path
            d={`M${node.x + 116} ${node.y + 12}
                h8 v8 m0 -8 l-9 9`}
            fill="none"
            stroke="#ff581f"
          />
        </g>
      ))}

      <text
        x="32"
        y="322"
        fontSize="9"
        fontFamily="IBM Plex Mono"
        fill="#d5e6f3"
        opacity=".6"
      >
        LOGICAL ARCHITECTURE / SELECT NODE TO EXPLORE
      </text>
    </svg>
  );
}