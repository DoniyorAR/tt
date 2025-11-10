// app/wbs/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";

/* ---------- tiny CSV parser (handles quotes) ---------- */
function parseCSV(text: string): string[][] {
  // strip BOM + normalize newlines
  const src = text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let insideQuotes = false;

  for (let i = 0; i < src.length; i++) {
    const ch = src[i];

    if (insideQuotes) {
      if (ch === '"') {
        const next = src[i + 1];
        if (next === '"') {
          field += '"'; // escaped quote
          i++;
        } else {
          insideQuotes = false;
        }
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') {
        insideQuotes = true;
      } else if (ch === ",") {
        row.push(field);
        field = "";
      } else if (ch === "\n") {
        row.push(field);
        rows.push(row);
        row = [];
        field = "";
      } else {
        field += ch;
      }
    }
  }
  // last field/row
  row.push(field);
  rows.push(row);

  // trim trailing empty last row if file ends with newline
  if (rows.length && rows[rows.length - 1].length === 1 && rows[rows.length - 1][0] === "") {
    rows.pop();
  }
  return rows;
}

/* ---------- CSVTable: renders rows ---------- */
function CSVTable({ rows }: { rows: string[][] }) {
  if (!rows || rows.length === 0) {
    return <div className="text-sm text-slate-500">No data.</div>;
  }
  const headers = rows[0];
  const body = rows.slice(1);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead className="bg-slate-50">
            <tr>
              {headers.map((h, i) => (
                <th
                  key={i}
                  className="text-left text-xs font-semibold uppercase tracking-wide text-slate-600 px-4 py-3 border-b border-slate-200"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {body.map((r, ridx) => (
              <tr key={ridx} className={ridx % 2 ? "bg-white" : "bg-slate-50/30"}>
                {headers.map((_, cidx) => (
                  <td
                    key={cidx}
                    className="text-sm text-slate-700 px-4 py-2 border-b border-slate-100"
                  >
                    {r[cidx] ?? ""}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------- Tabs ---------- */
type TabDef = { key: string; label: string; file: string; kpi?: string };

const TABS: TabDef[] = [
  { key: "overall", label: "Overall WBS", file: "/wbs_overall.csv", kpi: "All streams" },
  { key: "g3",      label: "G3 WBS",      file: "/wbs_g3.csv",      kpi: "Tree pipeline" },
  { key: "g7",      label: "G7 WBS",      file: "/wbs_g7.csv",      kpi: "Risk prediction" },
];

export default function WBSPage() {
  const [active, setActive] = useState<string>(TABS[0].key);
  const [rows, setRows] = useState<string[][]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const current = useMemo(() => TABS.find(t => t.key === active)!, [active]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setErr(null);
      try {
        const res = await fetch(current.file, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const txt = await res.text();
        const parsed = parseCSV(txt);
        if (!cancelled) setRows(parsed);
      } catch (e: any) {
        if (!cancelled) setErr(e?.message ?? "Failed to load CSV");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [current.file]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-slate-900">
            WBS schedule
          </h1>
          <p className="text-sm text-slate-500">
            Work breakdown · milestones · owners · timelines
          </p>
        </div>
      </section>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {TABS.map((t) => {
          const isActive = t.key === active;
          return (
            <button
              key={t.key}
              onClick={() => setActive(t.key)}
              className={[
                "rounded-xl px-3 py-1.5 text-sm transition border",
                isActive
                  ? "bg-brand-600 text-white border-brand-600 shadow-sm"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-brand-50 hover:text-brand-700",
              ].join(" ")}
            >
              <span className="font-medium">{t.label}</span>
              {t.kpi && (
                <span
                  className={[
                    "ml-2 text-[11px] rounded-full px-2 py-0.5",
                    isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600",
                  ].join(" ")}
                >
                  {t.kpi}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <section className="space-y-3">
        {loading && (
          <div className="text-sm text-slate-500">Loading {current.label}…</div>
        )}
        {err && (
          <div className="text-sm text-red-600">
            Failed to load <span className="font-medium">{current.file}</span>: {err}
          </div>
        )}
        {!loading && !err && <CSVTable rows={rows} />}
      </section>
    </div>
  );
}
