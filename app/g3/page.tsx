// app/g3/page.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";

/**
 * G3 Demo: Multi-step Tree Health Check interactive demo
 * - Step 1: Enter Tree ID or Upload / Take Photo
 * - Step 2: AI Prediction (simulated) -> segmentation overlay on canvas
 * - Step 3: Height & DBH (simulated numbers) + health score
 *
 * No external images required — everything is rendered dynamically.
 */

/* ----------------- Helpers ----------------- */
function randBetween(min: number, max: number) {
  return Math.floor(min + Math.random() * (max - min + 1));
}

function humanPct(v: number) {
  return `${Math.round(v)}%`;
}

/* Small "coupon" PDF generator (very small text-only PDF blob for demo) */
async function createDemoCoupon(treeId: string) {
  // A minimal PDF as bytes (this is a very small placeholder PDF)
  const text = `PYEONGTAEK\nTreeCoupon\nTree ID: ${treeId}\nThank you for contributing a tree photo!`;
  // Create a simple text file but named .pdf for demo; real app should generate proper PDF server-side.
  const blob = new Blob([text], { type: "application/pdf" });
  return blob;
}

/* ----------------- Types ----------------- */
type Step = 1 | 2 | 3;

/* ----------------- Component ----------------- */
export default function G3PageDemo() {
  const [step, setStep] = useState<Step>(1);

  // Input step
  const [treeId, setTreeId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  // Processing state
  const [progress, setProgress] = useState(0);
  const [processing, setProcessing] = useState(false);

  // AI result placeholders
  const [segmentationBoxes, setSegmentationBoxes] = useState<
    { x: number; y: number; w: number; h: number; color: string; label: string }[]
  >([]);
  const [species, setSpecies] = useState("Unknown");
  const [healthScore, setHealthScore] = useState(0);
  const [heightMeters, setHeightMeters] = useState<number | null>(null);
  const [dbhCm, setDbhCm] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Clean up object URLs
  useEffect(() => {
    return () => {
      if (fileUrl && fileUrl.startsWith && fileUrl.startsWith("blob:")) URL.revokeObjectURL(fileUrl);
    };
  }, [fileUrl]);

  /* Handle file selection (supports camera capture on mobile if user chooses) */
  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    if (!f) return;
    // revoke previous blob URL if exists
    if (fileUrl && fileUrl.startsWith && fileUrl.startsWith("blob:")) URL.revokeObjectURL(fileUrl);
    const url = URL.createObjectURL(f);
    setFile(f);
    setFileUrl(url);
  }

  /* Start demo AI processing (simulated) */
  function startProcessing() {
    setProcessing(true);
    setProgress(0);
    setSegmentationBoxes([]);
    setSpecies("Detecting...");
    setHealthScore(0);
    setHeightMeters(null);
    setDbhCm(null);

    // Simulate progress
    let p = 0;
    const interval = setInterval(() => {
      p += randBetween(6, 14);
      if (p >= 100) p = 100;
      setProgress(p);
      if (p === 100) {
        clearInterval(interval);
        // Fake results:
        const boxes = generateDemoSegments();
        setSegmentationBoxes(boxes);
        setSpecies(["Pine", "Oak", "Maple", "Cherry"][randBetween(0, 3)]);
        const score = randBetween(60, 98);
        setHealthScore(score);
        // Simple heuristic: image height px -> map to meters
        const imgHeight = imgRef.current?.naturalHeight ?? 1200; // fallback
        // map 400-2000px to 3-25 m
        const height = Math.max(3, Math.round(((imgHeight - 400) / 1600) * 22 + 3));
        setHeightMeters(height);
        // DBH random relative to height
        setDbhCm(Math.max(10, Math.round(height * (randBetween(10, 25) / 10))));
        setProcessing(false);
        setStep(2);
      }
    }, 350);
  }

  /* Small synthetic segmentation: return boxes relative to image */
  function generateDemoSegments() {
    // create 3-4 demo boxes with colors
    const colors = ["rgba(34,197,94,0.25)", "rgba(59,130,246,0.18)", "rgba(234,88,12,0.18)", "rgba(168,85,247,0.18)"];
    const labels = ["Tree Area", "Leaf", "Tree Body", "Full Segmentation"];
    const count = randBetween(2, 4);
    const boxes: { x: number; y: number; w: number; h: number; color: string; label: string }[] = [];
    for (let i = 0; i < count; i++) {
      boxes.push({
        x: randBetween(10, 24),
        y: randBetween(6, 30 + i * 6),
        w: randBetween(48, 80 - i * 8),
        h: randBetween(40 - i * 6, 78),
        color: colors[i % colors.length],
        label: labels[i] ?? `Seg${i + 1}`,
      });
    }
    return boxes;
  }

  /* Draw segmentation overlays on canvas when we have fileUrl and segmentationBoxes */
  useEffect(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || segmentationBoxes.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Fit canvas to image display size
    const displayW = img.width;
    const displayH = img.height;
    canvas.width = displayW;
    canvas.height = displayH;

    // Draw translucent overlays
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    segmentationBoxes.forEach((b, idx) => {
      const x = Math.round((b.x / 100) * displayW);
      const y = Math.round((b.y / 100) * displayH);
      const w = Math.round((b.w / 100) * displayW);
      const h = Math.round((b.h / 100) * displayH);
      ctx.fillStyle = b.color;
      ctx.fillRect(x, y, w, h);
      // stroke
      ctx.lineWidth = 2;
      ctx.strokeStyle = b.color.replace(/0\.25|0\.18|0\.5/, "1") || "#4ade80";
      ctx.strokeRect(x, y, w, h);
      // label
      ctx.fillStyle = "#05232e";
      ctx.font = "14px Inter, ui-sans-serif, system-ui";
      ctx.fillText(b.label, x + 6, y + 18);
    });
  }, [segmentationBoxes, fileUrl]);

  /* When user presses "Analyze" from step1
     Updated: always show public/tree_result.png as the displayed image for the demo run.
  */
  function onAnalyze() {
    // Revoke previous blob URL if it exists
    if (fileUrl && fileUrl.startsWith && fileUrl.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(fileUrl);
      } catch (e) {
        /* ignore */
      }
    }

    // Force the demo to display the public result image (replace uploaded preview)
    const demoPublicImage = "/tree_result.png"; // <- ensure this file exists under /public

    // Clear local file state (we will display the public image)
    setFile(null);
    setFileUrl(demoPublicImage);

    // Start processing once the image is loaded to ensure naturalHeight is available
    if (imgRef.current?.complete) {
      startProcessing();
    } else {
      const handler = () => {
        startProcessing();
        imgRef.current?.removeEventListener("load", handler);
      };
      imgRef.current?.addEventListener("load", handler);
    }
  }

  /* Go to final step (3) from step 2's "Next" */
  function onToHeight() {
    // In demo we already computed height/dbh in processing; move to step 3
    setStep(3);
  }

  /* Reset demo */
  function resetDemo() {
    setStep(1);
    setTreeId("");
    setFile(null);
    if (fileUrl && fileUrl.startsWith && fileUrl.startsWith("blob:")) {
      URL.revokeObjectURL(fileUrl);
    }
    setFileUrl(null);
    setSegmentationBoxes([]);
    setSpecies("Unknown");
    setHealthScore(0);
    setHeightMeters(null);
    setDbhCm(null);
    setProcessing(false);
    setProgress(0);
  }

  /* "Take Photo & Get Coupon" - simulate coupon download */
  async function onCoupon() {
    const blob = await createDemoCoupon(treeId || "N/A");
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tree_coupon_${treeId || "demo"}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  /* ----------------- UI Rendering ----------------- */
  return (
    <div className="space-y-8">
      {/* Header */}
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">G3 — Tree Health Check (Demo)</h1>
        <p className="text-sm text-slate-500 max-w-2xl">
          Interactive demo of the Tree Health Check flow: Input ID / Upload photo → AI segmentation → Height & DBH results.
        </p>
      </header>

      {/* Demo area: mobile-style mock panels */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LEFT: Mobile style flow area */}
        <div className="flex flex-col items-center">
          <div className="w-[360px] md:w-[320px]">
            {/* Mobile frame */}
            <div className="rounded-[28px] border border-slate-200 overflow-hidden bg-white shadow-xl">
              <div className="bg-brand-600/90 px-4 py-3 text-white text-sm font-semibold">Tree Health Check — Demo</div>

              <div className="p-4">
                {/* Step UI */}
                {step === 1 && (
                  <div className="space-y-3">
                    <label className="block text-xs font-medium text-slate-700">Enter Tree ID</label>
                    <input
                      value={treeId}
                      onChange={(e) => setTreeId(e.target.value)}
                      placeholder="Enter Tree ID (optional)"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                    />

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-2">Upload or take a photo</label>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={onFileChange}
                        className="text-sm"
                      />
                    </div>

                    {/* preview */}
                    {fileUrl ? (
                      <div className="rounded-lg overflow-hidden border border-slate-200">
                        <img ref={imgRef} src={fileUrl} alt="preview" className="w-full object-cover max-h-64" />
                      </div>
                    ) : (
                      <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
                        No photo selected — the demo will still run with synthetic results.
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => { onAnalyze(); }}
                        className="flex-1 rounded-lg bg-brand-600 text-white px-4 py-2 text-sm"
                        disabled={processing}
                      >
                        {processing ? `Analyzing… ${progress}%` : "Analyze (Demo)"}
                      </button>
                      <button
                        onClick={onCoupon}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"
                      >
                        Take Photo & Get Coupon
                      </button>
                    </div>

                    <div className="mt-2 text-xs text-slate-500">
                      Health Check includes: leaf & pattern analysis, bark review, LiDAR height/DBH demo.
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-slate-900">AI Prediction</div>
                        <div className="text-xs text-slate-500">{species} · Tree ID: {treeId || "N/A"}</div>
                      </div>
                      <div className="text-xs text-slate-500">Confidence: {healthScore ? `${healthScore}%` : "—"}</div>
                    </div>

                    {/* Image + canvas overlay */}
                    <div className="rounded-lg border border-slate-200 overflow-hidden">
                      {/* If no image, show placeholder box */}
                      {fileUrl ? (
                        <div className="relative">
                          <img ref={imgRef} src={fileUrl} alt="tree" className="w-full h-64 object-cover" />
                          <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
                        </div>
                      ) : (
                        <div className="h-64 bg-slate-50 flex items-center justify-center text-slate-400">
                          (no photo) — showing demo segmentation overlays
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={onToHeight}
                        className="flex-1 rounded-lg bg-emerald-500 text-white px-4 py-2 text-sm"
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

                    {/* small legend */}
                    <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                      {segmentationBoxes.map((s, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-sm" style={{ background: s.color }} />
                          <span>{s.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-3">
                    <div className="text-sm font-medium text-slate-900">Tree Height & Health</div>

                    <div className="rounded-lg border border-slate-200 p-3 bg-slate-50">
                      <div className="text-sm text-slate-700">Dimensional Information</div>
                      <div className="mt-2 text-sm">
                        <div><strong>Height:</strong> {heightMeters ? `${heightMeters} m` : "—"}</div>
                        <div><strong>DBH (diameter at breast height):</strong> {dbhCm ? `${dbhCm} cm` : "—"}</div>
                        <div className="mt-2"><strong>Overall Health:</strong> {healthScore ? `${healthScore}%` : "—"}</div>
                        <div><strong>Confidence:</strong> {healthScore >= 80 ? "High" : healthScore >= 60 ? "Medium" : "Low"}</div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button onClick={resetDemo} className="flex-1 rounded-lg bg-brand-600 text-white px-4 py-2 text-sm">
                        Run Another Demo
                      </button>
                      <button onClick={() => setStep(2)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
                        Back
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-3 text-xs text-slate-500 text-center">
            
          </div>
        </div>

        {/* RIGHT: Project structure and info */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Tree Health Check — Explanation</h3>
            <p className="text-sm text-slate-600 mt-2">
              The Tree Health Check module uses image segmentation and LiDAR-derived metrics to estimate tree health,
              height, and trunk diameter (DBH). The UI guides users step-by-step for straightforward contribution.
            </p>

            <div className="mt-3 grid grid-cols-1 gap-2">
              <div className="text-sm">
                <strong>1. Input / Upload:</strong> Enter Tree ID or upload image (mobile camera supported).
              </div>
              <div className="text-sm">
                <strong>2. AI Segmentation:</strong> Model segments leaf, body, and full tree silhouette; species & health score estimated.
              </div>
              <div className="text-sm">
                <strong>3. Dimensions:</strong> LiDAR + segmentation estimate height & DBH; store metrics for monitoring & alerts.
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h4 className="font-semibold text-slate-900">G3 Project Structure (placeholder)</h4>
            <ol className="mt-2 text-sm text-slate-600 list-decimal ml-5 space-y-1">
              <li><strong>Acquisition:</strong> Photos & LiDAR scans (mobile/field devices)</li>
              <li><strong>Preprocess:</strong> Align LiDAR + RGB, denoise, normalize</li>
              <li><strong>Models:</strong> Segmentation, species classifier, height estimator</li>
              <li><strong>Storage:</strong> S3 / NAS for pointclouds & images; PostgreSQL metadata</li>
              <li><strong>Dashboard:</strong> Visualize health trends, export reports</li>
            </ol>

            <div className="mt-3 text-sm">
              <button onClick={() => alert("Open architecture (placeholder)") } className="rounded-lg bg-brand-600 text-white px-3 py-1 text-sm">
                View Architecture (placeholder)
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h4 className="font-semibold text-slate-900">Notes for deployment</h4>
            <ul className="text-sm text-slate-600 list-disc ml-5 space-y-1">
              <li>Integrate with LiDAR pointclouds for accurate height/DBH.</li>
              <li>Use calibrated sensors and ground truth for model validation.</li>
              <li>Protect user-uploaded data and anonymize metadata.</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
