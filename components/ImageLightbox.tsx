"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  src: string;
  alt?: string;
  open: boolean;
  onClose: () => void;
  maxScale?: number; // default 5
  minScale?: number; // default 0.5
};

export default function ImageLightbox({
  src,
  alt = "image",
  open,
  onClose,
  maxScale = 5,
  minScale = 0.5,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(0); // translateX
  const [ty, setTy] = useState(0); // translateY
  const [dragging, setDragging] = useState(false);
  const startRef = useRef<{x: number; y: number; tx: number; ty: number} | null>(null);

  useEffect(() => {
    if (!open) {
      setScale(1);
      setTx(0);
      setTy(0);
    }
  }, [open]);

  // close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const clamp = useCallback((v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v)), []);

  const zoom = useCallback((delta: number, cx?: number, cy?: number) => {
    setScale(prev => {
      const next = clamp(prev * (delta > 0 ? 1.1 : 0.9), minScale, maxScale);
      // zoom towards cursor: adjust translate so point under cursor stays put
      if (containerRef.current && imgRef.current && cx != null && cy != null) {
        const rect = containerRef.current.getBoundingClientRect();
        const dx = cx - rect.left - rect.width / 2 - tx;
        const dy = cy - rect.top - rect.height / 2 - ty;
        const ratio = next / prev - 1;
        setTx(t => t - dx * ratio);
        setTy(t => t - dy * ratio);
      }
      return next;
    });
  }, [clamp, maxScale, minScale, tx, ty]);

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    zoom(e.deltaY, e.clientX, e.clientY);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    setDragging(true);
    startRef.current = { x: e.clientX, y: e.clientY, tx, ty };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging || !startRef.current) return;
    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;
    setTx(startRef.current.tx + dx);
    setTy(startRef.current.ty + dy);
  };
  const onPointerUp = () => {
    setDragging(false);
    startRef.current = null;
  };

  const reset = () => { setScale(1); setTx(0); setTy(0); };

  const onDblClick = (e: React.MouseEvent) => {
    // toggle between 1 and 2.5x centered on click
    if (scale <= 1.01) {
      zoom(+1, e.clientX, e.clientY);
      zoom(+1, e.clientX, e.clientY); // bump twice (~1.21x)
      zoom(+1, e.clientX, e.clientY); // (~1.33x)
    } else {
      reset();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000] bg-slate-900/85 backdrop-blur-sm">
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 h-12 px-3 md:px-6 flex items-center justify-between text-slate-100">
        <div className="flex items-center gap-3 text-sm">
          <span className="hidden sm:inline">Image preview</span>
          <span className="text-slate-400">•</span>
          <span className="hidden sm:inline">Scroll to zoom · drag to pan · Esc to close</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => zoom(+1)}
            className="rounded-lg bg-white/10 hover:bg-white/20 px-3 py-1 text-sm"
            title="Zoom in"
          >＋</button>
          <button
            onClick={() => zoom(-1)}
            className="rounded-lg bg-white/10 hover:bg-white/20 px-3 py-1 text-sm"
            title="Zoom out"
          >－</button>
          <button
            onClick={reset}
            className="rounded-lg bg-white/10 hover:bg-white/20 px-3 py-1 text-sm"
            title="Reset"
          >Reset</button>
          <button
            onClick={onClose}
            className="rounded-lg bg-white/10 hover:bg-white/20 px-3 py-1 text-sm"
            title="Close"
          >✕</button>
        </div>
      </div>

      {/* Image stage */}
      <div
        ref={containerRef}
        className="absolute inset-0 pt-12 pb-2 overflow-hidden cursor-grab active:cursor-grabbing"
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onDoubleClick={onDblClick}
      >
        <div
          className="absolute top-1/2 left-1/2 will-change-transform"
          style={{
            transform: `translate(-50%, -50%) translate(${tx}px, ${ty}px) scale(${scale})`,
          }}
        >
          <img
            ref={imgRef}
            src={src}
            alt={alt}
            className="max-h-[80vh] md:max-h-[86vh] max-w-none select-none pointer-events-none object-contain"
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
}
