"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Step = 1 | 2 | 3;

type LabelFile = {
  images: {
    id: number;
    width: number;
    height: number;
    file_name: string;
  }[];
  annotations: {
    id: number;
    image_id: number;
    category_id: number;
    segmentation: number[][];
    bbox: [number, number, number, number];
    area: number;
    iscrowd?: number;
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

const LABELS: LabelFile = {
  images: [
    {
      id: 1,
      width: 960,
      height: 1280,
      file_name: "photo_6_2026-03-10_13-22-33.jpg",
    },
  ],
  categories: [
    { id: 1, name: "tree" },
    { id: 2, name: "qr" },
  ],
  annotations: [
    {
      id: 0,
      image_id: 1,
      category_id: 1,
      bbox: [206.9109947643979, 122.30366492146597, 608.1675392670156, 991.8324607329844],
      area: 253522.8749211919,
      segmentation: [[
        317.4869109947644, 269.73821989528795, 330.89005235602093, 211.09947643979058,
        366.0732984293194, 184.2931937172775, 384.5026178010471, 152.4607329842932,
        428.0628272251309, 125.6544502617801, 449.84293193717275, 122.30366492146597,
        481.67539267015707, 134.03141361256544, 510.15706806282725, 142.40837696335078,
        541.9895287958116, 154.13612565445027, 582.1989528795812, 169.21465968586386,
        600.6282722513089, 179.2670157068063, 639.1623036649214, 199.3717277486911,
        662.6178010471205, 206.07329842931938, 711.2041884816754, 207.74869109947645,
        749.7382198952879, 216.12565445026178, 769.8429319371728, 219.4764397905759,
        771.5183246073299, 236.2303664921466, 776.5445026178011, 263.0366492146597,
        766.4921465968587, 293.1937172774869, 749.7382198952879, 309.9476439790576,
        741.3612565445026, 330.0523560209424, 743.0366492146596, 341.78010471204186,
        793.2984293193717, 291.5183246073298, 806.7015706806283, 316.64921465968587,
        815.0785340314136, 345.130890052356, 798.3246073298429, 375.28795811518324,
        774.869109947644, 413.8219895287958, 756.4397905759163, 440.6282722513089,
        746.3874345549738, 460.73298429319374, 712.8795811518324, 484.18848167539267,
        665.9685863874346, 499.26701570680626, 612.3560209424083, 517.696335078534,
        595.6020942408377, 521.0471204188482, 570.4712041884817, 529.4240837696335,
        562.0942408376964, 541.151832460733, 567.1204188481676, 552.8795811518324,
        610.6806282722513, 551.2041884816754, 650.890052356021, 542.82722513089,
        717.9057591623036, 536.1256544502618, 763.1413612565445, 537.8010471204188,
        756.4397905759163, 559.5811518324607, 739.6858638743455, 586.3874345549738,
        736.3350785340314, 596.4397905759163, 732.9842931937172, 604.8167539267016,
        751.4136125654451, 623.2460732984293, 754.7643979057592, 648.3769633507853,
        759.7905759162304, 670.1570680628272, 769.8429319371728, 691.937172774869,
        776.5445026178011, 703.6649214659686, 756.4397905759163, 655.0785340314136,
        778.2198952879581, 718.7434554973822, 754.7643979057592, 713.717277486911,
        686.0732984293194, 708.6910994764398, 672.6701570680628, 705.3403141361257,
        647.5392670157069, 703.6649214659686, 609.0052356020942, 696.9633507853403,
        600.6282722513089, 696.9633507853403, 545.3403141361257, 710.3664921465969,
        555.3926701570681, 847.7486910994764, 585.5497382198953, 1025.3403141361257,
        585.5497382198953, 1110.7853403141362, 525.2356020942408, 1114.1361256544503,
        515.1832460732984, 931.5183246073299, 503.4554973821989, 804.1884816753927,
        503.4554973821989, 770.6806282722513, 493.40314136125653, 747.2251308900524,
        493.40314136125653, 698.6387434554974, 466.59685863874347, 693.6125654450261,
        446.4921465968586, 690.261780104712, 438.1151832460733, 680.2094240837696,
        458.21989528795814, 660.1047120418848, 483.35078534031413, 658.4293193717277,
        498.42931937172773, 655.0785340314136, 500.1047120418848, 651.7277486910995,
        503.4554973821989, 645.0261780104712, 498.42931937172773, 614.869109947644,
        453.1937172774869, 593.0890052356021, 421.3612565445026, 588.0628272251308,
        407.9581151832461, 579.6858638743455, 367.74869109947645, 557.9057591623036,
        304.08376963350787, 519.3717277486911, 283.979057591623, 490.89005235602093,
        262.19895287958116, 477.4869109947644, 237.06806282722513, 464.08376963350787,
        213.61256544502618, 438.9528795811518, 206.9109947643979, 422.19895287958116,
        208.58638743455498, 365.23560209424085, 211.9371727748691, 346.80628272251306,
        215.28795811518324, 311.62303664921467, 227.0157068062827, 288.1675392670157,
        257.17277486910996, 264.71204188481676, 277.27748691099475, 258.0104712041885,
        309.10994764397907, 266.3874345549738
      ]],
    },
    {
      id: 1,
      image_id: 1,
      category_id: 2,
      bbox: [486.70157068062827, 700.3141361256545, 41.88481675392666, 50.26178010471199],
      area: 1577.500616759402,
      segmentation: [[
        528.5863874345549, 705.3403141361257,
        496.75392670157066, 700.3141361256545,
        486.70157068062827, 742.1989528795812,
        525.2356020942408, 750.5759162303665
      ]],
    },
  ],
};

const RESULT = {
  distanceToQr: 1.5,
  height: 5.2,
  dbh: 15,
  health: 88,
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
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const imgRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const imageMeta = LABELS.images[0];

  const overlayItems = useMemo<OverlayItem[]>(() => {
    const categoryMap = new Map<number, string>(
      LABELS.categories.map((c) => [c.id, c.name.toLowerCase()])
    );

    return LABELS.annotations
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
    setFileUrl(nextUrl);
    setProgress(0);
    setStep(1);
  }

  function onAnalyze() {
    if (!fileUrl) return;

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
    setFileUrl(null);
    setProcessing(false);
    setProgress(0);
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">G3 — Tree Health Check</h1>
        <p className="max-w-2xl text-sm text-slate-500">
          Upload image → AI prediction → Height & DBH result
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
                        Upload or take a photo
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
                          alt="Preview"
                          className="max-h-64 w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
                        No image selected
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
                        Overall health: {RESULT.health} %
                      </div>
                    </div>

                    <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                      <div className="relative">
                        <img
                          ref={imgRef}
                          src={fileUrl ?? ""}
                          alt="Analyzed tree"
                          className="block w-full h-auto"
                          onLoad={drawSegmentation}
                        />
                        <canvas
                          ref={canvasRef}
                          className="pointer-events-none absolute left-0 top-0"
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
                    <div className="text-sm font-medium text-slate-900">Height & DBH</div>

                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                      <div>
                        <strong>Distance from ground to QR</strong> = {RESULT.distanceToQr} (m)
                      </div>
                      <div className="mt-2">
                        <strong>Height</strong> = {RESULT.height} (m)
                      </div>
                      <div className="mt-2">
                        <strong>DBH (diameter at QR area)</strong> = {RESULT.dbh} (cm)
                      </div>
                      <div className="mt-3">
                        <strong>Overall health</strong> = {RESULT.health} %
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
            <h3 className="text-lg font-semibold text-slate-900">Updated behavior</h3>
            <div className="mt-2 space-y-2 text-sm text-slate-600">
              <div>1. Choose image and click Analyze.</div>
              <div>2. Go to AI Prediction page with tree and QR segmentation only.</div>
              <div>3. Go to fixed Height & DBH result page.</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
