const API_BASE = "http://127.0.0.1:8000/api";

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));

    throw new Error(
      typeof error.detail === "string"
        ? error.detail
        : `API request failed: ${response.status}`
    );
  }

  return response.json();
}

export const api = {
  getHealth: () => request("/health"),

  getOverview: () => request("/overview"),

  getModels: () => request("/models"),

  getConfigurations: () => request("/configurations"),

  getTestCases: (category = "") =>
    request(
      `/test-cases${
        category ? `?category=${encodeURIComponent(category)}` : ""
      }`
    ),

  getTestCase: (id) =>
    request(`/test-cases/${encodeURIComponent(id)}`),

  getKnowledgeBase: () => request("/knowledge-base"),

  getBenchmarkResults: (filters = {}) => {
    const params = new URLSearchParams(
      Object.entries(filters).filter(([, value]) => value)
    );

    return request(
      `/benchmark/results${params.size ? `?${params}` : ""}`
    );
  },

  getBenchmarkSummary: () =>
    request("/benchmark/summary"),

  getAuditLogs: () => request("/audit-logs"),

  runExperiment: (data) =>
    request("/experiments/run", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};