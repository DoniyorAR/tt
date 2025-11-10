"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { label: "Overall",             href: "/overall" },
  { label: "WBS schedule",        href: "/wbs" },
  { label: "Server Configuration",href: "/server-config" },
  { label: "G3 tree measurement", href: "/g3" },
  { label: "G7 Project",          href: "/g7" },
  { label: "Data fusion",         href: "/fusion" },
  { label: "About Project",       href: "/about" },
];

export default function Menu({ onNavigate }: { onNavigate?: () => void } = {}) {
  const pathname = usePathname();

  return (
    <nav className="mt-4 space-y-1">
      {NAV.map(({ label, href }) => {
        const active = pathname === href || (href !== "/" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={[
              "block rounded-xl px-3 py-2 transition",
              active
                ? "bg-brand-600 text-white shadow-sm"
                : "text-slate-700 hover:bg-brand-50 hover:text-brand-700",
            ].join(" ")}
          >
            <div className="flex items-center gap-2">
              <span
                className={[
                  "h-2 w-2 rounded-full",
                  active ? "bg-accent-400" : "bg-slate-300",
                ].join(" ")}
              />
              <span className="text-sm font-medium">{label}</span>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
