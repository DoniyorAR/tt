"use client";

import { useState } from "react";
import Link from "next/link";
import Menu from "./Menu";

export default function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* mobile strip */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between bg-white/80 backdrop-blur border-b border-slate-200 px-4 py-2">
        <button
          onClick={() => setOpen(true)}
          aria-label="Open navigation"
          className="rounded-lg border border-slate-300 px-3 py-1 text-slate-700"
        >
          Menu
        </button>
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="Logo" className="h-6 w-6 rounded-md" />
          <span className="text-sm font-semibold text-slate-800">Pyeongtaek</span>
        </Link>
      </div>

      {/* sidebar */}
      <aside
        className={[
          "fixed z-50 md:static md:z-auto inset-y-0 left-0 w-72",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          "transition-transform bg-white border-r border-slate-200",
        ].join(" ")}
      >
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between px-4 py-4 border-b border-slate-200">
            <Link href="/" className="flex items-center gap-3">
              <img src="/logo.png" alt="Logo" className="h-8 w-8 rounded-lg" />
              <div>
                <div className="text-base font-semibold tracking-tight text-slate-900">
                  Pyeongtaek Smart
                </div>
                <div className="text-xs text-slate-500 -mt-0.5">G3 / G7 Platform</div>
              </div>
            </Link>
            <button
              onClick={() => setOpen(false)}
              className="md:hidden rounded-lg border border-slate-300 px-3 py-1 text-slate-700"
              aria-label="Close navigation"
            >
              Close
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-3">
            <Menu onNavigate={() => setOpen(false)} />
          </div>

          <div className="p-4 border-t border-slate-200">
            <div className="rounded-xl bg-gradient-to-tr from-brand-600 to-brand-500 text-white p-4 shadow-card">
              <div className="text-xs uppercase tracking-wide text-brand-100/90">Status</div>
              <div className="text-sm mt-1">Systems: <span className="font-semibold">Operational</span></div>
              <div className="text-xs mt-1 text-brand-100/90">Last sync: 10 min ago</div>
            </div>
          </div>
        </div>
      </aside>

      {/* mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* space for mobile top strip */}
      <div className="h-10 md:hidden" />
    </>
  );
}
