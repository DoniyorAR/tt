// lib/decisionApi.ts
export const DECISION_BASE = process.env.NEXT_PUBLIC_DECISION_API || "http://localhost:8000/api/v1/decision";

async function postJSON(path: string, payload: any) {
  const url = `${DECISION_BASE}${path}`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`HTTP ${res.status}: ${text}`);
    }
    return await res.json();
  } catch (err) {
    console.warn("Decision API call failed, returning mock:", err);
    // fallback mock (small safe responses from PDF spec)
    if (path.startsWith("/analyze/causes")) {
      return {
        timestamp: payload.timestamp,
        base_prediction: 1.82,
        top_causes: [
          { feature: "power_usage_kw", shap_value: 0.42, contribution_pct: 0.31 },
          { feature: "traffic_index", shap_value: 0.27, contribution_pct: 0.20 },
          { feature: "temp_c", shap_value: 0.25, contribution_pct: 0.19 },
        ],
      };
    }
    if (path.startsWith("/generate/actions")) {
      return {
        actions: [
          { action_id: "act-power-reduce-10", target_feature: "power_usage_kw", action_type: "scale", value: -0.1, description: "Reduce non-critical power load by 10% for 1 hour", cost_score: 0.3, risk_score: 0.2 },
          { action_id: "act-cooling-plus1", target_feature: "temp_cool_setpoint", action_type: "offset", value: 1, description: "Increase cooling setpoint by 1°C", cost_score: 0.1, risk_score: 0.1 },
        ],
      };
    }
    if (path.startsWith("/simulate/actions")) {
      return { base_prediction: payload.base_prediction || 1.82, results: [ { action_id: "act-power-reduce-10", pred_after: 1.68, reduction: 0.14, reduction_pct: 7.69 } ] };
    }
    if (path.startsWith("/recommend")) {
      return { base_prediction: 1.82, recommended: [{ rank: 1, action_ids: ["act-power-reduce-10"], expected_reduction_pct: 7.69, score: 0.71 }] };
    }
    return { status: "ok" };
  }
}

export function ingestContext(payload: any) { return postJSON("/ingest/context", payload); }
export function analyzeCauses(payload: any) { return postJSON("/analyze/causes", payload); }
export function generateActions(payload: any) { return postJSON("/generate/actions", payload); }
export function simulateActions(payload: any) { return postJSON("/simulate/actions", payload); }
export function recommend(payload: any) { return postJSON("/recommend", payload); }
export async function getModelsStatus() {
  const url = `${DECISION_BASE}/models/status`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("models status fail");
    return await res.json();
  } catch {
    return { anomaly_model: { version: "n/a", status: "mock" }, forecast_model: { version: "n/a", status: "mock" }, xai_engine: { method: "shap-tree", status: "mock" } };
  }
}
