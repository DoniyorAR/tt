// app/g7/carbon/results/page.tsx
"use client";
import { useState } from "react";
import { analyzeCauses, generateActions, simulateActions, recommend } from "@/lib/decisionApi";
import DecisionKPI from "@/components/DecisionKPI";

export default function ResultsPage() {
  const [ts, setTs] = useState(new Date().toISOString());
  const [featuresJson, setFeaturesJson] = useState(JSON.stringify({ temp_c: 29.1, power_usage_kw: 1320.5, traffic_index: 0.78, production_rate: 1.2 }, null, 2));
  const [causes, setCauses] = useState<any>(null);
  const [actions, setActions] = useState<any[]>([]);
  const [sim, setSim] = useState<any>(null);

  async function onAnalyze() {
    const payload = { timestamp: ts, features: JSON.parse(featuresJson), predicted_emission: 1.82 };
    const res = await analyzeCauses(payload);
    setCauses(res);
  }

  async function onGenerate() {
    const res = await generateActions({ location_id: "PTC-H3-8-001", causes: (causes?.top_causes ?? []).map((c: any) => ({ feature: c.feature, contribution_pct: c.contribution_pct })) });
    setActions(res.actions || []);
  }

  async function onSimulate() {
    const res = await simulateActions({ base_features: JSON.parse(featuresJson), base_prediction: causes?.base_prediction || 1.82, actions: actions });
    setSim(res);
  }

  async function onRecommend() {
    const res = await recommend({ timestamp: ts, location_id: "PTC-H3-8-001", features: JSON.parse(featuresJson), constraints: {}, weights: { reduction: 0.5, cost: 0.2, risk: 0.1, urgency: 0.2 } });
    alert(JSON.stringify(res.recommended, null, 2));
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Cause Analysis & Action Simulation</h2>

      <div className="grid md:grid-cols-3 gap-3">
        <DecisionKPI label="Base pred" value={causes?.base_prediction ?? "—"} />
        <DecisionKPI label="Detected causes" value={(causes?.top_causes?.length ?? 0)} />
        <DecisionKPI label="Actions (gen)" value={actions.length} />
      </div>

      <div className="rounded-xl border p-3 bg-white">
        <div className="flex gap-2">
          <button className="bg-brand-600 text-white px-3 py-1 rounded" onClick={onAnalyze}>Analyze Causes</button>
          <button className="px-3 py-1 rounded border" onClick={onGenerate}>Generate Actions</button>
          <button className="px-3 py-1 rounded border" onClick={onSimulate}>Simulate</button>
          <button className="px-3 py-1 rounded border" onClick={onRecommend}>Recommend</button>
        </div>

        <div className="mt-3 grid md:grid-cols-2 gap-3">
          <div>
            <div className="text-xs text-slate-600">Features (JSON)</div>
            <textarea rows={8} className="w-full font-mono text-xs border rounded p-2" value={featuresJson} onChange={(e) => setFeaturesJson(e.target.value)} />
          </div>

          <div>
            <div className="text-xs text-slate-600">Analysis / Actions / Sim</div>
            <pre className="bg-slate-50 p-2 rounded text-xs">{JSON.stringify({ causes, actions, sim }, null, 2)}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
