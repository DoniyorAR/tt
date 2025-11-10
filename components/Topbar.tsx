"use client";

import Link from "next/link";

export default function Topbar() {
  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-200">
      <div className="flex items-center justify-between container-p h-14">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-accent-500 shadow-[0_0_12px_rgba(16,185,129,0.7)]" />
          <span className="text-sm text-slate-700">
            Pyeongtaek Smart Platform
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/about" className="text-sm text-slate-600 hover:text-brand-700 hover:underline">
            About
          </Link>
          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-brand-600 to-brand-500" />
        </div>
      </div>
    </header>
  );
}
