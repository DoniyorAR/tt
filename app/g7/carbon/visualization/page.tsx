// app/g7/carbon/visualization/page.tsx
"use client";
import { useState } from "react";

export default function CarbonVizPage() {
  const [year, setYear] = useState(2023);
  const mapSrc = `/g3_map/${year}.png`;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Visualization — maps & trends</h2>
      <div className="rounded-xl border p-3 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button className="px-3 py-1 border rounded" onClick={() => setYear(2022)}>2022</button>
            <button className="px-3 py-1 border rounded" onClick={() => setYear(2023)}>2023</button>
          </div>
          <div className="text-xs text-slate-500">Map year: {year}</div>
        </div>

        <div className="mt-3">
          <img src={mapSrc} alt="map" className="w-full h-[420px] object-contain border rounded" />
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="rounded-xl border p-3">
            <div className="text-sm font-medium">Hotspot density</div>
            <svg viewBox="0 0 120 40" className="w-full h-24">
              {[10, 20, 40, 60, 30, 50, 70].map((v, i) => (
                <rect key={i} x={i * 14} y={40 - (v / 80) * 35} width={10} height={(v / 80) * 35} fill="#fb923c" rx={2} />
              ))}
            </svg>
          </div>
          <div className="rounded-xl border p-3">
            <div className="text-sm font-medium">Emission by sector</div>
            <div className="mt-2 text-xs text-slate-600">Industry 45% · Traffic 30% · Energy 15% · Other 10%</div>
          </div>
        </div>
      </div>
    </div>
  );
}
