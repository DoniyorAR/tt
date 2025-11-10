"use client";

import { useEffect, useMemo, useState } from "react";
import ImageLightbox from "../../components/ImageLightbox";

/**
 * G7 Dashboard page (Underground Risk | Carbon Emission)
 *
 * - Two tabs
 * - Carbon Emission: year-selectable maps (2022 / 2023), legend, KPIs, reason image
 * - Clicking map opens fullscreen lightbox with zoom/pan
 *
 * Drop this file to: app/g7/page.tsx
 * Ensure public images exist:
 *   /public/g3_map/2022.png
 *   /public/g3_map/2023.png
 *   /public/g7/reasons.png
 */

type TabKey = "underground" | "carbon";

const YEARS = [2022, 2023];

const LEGEND_RANGES = [
  { label: "0 ~ 51.28", color: "#fff7ed", value: [0, 51.28] },
  { label: "51.28 ~ 278.52", color: "#fff0b3", value: [51.28, 278.52] },
  { label: "278.52 ~ 2076.32", color: "#ffd59e", value: [278.52, 2076.32] },
  { label: "2,076.32 ~ 5,356.17", color: "#ffb07a", value: [2076.32, 5356.17] },
  { label: "5,356.17 ~ 6,384.25", color: "#ff8a50", value: [5356.17, 6384.25] },
  { label: "6,384.25 ~ 11,443.01", color: "#e85f3b", value: [6384.25, 11443.01] },
  { label: "11,443.01 ~ 30,244.08", color: "#b7302a", value: [11443.01, 30244.08] },
];

function KPI({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-slate-900">{value}</div>
    </div>
  );
}

export default function G7Page() {
  const [tab, setTab] = useState<TabKey>("carbon");

  // Carbon state
  const [year, setYear] = useState<number>(2023);
  const [mapOpen, setMapOpen] = useState(false);

  // selected map src
  const mapSrc = useMemo(() => `/g3_map/${year}.png`, [year]);

  // mock KPIs computed from year (replace with real data fetch)
  const kpis = useMemo(() => {
    // deterministic pseudo-values per year for demo
    if (year === 2023) {
      return {
        totalTon: "12,340",
        avgTonPerKm2: "1,842",
        hotspots: 7,
        areaName: "Pyeongtaek metropolitan",
      };
    }
    // 2022
    return {
      totalTon: "9,820",
      avgTonPerKm2: "1,470",
      hotspots: 5,
      areaName: "Pyeongtaek metropolitan",
    };
  }, [year]);

  // small bar dataset for a mini sparkline (monthly/per zone mock)
  const chartData = useMemo(() => {
    if (year === 2023) return [80, 120, 160, 220, 200, 180, 210, 230, 200, 190, 170, 150];
    return [60, 90, 120, 140, 130, 110, 140, 160, 150, 140, 120, 100];
  }, [year]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">G7 — Underground & Carbon Dashboard</h1>
        <p className="text-sm text-slate-500">
          Two modules: underground risk analysis and carbon emission dashboard for Pyeongtaek.
        </p>
      </header>

      {/* Page Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab("underground")}
          className={[
            "rounded-xl px-3 py-1.5 text-sm transition border",
            tab === "underground"
              ? "bg-brand-600 text-white border-brand-600 shadow-sm"
              : "bg-white text-slate-700 border-slate-200 hover:bg-brand-50 hover:text-brand-700",
          ].join(" ")}
        >
          Underground Risk
        </button>

        <button
          onClick={() => setTab("carbon")}
          className={[
            "rounded-xl px-3 py-1.5 text-sm transition border",
            tab === "carbon"
              ? "bg-brand-600 text-white border-brand-600 shadow-sm"
              : "bg-white text-slate-700 border-slate-200 hover:bg-brand-50 hover:text-brand-700",
          ].join(" ")}
        >
          Carbon Emission
        </button>
      </div>

      {/* --- Underground placeholder --- */}
      {tab === "underground" && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Underground Risk (placeholder)</h2>
          <p className="text-sm text-slate-600 mt-2">
            This module will show groundwater & underground utility risk layers, seismic/soil maps, and
            identified risk zones. (Placeholder — implement with GIS tiles / vector layers.)
          </p>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200 p-4">Soil profile charts (TBD)</div>
            <div className="rounded-xl border border-slate-200 p-4">Utility lines & risk overlays (TBD)</div>
          </div>
        </section>
      )}

      {/* --- Carbon Emission dashboard --- */}
      {tab === "carbon" && (
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT: Map viewer */}
          <div className="lg:col-span-7 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-card overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
                <div>
                  <div className="text-sm font-medium text-slate-900">Carbon Emission Map</div>
                  <div className="text-xs text-slate-500">Year: <span className="font-semibold">{year}</span></div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={String(year)}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="rounded-lg border border-slate-200 px-3 py-1 text-sm"
                  >
                    {YEARS.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>

                  <button
                    onClick={() => setMapOpen(true)}
                    className="rounded-lg border border-slate-300 px-3 py-1 text-sm bg-white hover:bg-slate-50"
                  >
                    View fullscreen
                  </button>

                  <a
                    href={mapSrc}
                    download={`pyeongtaek_carbon_${year}.png`}
                    className="rounded-lg border border-slate-300 px-3 py-1 text-sm bg-white hover:bg-slate-50"
                  >
                    Download
                  </a>
                </div>
              </div>

              <div className="p-3">
                <div className="rounded-lg overflow-hidden border border-slate-100">
                  {/* map image */}
                  <img
                    src={mapSrc}
                    alt={`Pyeongtaek carbon map ${year}`}
                    className="w-full h-[560px] object-contain bg-slate-50"
                    style={{ display: "block" }}
                    onClick={() => setMapOpen(true)}
                  />
                </div>
              </div>
            </div>

            {/* Reason image / explanation */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start gap-4">
                <img src="/g7/reasons.png" alt="reasons" className="w-28 h-28 object-contain rounded-md border" />
                <div>
                  <div className="text-sm font-medium text-slate-900">Reasons of Carbon Emission</div>
                  <div className="text-sm text-slate-600 mt-1">
                    This panel summarizes main contributors (industry, traffic, energy). Click the legend to inspect categories on the map.
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button className="rounded-lg bg-brand-600 text-white px-3 py-1 text-sm">View breakdown</button>
                    <a href="/g7/reasons.png" download className="rounded-lg border border-slate-300 px-3 py-1 text-sm">Download PNG</a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: KPIs, Legend, mini-chart */}
          <div className="lg:col-span-5 space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <KPI label="Total CO₂e (tons)" value={`${kpis.totalTon}`} />
              <KPI label="Avg CO₂e per km²" value={`${kpis.avgTonPerKm2}`} />
              <KPI label="Hotspot count" value={`${kpis.hotspots}`} />
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-sm font-medium text-slate-900">Emission Legend</div>
              <div className="mt-3 space-y-2">
                {LEGEND_RANGES.map((r) => (
                  <div key={r.label} className="flex items-center gap-3">
                    <div style={{ background: r.color }} className="w-8 h-6 rounded-md border" />
                    <div className="text-sm text-slate-700">{r.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-slate-900">Trend (mock)</div>
                <div className="text-xs text-slate-500">{kpis.areaName}</div>
              </div>

              {/* simple SVG bar chart */}
              <div className="mt-3">
                <svg viewBox="0 0 120 40" className="w-full h-20">
                  {chartData.map((v, i) => {
                    const bw = 8;
                    const gap = 2;
                    const x = i * (bw + gap);
                    const max = Math.max(...chartData);
                    const h = (v / (max || 1)) * 30;
                    return (
                      <g key={i}>
                        <rect x={x} y={40 - h} width={bw} height={h} rx={1} fill="#60a5fa" />
                      </g>
                    );
                  })}
                </svg>
                <div className="mt-2 text-xs text-slate-500">Monthly relative emission index (mock data)</div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm shadow-sm">
              <div className="text-sm font-medium text-slate-900">Notes & Actions</div>
              <ul className="mt-2 list-disc ml-5 text-slate-600">
                <li>Use NPS (Normalized emissions) layer for hotspot detection.</li>
                <li>Cross-check hotspots with traffic & industrial landuse data.</li>
                <li>Plan mitigation: tree planting, traffic routing, energy audits.</li>
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* Lightbox for map */}
      <ImageLightbox src={mapSrc} alt={`Map ${year}`} open={mapOpen} onClose={() => setMapOpen(false)} />
    </div>
  );
}
