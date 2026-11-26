import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { motion } from "motion/react";

import {
  Shield,
  LayoutGrid,
  Crosshair,
  ShieldCheck,
  Database,
  ChartNoAxesCombined,
  FileText,
  Activity,
  Radio,
} from "lucide-react";

import { api } from "../services/api";
import StatusIndicator from "./StatusIndicator";

const navigation = [
  { name: "Overview", path: "/", icon: LayoutGrid },
  { name: "Attack Lab", path: "/attack", icon: Crosshair },
  { name: "Defense Lab", path: "/defense", icon: ShieldCheck },
  { name: "Knowledge Base", path: "/knowledge", icon: Database },
  { name: "Benchmark", path: "/benchmark", icon: ChartNoAxesCombined },
  { name: "Reports", path: "/reports", icon: FileText },
  { name: "Audit Logs", path: "/logs", icon: Activity },
];

export default function AppShell({ children }) {
  const [health, setHealth] = useState(null);

  useEffect(() => {
    let active = true;

    async function checkHealth() {
      try {
        const data = await api.getHealth();
        if (active) setHealth(data);
      } catch {
        if (active) setHealth(null);
      }
    }

    checkHealth();

    const timer = setInterval(checkHealth, 15000);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="app-shell">
      <header className="topbar">
        <NavLink to="/" className="brand">
          <div className="brand-symbol">
            <Shield size={25} strokeWidth={1.7} />
            <span />
          </div>

          <div>
            <div className="brand-name">
              AISHIELD<span>.</span>
            </div>
            <div className="brand-subtitle">
              ADVERSARIAL RESEARCH FRAMEWORK
            </div>
          </div>
        </NavLink>

        <div className="topbar-right">
          <span className="environment-label">
            <Radio size={13} />
            LOCAL RESEARCH ENVIRONMENT
          </span>
          <span className="version-label">V.01</span>
        </div>
      </header>

      <nav className="navigation">
        {navigation.map(({ name, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === "/"}
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""}`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={16} strokeWidth={1.7} />
                <span>{name}</span>

                {isActive && (
                  <motion.div
                    className="nav-indicator"
                    layoutId="active-navigation"
                    transition={{
                      type: "spring",
                      stiffness: 380,
                      damping: 32,
                    }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <main className="main-workspace">
        {children}
      </main>

      <footer className="system-footer">
        <div className="footer-status">
          <StatusIndicator
            online={Boolean(health)}
            label={health ? "API CONNECTED" : "API OFFLINE"}
          />

          <StatusIndicator
            online={health?.ollama_online}
            label={
              health?.ollama_online
                ? "OLLAMA ONLINE"
                : "OLLAMA OFFLINE"
            }
          />
        </div>

        <span>CONTROLLED EXPERIMENTAL ENVIRONMENT</span>
        <span>AI SECURITY / 2026</span>
      </footer>
    </div>
  );
}