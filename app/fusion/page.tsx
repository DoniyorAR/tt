// app/fusion/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import ImageLightbox from "../../components/ImageLightbox"; // adjust if your alias differs

const FUSION_IMAGE = "/fusion_diagram.png"; // put your PNG here: /public/fusion_diagram.png
const DATASET_URL = "http://31.97.62.177:8000/login";

export default function FusionPage() {
  // lightbox for the left PNG
  const [showLightbox, setShowLightbox] = useState(false);

  // iframe helpers
  const [iframeKey, setIframeKey] = useState(0); // force-reload via key change
  const [blocked, setBlocked] = useState(false);
  const isMixedContent =
    typeof window !== "undefined" &&
    window.location.protocol === "https:" &&
    DATASET_URL.startsWith("http://");

  // We can't reliably detect X-Frame-Options programmatically due to browser security,
  // but we can mark "blocked" if the iframe fails to load for a while.
  useEffect(() => {
    let timer: any;
    setBlocked(false);
    // If after N seconds nothing fired, assume blocked (fallback UI still shows "Open" button).
    timer = setTimeout(() => setBlocked(true), 4000);
    return () => clearTimeout(timer);
  }, [iframeKey]);

  return (
    <>
      <div className="space-y-6">
        <header>
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-slate-900">
            Data fusion
          </h1>
          <p className="text-sm text-slate-500">
            Diagram of our fusion pipeline and the open dataset portal.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT: Fusion diagram (click to enlarge) */}
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
                    src={FUSION_IMAGE}
                    alt="Data fusion diagram"
                    className="block w-full h-[420px] object-contain bg-slate-50 group-hover:opacity-95 transition"
                  />
                </button>
                <div className="mt-3 text-sm text-slate-600">
                  Fusion diagram: CCTV · sensors · climate · LiDAR → unified features & analytics.
                </div>
              </div>
            </div>
          </section>

          {/* RIGHT: Embedded dataset portal */}
          <section className="lg:col-span-7">
            <div className="rounded-3xl border border-slate-200 overflow-hidden bg-white shadow-card flex flex-col">
              {/* Toolbar */}
              <div className="flex items-center justify-between px-4 h-12 border-b border-slate-200 bg-slate-50">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="font-medium">Open Dataset</span>
                  <span className="text-slate-300">•</span>
                  <a
                    href={DATASET_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="text-brand-700 hover:underline"
                    title={DATASET_URL}
                  >
                    {DATASET_URL}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={DATASET_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm bg-white hover:bg-slate-50"
                    title="Open in new tab"
                  >
                    Open in new tab
                  </a>
                  <button
                    onClick={() => setIframeKey((k) => k + 1)}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm bg-white hover:bg-slate-50"
                    title="Reload"
                  >
                    Reload
                  </button>
                </div>
              </div>

              {/* Mixed content warning (HTTPS site embedding HTTP) */}
              {isMixedContent && (
                <div className="px-4 py-3 text-sm bg-amber-50 border-b border-amber-200 text-amber-800">
                  Your site is on <strong>HTTPS</strong>, but the dataset portal is <strong>HTTP</strong>.
                  Most browsers block mixed-content iframes. Use the button above to open in a new tab, or
                  serve the portal via HTTPS / reverse proxy through Nginx.
                </div>
              )}

              {/* Iframe area */}
              <div className="relative flex-1 min-h-[520px]">
                {!blocked ? (
                  <iframe
                    key={iframeKey}
                    src={DATASET_URL}
                    className="absolute inset-0 w-full h-full"
                    // sandbox can be relaxed if needed; leaving minimal here
                    // sandbox="allow-scripts allow-forms allow-same-origin"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
                    <div className="max-w-lg rounded-2xl border border-slate-200 bg-white p-6">
                      <div className="text-base font-semibold text-slate-900">Unable to embed</div>
                      <p className="mt-2 text-sm text-slate-600">
                        The dataset portal may block embedding (X-Frame-Options) or your browser blocked
                        mixed content. Click the button above to open it in a new tab. You can also proxy
                        it behind your Nginx with HTTPS to allow same-origin embedding.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Fullscreen lightbox for diagram */}
      <ImageLightbox
        src={FUSION_IMAGE}
        alt="Data fusion diagram"
        open={showLightbox}
        onClose={() => setShowLightbox(false)}
      />
    </>
  );
}
