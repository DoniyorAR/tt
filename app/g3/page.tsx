"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import rawLabels from "./labels.json";

type Step = 1 | 2 | 3;

type LabelFile = {
  info?: { description?: string };
  images: {
    id: number;
    width: number;
    height: number;
    file_name: string;
  }[];
  annotations: {
    id: number;
    iscrowd: number;
    image_id: number;
    category_id: number;
    segmentation: number[][];
    bbox: [number, number, number, number];
    area: number;
  }[];
  categories: {
    id: number;
    name: string;
  }[];
};

type OverlayItem = {
  id: number;
  label: "tree" | "qr";
  points: Array<{ x: number; y: number }>;
};

const labels = rawLabels as LabelFile;

const FIXED_RESULT = {
  distanceToQrM: 1.5,
  heightM: 5.2,
  dbhCm: 15,
  healthPct: 88,
};

const SEGMENT_STYLE = {
  tree: {
    fill: "rgba(34,197,94,0.28)",
    stroke: "#16a34a",
    text: "Segmented Tree Area",
  },
  qr: {
    fill: "rgba(59,130,246,0.30)",
    stroke: "#2563eb",
    text: "Segmented QR Area",
  },
} as const;

export default function G3PageDemo() {
  const [step, setStep] = useState<Step>(1);
  const [treeId, setTreeId] = useState("1");
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const imgRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const imageMeta = labels.images[0];

  const overlayItems = useMemo<OverlayItem[]>(() => {
    const categoryMap = new Map<number, string>(
      labels.categories.map((c) => [c.id, c.name.toLowerCase()])
    );

    return labels.annotations
      .map((ann) => {
        const categoryName = categoryMap.get(ann.category_id);
        if (categoryName !== "tree" && categoryName !== "qr") return null;

        const polygon = ann.segmentation?.[0] ?? [];
        const points: Array<{ x: number; y: number }> = [];

        for (let i = 0; i < polygon.length; i += 2) {
          points.push({
            x: polygon[i],
            y: polygon[i + 1],
          });
        }

        return {
          id: ann.id,
          label: categoryName,
          points,
        } as OverlayItem;
      })
      .filter(Boolean) as OverlayItem[];
  }, []);

  useEffect(() => {
    return () => {
      if (fileUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [fileUrl]);

  const drawSegmentation = useCallback(() => {
    const img = imgRef.current;
    const canvas = canvasRef.current;

    if (!img || !canvas || !fileUrl) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const displayWidth = img.clientWidth;
    const displayHeight = img.clientHeight;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = Math.round(displayWidth * dpr);
    canvas.height = Math.round(displayHeight * dpr);
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, displayWidth, displayHeight);

    const scaleX = displayWidth / imageMeta.width;
    const scaleY = displayHeight / imageMeta.height;

    overlayItems.forEach((item) => {
      const style = SEGMENT_STYLE[item.label];
      if (item.points.length < 2) return;

      ctx.beginPath();
      ctx.moveTo(item.points[0].x * scaleX, item.points[0].y * scaleY);

      for (let i = 1; i < item.points.length; i += 1) {
        ctx.lineTo(item.points[i].x * scaleX, item.points[i].y * scaleY);
      }

      ctx.closePath();
      ctx.fillStyle = style.fill;
      ctx.strokeStyle = style.stroke;
      ctx.lineWidth = 2;
      ctx.fill();
      ctx.stroke();

      const xs = item.points.map((p) => p.x * scaleX);
      const ys = item.points.map((p) => p.y * scaleY);
      const minX = Math.min(...xs);
      const minY = Math.min(...ys);

      const label = style.text;
      ctx.font = "600 13px Inter, ui-sans-serif, system-ui";
      const textWidth = ctx.measureText(label).width;
      const labelX = minX + 8;
      const labelY = Math.max(22, minY + 22);

      ctx.fillStyle = "rgba(255,255,255,0.92)";
      ctx.fillRect(labelX - 6, labelY - 16, textWidth + 12, 22);

      ctx.fillStyle = style.stroke;
      ctx.fillText(label, labelX, labelY);
    });
  }, [fileUrl, imageMeta.width, imageMeta.height, overlayItems]);

  useEffect(() => {
    if (step !== 2 || !fileUrl) return;

    const img = imgRef.current;
    if (!img) return;

    if (img.complete) {
      drawSegmentation();
      return;
    }

    const handleLoad = () => drawSegmentation();
    img.addEventListener("load", handleLoad);

    return () => {
      img.removeEventListener("load", handleLoad);
    };
  }, [step, fileUrl, drawSegmentation]);

  useEffect(() => {
    const onResize = () => {
      if (step === 2) drawSegmentation();
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [step, drawSegmentation]);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const nextFile = e.target.files?.[0] ?? null;
    if (!nextFile) return;

    if (fileUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(fileUrl);
    }

    const nextUrl = URL.createObjectURL(nextFile);
    setFile(nextFile);
    setFileUrl(nextUrl);
    setStep(1);
    setProgress(0);
  }

  function onAnalyze() {
    if (!fileUrl || !file) return;

    setProcessing(true);
    setProgress(0);

    let current = 0;
    const timer = window.setInterval(() => {
      current += 20;
      if (current >= 100) {
        current = 100;
        setProgress(100);
        window.clearInterval(timer);
        setProcessing(false);
        setStep(2);
        return;
      }
      setProgress(current);
    }, 150);
  }

  function onToHeight() {
    setStep(3);
  }

  function resetDemo() {
    if (fileUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(fileUrl);
    }

    setStep(1);
    setTreeId("1");
    setFile(null);
    setFileUrl(null);
    setProcessing(false);
    setProgress(0);
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">G3 — Tree Health Check</h1>
        <p className="max-w-2xl text-sm text-slate-500">
          Upload an image, run analysis, review semantic segmentation for tree and QR areas,
          then inspect height and DBH results.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="flex flex-col items-center">
          <div className="w-[360px] md:w-[320px]">
            <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-xl">
              <div className="bg-brand-600/90 px-4 py-3 text-sm font-semibold text-white">
                Tree Health Check
              </div>

              <div className="p-4">
                {step === 1 && (
                  <div className="space-y-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-700">
                        Tree ID
                      </label>
                      <input
                        value={treeId}
                        onChange={(e) => setTreeId(e.target.value)}
                        placeholder="Enter Tree ID"
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-medium text-slate-700">
                        Choose image
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={onFileChange}
                        className="text-sm"
                      />
                    </div>

                    {fileUrl ? (
                      <div className="overflow-hidden rounded-lg border border-slate-200">
                        <img
                          src={fileUrl}
                          alt="Selected preview"
                          className="max-h-64 w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
                        No image selected.
                      </div>
                    )}

                    <button
                      onClick={onAnalyze}
                      disabled={!fileUrl || processing}
                      className="w-full rounded-lg bg-brand-600 px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {processing ? `Analyzing... ${progress}%` : "Analyze (Demo)"}
                    </button>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm font-medium text-slate-900">AI Prediction</div>
                        <div className="text-xs text-slate-500">Tree ID: {treeId || "1"}</div>
                      </div>
                      <div className="text-xs font-medium text-slate-600">
                        Overall health: {FIXED_RESULT.healthPct}%
                      </div>
                    </div>

                    <div className="overflow-hidden rounded-lg border border-slate-200">
                      <div className="relative">
                        <img
                          ref={imgRef}
                          src={fileUrl ?? ""}
                          alt="Analyzed tree"
                          className="h-64 w-full object-cover"
                        />
                        <canvas
                          ref={canvasRef}
                          className="pointer-events-none absolute inset-0"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <div className="text-sm font-medium text-slate-900">
                        Semantic Segmentation
                      </div>

                      <div className="flex items-center gap-2 text-sm text-slate-700">
                        <span
                          className="h-3 w-3 rounded-sm"
                          style={{ background: SEGMENT_STYLE.tree.fill }}
                        />
                        <span>Segmented Tree Area</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-slate-700">
                        <span
                          className="h-3 w-3 rounded-sm"
                          style={{ background: SEGMENT_STYLE.qr.fill }}
                        />
                        <span>Segmented QR Area</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={onToHeight}
                        className="flex-1 rounded-lg bg-emerald-500 px-4 py-2 text-sm text-white"
                      >
                        View Height & DBH
                      </button>
                      <button
                        onClick={() => setStep(1)}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      >
                        Back
                      </button>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-3">
                    <div className="text-sm font-medium text-slate-900">
                      Height & DBH Result
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                      <div>
                        <strong>Distance from ground to QR</strong> ={" "}
                        {FIXED_RESULT.distanceToQrM} (m)
                      </div>
                      <div className="mt-2">
                        <strong>Height</strong> = {FIXED_RESULT.heightM} (m)
                      </div>
                      <div className="mt-2">
                        <strong>DBH (diameter at QR area)</strong> ={" "}
                        {FIXED_RESULT.dbhCm} (cm)
                      </div>
                      <div className="mt-3">
                        <strong>Overall health</strong> = {FIXED_RESULT.healthPct} %
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={resetDemo}
                        className="flex-1 rounded-lg bg-brand-600 px-4 py-2 text-sm text-white"
                      >
                        Run Another Demo
                      </button>
                      <button
                        onClick={() => setStep(2)}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      >
                        Back
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">What changed</h3>
            <div className="mt-2 space-y-2 text-sm text-slate-600">
              <div>• Uses uploaded image preview instead of a static demo file.</div>
              <div>• Moves directly from Analyze → AI Prediction page.</div>
              <div>• Draws polygon-based semantic segmentation from JSON.</div>
              <div>• Shows only Tree Area and QR Area.</div>
              <div>• Final result page uses your fixed values.</div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h4 className="font-semibold text-slate-900">Annotation source</h4>
            <p className="mt-2 text-sm text-slate-600">
              This page reads the same structure as your uploaded label file:
              one image entry and two categories, <strong>tree</strong> and <strong>qr</strong>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
