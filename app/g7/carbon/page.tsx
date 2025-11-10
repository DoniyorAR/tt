// app/g7/carbon/page.tsx
"use client";

import Link from "next/link";

export default function CarbonHubPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">Carbon — Hub</h1>
        <p className="text-sm text-slate-500 max-w-2xl">
          Central hub for Carbon Emission modules: data ingestion, mitigation analysis, visualization, and explainability.
          Choose a module below to continue.
        </p>
      </header>

      {/* Navigation cards */}
      <main className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/g7/carbon/data-source"
          className="block p-4 rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition"
        >
          <div className="text-lg font-semibold text-slate-900">Data Source</div>
          <div className="mt-1 text-sm text-slate-600">
            Ingest sensor / contextual data and validate schema before running model.
          </div>
        </Link>

        <Link
          href="/g7/carbon/results"
          className="block p-4 rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition"
        >
          <div className="text-lg font-semibold text-slate-900">Results</div>
          <div className="mt-1 text-sm text-slate-600">
            Run cause analysis and mitigation simulation. Compare outputs and recommended actions.
          </div>
        </Link>

        <Link
          href="/g7/carbon/visualization"
          className="block p-4 rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition"
        >
          <div className="text-lg font-semibold text-slate-900">Visualization</div>
          <div className="mt-1 text-sm text-slate-600">
            Interactive maps, KPIs, trend charts, and sector carbon breakdown.
          </div>
        </Link>

        <Link
          href="/g7/carbon/explainability"
          className="block p-4 rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition"
        >
          <div className="text-lg font-semibold text-slate-900">Explainability (XAI)</div>
          <div className="mt-1 text-sm text-slate-600">
            SHAP / feature importance to explain why the model selected each mitigation.
          </div>
        </Link>
      </main>
    </div>
  );
}
