import { useEffect, useState } from "react";
import { Activity } from "lucide-react";
import { api } from "../services/api";

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function refresh() {
      try {
        const data = await api.getAuditLogs();

        if (active) {
          setLogs(data);
          setError("");
        }
      } catch (err) {
        if (active) setError(err.message);
      }
    }

    refresh();

    const timer = setInterval(refresh, 10000);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  const filtered = logs.filter(
    (log) => !filter || log.action === filter
  );

  return (
    <section className="workspace">
      <div className="page-heading">
        <div>
          <div className="eyebrow">SECURITY TELEMETRY / 07</div>
          <h1>Audit Logs</h1>
          <p>Inspect security decisions across recorded experiments.</p>
        </div>

        <span className="tag">{logs.length} events</span>
      </div>

      {error && <div className="notice">{error}</div>}

      <div className="split-workspace">
        <article className="panel">
          <div className="panel-header">
            <h2>Event stream</h2>
            <Activity size={18} />
          </div>

          <div className="panel-body stack">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="">All security decisions</option>
              <option value="allow">Allowed</option>
              <option value="reject">Rejected</option>
              <option value="quarantine">Quarantined</option>
            </select>

            <div className="case-list">
              {filtered.map((log) => (
                <button
                  key={log.event_id}
                  className={`case-item ${
                    selected?.event_id === log.event_id
                      ? "selected"
                      : ""
                  }`}
                  onClick={() => setSelected(log)}
                >
                  <div className="control-row">
                    <span className="mono">{log.event_id}</span>
                    <span className={`tag ${
                      ["reject", "quarantine"].includes(log.action)
                        ? "tag-danger"
                        : ""
                    }`}>
                      {log.action || log.status}
                    </span>
                  </div>

                  <h3>{log.test_id} / {log.configuration}</h3>
                  <p>{log.reason || log.status}</p>
                </button>
              ))}
            </div>
          </div>
        </article>

        <article className="panel">
          <div className="panel-header">
            <h2>Event inspector</h2>
            <span className="mono">{selected?.event_id || "—"}</span>
          </div>

          <div className="panel-body stack">
            {selected ? (
              <>
                <div className="data-block">
                  <div className="eyebrow">Security action</div>
                  <h2>{selected.action || selected.status}</h2>
                  <p>{selected.reason}</p>
                </div>

                <div className="data-block">
                  <div className="eyebrow">Complete event record</div>
                  <pre>{JSON.stringify(selected, null, 2)}</pre>
                </div>
              </>
            ) : (
              <div className="empty-state">
                <Activity size={32} />
                Select an event to inspect its security decision.
              </div>
            )}
          </div>
        </article>
      </div>
    </section>
  );
}