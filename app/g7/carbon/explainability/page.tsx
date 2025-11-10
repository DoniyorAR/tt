// app/g7/carbon/explainability/page.tsx
"use client";
import { useEffect, useState } from "react";
import { analyzeCauses } from "@/lib/decisionApi";

export default function ExplainPage() {
  const [out, setOut] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const resp = await analyzeCauses({ timestamp: new Date().toISOString(), features: { temp_c: 29.1, power_usage_kw: 1320.5, traffic_index: 0.78 } });
      setOut(resp);
    })();
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Explainability (XAI)</h2>
      <div className="rounded-xl border p-4 bg-white">
        <div className="text-sm text-slate-700">Base prediction: {out?.base_prediction ?? "—"}</div>
        <div className="mt-3">
          {out?.top_causes?.map((c: any, i: number) => (
            <div key={i} className="flex items-center gap-3 mb-2">
              <div className="w-1/2">
                <div className="text-sm font-medium">{c.feature}</div>
                <div className="text-xs text-slate-500">SHAP {Number(c.shap_value).toFixed(2)}</div>
              </div>
              <div className="flex-1 bg-slate-50 h-3 rounded overflow-hidden">
                <div style={{ width: `${(c.contribution_pct || 0) * 100}%` }} className="h-full bg-emerald-400" />
              </div>
              <div className="w-12 text-xs text-slate-600">{Math.round((c.contribution_pct || 0) * 100)}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
