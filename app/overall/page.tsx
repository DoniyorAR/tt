"use client";

import { useEffect, useMemo, useState } from "react";
import ImageLightbox from "@/components/ImageLightbox"; // <-- add this

type FileItem = {
  name: string; url: string; size: number; sizeHuman: string; ext: string;
};
type Tab = { key: string; label: string };

const TABS: Tab[] = [
  { key: "application",    label: "Application" },
  { key: "fusion",         label: "Fusion" },
  { key: "g3",             label: "G3" },
  { key: "g7",             label: "G7" },
  { key: "monthly_report", label: "Monthly report" },
];

const OVERALL_IMAGE = "/overall.png"; // ensure this exists in /public

function ExtBadge({ ext }: { ext: string }) {
  const map: Record<string,string> = {
    pdf: "bg-red-100 text-red-700",
    doc: "bg-sky-100 text-sky-700",
    docx:"bg-sky-100 text-sky-700",
    ppt: "bg-orange-100 text-orange-700",
    pptx:"bg-orange-100 text-orange-700",
    xls: "bg-emerald-100 text-emerald-700",
    xlsx:"bg-emerald-100 text-emerald-700",
  };
  const cls = map[ext] || "bg-slate-100 text-slate-700";
  return <span className={`text-[11px] px-2 py-0.5 rounded-full ${cls}`}>{ext || "file"}</span>;
}

function FileCard({ f }: { f: FileItem }) {
  return (
    <a href={f.url} download
       className="group flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 hover:shadow-card transition">
      <div className="min-w-0 flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-brand-600 to-brand-500 flex items-center justify-center text-white text-xs font-semibold">
          {f.ext?.slice(0,4).toUpperCase() || "FILE"}
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-medium text-slate-900">{f.name}</div>
          <div className="text-xs text-slate-500">{f.sizeHuman}</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <ExtBadge ext={f.ext}/>
        <span className="text-slate-400 group-hover:text-brand-600 transition">Download →</span>
      </div>
    </a>
  );
}

export default function OverallPage() {
  const [active, setActive] = useState<string>(TABS[0].key);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // lightbox state
  const [showLightbox, setShowLightbox] = useState(false);

  const current = useMemo(() => TABS.find((t) => t.key === active)!, [active]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const res = await fetch(`/api/docs?folder=${encodeURIComponent(active)}`, { cache: "no-store" });
        const data = await res.json();
        if (!cancelled) setFiles(data?.files || []);
      } catch (e: any) {
        if (!cancelled) setErr(e?.message ?? "Failed to load files");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [active]);

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: Architecture image (click to enlarge) */}
        <section className="lg:col-span-5">
          <div className="rounded-3xl border border-slate-200 overflow-hidden bg-white shadow-card">
            <div className="bg-gradient-to-tr from-brand-600 via-brand-500 to-brand-400 h-10" />
            <div className="p-4">
              <button
                onClick={() => setShowLightbox(true)}
                className="w-full rounded-2xl border border-slate-200 overflow-hidden group focus:outline-none focus:ring-2 focus:ring-brand-500"
                title="Click to view full size"
              >
                <img
                  src={OVERALL_IMAGE}
                  alt="Overall architecture"
                  className="block w-full h-[420px] object-contain bg-slate-50 group-hover:opacity-95 transition"
                />
              </button>
              <div className="mt-3 text-sm text-slate-600">
                Overall structure of the Pyeongtaek Smart Platform (G3/G7, fusion, infra).
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT: Folder tabs + file list (unchanged) */}
        <section className="lg:col-span-7">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-slate-900">Documents</h1>
              <p className="text-sm text-slate-500">Click a category, then download any file.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-4">
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
                  {t.label}
                </button>
              );
            })}
          </div>

          <div className="space-y-3">
            {loading && <div className="text-sm text-slate-500">Loading {current.label}…</div>}
            {err && (
              <div className="text-sm text-red-600">
                Failed to load <span className="font-medium">{current.label}</span>: {err}
              </div>
            )}
            {!loading && !err && files.length === 0 && (
              <div className="text-sm text-slate-500">No files in this folder.</div>
            )}
            {!loading && !err && files.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {files.map((f) => <FileCard key={f.url} f={f} />)}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Lightbox overlay */}
      <ImageLightbox
        src={OVERALL_IMAGE}
        alt="Overall architecture"
        open={showLightbox}
        onClose={() => setShowLightbox(false)}
      />
    </>
  );
}
