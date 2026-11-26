import { useEffect, useState } from "react";
import { Database, FileText } from "lucide-react";
import { api } from "../services/api";

export default function KnowledgeBase() {
  const [documents, setDocuments] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getKnowledgeBase()
      .then((data) => {
        setDocuments(data);
        setSelected(data[0] || null);
      })
      .catch((err) => setError(err.message));
  }, []);

  return (
    <section className="workspace">
      <div className="page-heading">
        <div>
          <div className="eyebrow">DATA INFRASTRUCTURE / 04</div>
          <h1>Knowledge Base</h1>
          <p>Nexora Technologies — controlled policy repository.</p>
        </div>

        <span className="tag">{documents.length} documents</span>
      </div>

      {error && <div className="notice">{error}</div>}

      <div className="split-workspace">
        <article className="panel">
          <div className="panel-header">
            <h2>Policy repository</h2>
            <Database size={18} />
          </div>

          <div className="panel-body case-list">
            {documents.map((doc) => (
              <button
                key={doc.filename}
                className={`case-item ${
                  selected?.filename === doc.filename
                    ? "selected"
                    : ""
                }`}
                onClick={() => setSelected(doc)}
              >
                <FileText size={19} />
                <h3>{doc.filename}</h3>
                <span className="mono muted">
                  {doc.words} words
                </span>
              </button>
            ))}
          </div>
        </article>

        <article className="panel">
          <div className="panel-header">
            <h2>Document inspector</h2>
            <span className="tag">Original source</span>
          </div>

          <div className="panel-body stack">
            {selected ? (
              <>
                <div className="data-block">
                  <div className="eyebrow">Document identity</div>
                  <h2>{selected.filename}</h2>
                  <p>{selected.source}</p>
                </div>

                <div className="metrics-strip">
                  <div className="metric">
                    <div className="metric-label">Words</div>
                    <div className="metric-value">{selected.words}</div>
                  </div>

                  <div className="metric">
                    <div className="metric-label">Characters</div>
                    <div className="metric-value">
                      {selected.characters}
                    </div>
                  </div>
                </div>

                <div className="data-block">
                  <div className="eyebrow">Raw policy content</div>
                  <pre>{selected.content}</pre>
                </div>

                <div className="notice">
                  Experimental modifications are applied to
                  isolated document copies. The original policy
                  repository remains unchanged.
                </div>
              </>
            ) : (
              <div className="empty-state">
                Select a policy document.
              </div>
            )}
          </div>
        </article>
      </div>
    </section>
  );
}