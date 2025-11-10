"use client";

import { useState } from "react";
import { ingestContext } from "@/lib/decisionApi";

export default function DataSourcePage() {
  const [ts, setTs] = useState(() => new Date().toISOString());
  const [location, setLocation] = useState("PTC-H3-8-001");
  const [featuresJson, setFeaturesJson] = useState(
    JSON.stringify(
      { temp_c: 29.1, power_usage_kw: 1320.5, traffic_index: 0.78, co2_measured: 412.3 },
      null,
      2
    )
  );
  const [msg, setMsg] = useState("");

  async function onSend() {
    setMsg("sending...");
    try {
      const payload = { timestamp: ts, location_id: location, features: JSON.parse(featuresJson) };
      const res = await ingestContext(payload);
      setMsg(JSON.stringify(res, null, 2));
    } catch (err: any) {
      setMsg(String(err));
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Ingest / Data Source</h2>

      <div className="rounded-xl border p-4 bg-white">
        <label className="block text-xs text-slate-600">Timestamp</label>
        <input
          className="w-full border rounded p-2"
          value={ts}
          onChange={(e) => setTs(e.target.value)}
        />

        <label className="block text-xs text-slate-600 mt-2">Location ID</label>
        <input
          className="w-full border rounded p-2"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <label className="block text-xs text-slate-600 mt-2">Features (JSON)</label>
        <textarea
          className="w-full border rounded p-2 font-mono text-xs"
          rows={8}
          value={featuresJson}
          onChange={(e) => setFeaturesJson(e.target.value)}
        />

        <div className="flex gap-2 mt-3">
          <button
            className="bg-brand-600 text-white px-3 py-1 rounded"
            onClick={onSend}
          >
            POST /ingest/context
          </button>

          <button
            className="px-3 py-1 rounded border"
            onClick={() =>
              setFeaturesJson(
                JSON.stringify(
                  { temp_c: 25, power_usage_kw: 1000, traffic_index: 0.5, co2_measured: 400 },
                  null,
                  2
                )
              )
            }
          >
            Load sample
          </button>
        </div>

        <pre className="mt-3 text-xs bg-slate-50 p-2 rounded whitespace-pre-wrap">{msg}</pre>
      </div>

      <div className="text-sm text-slate-500">
      </div>
    </div>
  );
}