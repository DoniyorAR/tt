// app/server-config/page.tsx
"use client";

import { useMemo, useState } from "react";

// ---------- Data ----------
type Host = "Hostinger" | "Univ" | "Both";
type Row = {
  svc: string;
  host: Host;
  public: string;          // Public URL / Port
  runtime: string;         // Runtime / Unit
  workdir: string;         // Working Dir
  env: string;             // Key ENV
  data: string;            // Data / Volumes
  notes: string;           // Notes (collapsible)
};

const ROWS: Row[] = [
  {
    svc: "ZeroTier VPN",
    host: "Both",
    public: "—",
    runtime: "systemd: zerotier-one.service",
    workdir: "/var/lib/zerotier-one",
    env: "ZT_NETWORK_ID",
    data: "—",
    notes:
      "Mount university shares on Hostinger via SSHFS/NFS; restrict inbound by ZeroTier network.",
  },
  {
    svc: "Nginx Reverse Proxy",
    host: "Hostinger",
    public: ":80 → :443 (TLS)",
    runtime: "systemd: nginx.service",
    workdir: "/etc/nginx/sites-available/*",
    env: "SERVER_NAME=api.example.com",
    data: "Certs: /etc/letsencrypt/*",
    notes:
      "Routes traffic to Next.js, Node API, Flask. Enable Gzip/HTTP2.",
  },
  {
    svc: "Next.js Web App",
    host: "Hostinger",
    public: "https://app.example.com → 127.0.0.1:3000",
    runtime: "systemd: nextapp.service",
    workdir: "/srv/nextapp",
    env: "NODE_ENV=production, PUBLIC_API_URL=https://api.example.com",
    data: ".next/ built artifacts",
    notes:
      "Build: npm ci && npm run build; Run: npm run start. Behind Nginx.",
  },
  {
    svc: "Node.js Backend API",
    host: "Hostinger",
    public: "https://api.example.com → 127.0.0.1:4000",
    runtime: "systemd: api.service",
    workdir: "/srv/api",
    env: "DATABASE_URL, PORT=4000, JWT_SECRET, SWAGGER_JSON=./openapi.yaml",
    data: "Logs: /var/log/api/*.log",
    notes:
      "Swagger UI at /docs, spec at /docs-json. Add rate-limit & CORS.",
  },
  {
    svc: "PostgreSQL",
    host: "Hostinger",
    public: "localhost:5432 (private)",
    runtime: "systemd: postgresql",
    workdir: "/var/lib/postgresql/16/main",
    env: "POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD",
    data: "Daily dumps: /backups/pg/",
    notes:
      "Restrict to local/VPN; rotate WAL; nightly pg_dump.",
  },
  {
    svc: "Flask File Browser (internal)",
    host: "Hostinger",
    public: "https://files.gachon → 127.0.0.1:8000",
    runtime: "systemd: filebrowser.service",
    workdir: "/srv/filebrowser",
    env: "FB_ROOT=/mnt/gachon/share, FB_USER, FB_PASS, FB_SECRET, PORT=8000",
    data: "Mount: /mnt/gachon via SSHFS",
    notes:
      "Login-protected; read-only; dotfiles hidden. Served via Nginx.",
  },
  {
    svc: "SSHFS Mount (Univ→Hostinger)",
    host: "Hostinger",
    public: "—",
    runtime: "systemd mount: mnt-gachon.mount",
    workdir: "/mnt/gachon",
    env: "SSH_KEY=/root/.ssh/id_ed25519",
    data: "—",
    notes:
      "Example: sshfs user@10.x.x.x:/data /mnt/gachon -o IdentityFile=~/.ssh/id_ed25519",
  },
  {
    svc: "Android / Flutter",
    host: "Hostinger",
    public: "—",
    runtime: "—",
    workdir: "/mobile",
    env: "API_BASE_URL=https://api.example.com",
    data: "—",
    notes:
      "Use productFlavors for dev/stage/prod; pin minSDK/compileSDK.",
  },
  {
    svc: "Static assets / CDN",
    host: "Hostinger",
    public: "https://static.example.com",
    runtime: "nginx",
    workdir: "/srv/static",
    env: "—",
    data: "/srv/static/uploads",
    notes:
      "Configure long-cache, hashed filenames.",
  },
  {
    svc: "Monitoring & Logs",
    host: "Hostinger",
    public: "https://status.example.com",
    runtime: "kuma.service (if Kuma)",
    workdir: "/srv/monitoring",
    env: "SLACK_WEBHOOK",
    data: "—",
    notes:
      "At minimum, rotate Nginx/API logs. Configure alerts.",
  },
  {
    svc: "Backups",
    host: "Hostinger",
    public: "—",
    runtime: "cron",
    workdir: "/backups",
    env: "BACKUP_RETENTION_DAYS=14",
    data: "/backups/pg, /backups/files",
    notes:
      "Encrypt and copy to offsite bucket (weekly full, daily diff).",
  },
];

// Server overview cards
const SERVERS = [
  {
    title: "Training & Storage (University Dell Ubuntu)",
    chips: ["2× RTX 3090", "32 threads (Xeon Silver 4110)", "32 GB RAM", "16 TB main storage"],
    desc:
      "Primary training node for DL workloads and long-term dataset storage. Exposed only via ZeroTier; no public ingress.",
    color: "from-brand-600 to-brand-500",
  },
  {
    title: "Inference & API (Core i7 12th Gen)",
    chips: ["RTX 5080", "64 GB RAM"],
    desc:
      "Low-latency inference and all public-facing web/API services behind Nginx with TLS and rate-limits.",
    color: "from-emerald-500 to-brand-500",
  },
];

// ---------- UI ----------
const HOST_TABS: Array<{ key: Host | "All"; label: string }> = [
  { key: "All", label: "All" },
  { key: "Hostinger", label: "Hostinger" },
  { key: "Univ", label: "University" },
  { key: "Both", label: "Both" },
];

function HostBadge({ host }: { host: Host }) {
  const map: Record<Host, string> = {
    Hostinger: "bg-brand-50 text-brand-700 border-brand-200",
    Univ: "bg-slate-100 text-slate-700 border-slate-300",
    Both: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${map[host]}`}
    >
      {host}
    </span>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-slate-100 text-slate-700 px-2 py-0.5 text-[11px] mr-1">
      {children}
    </span>
  );
}

export default function ServerConfigPage() {
  const [tab, setTab] = useState<Host | "All">("All");
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const filtered = useMemo(() => {
    if (tab === "All") return ROWS;
    return ROWS.filter((r) => r.host === tab);
  }, [tab]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-slate-900">
            Server configuration
          </h1>
          <p className="text-sm text-slate-500">
            Topology, runtimes, and deployment details for training, inference, and services.
          </p>
        </div>
      </section>

      {/* Server cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {SERVERS.map((s, i) => (
          <div
            key={i}
            className="rounded-3xl border border-slate-200 bg-white shadow-card overflow-hidden"
          >
            <div className={`h-2 w-full bg-gradient-to-tr ${s.color}`} />
            <div className="p-5">
              <div className="text-base font-semibold text-slate-900">{s.title}</div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {s.chips.map((c) => (
                  <span
                    key={c}
                    className="rounded-full bg-slate-100 text-slate-700 px-2 py-0.5 text-[11px]"
                  >
                    {c}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-sm text-slate-600">{s.desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {HOST_TABS.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={[
                "rounded-xl px-3 py-1.5 text-sm transition border",
                active
                  ? "bg-brand-600 text-white border-brand-600 shadow-sm"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-brand-50 hover:text-brand-700",
              ].join(" ")}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Services table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 border-b">
                  Service / Component
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 border-b">
                  Host
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 border-b">
                  Public URL / Port
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 border-b">
                  Runtime / Unit
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 border-b">
                  Working Dir
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 border-b">
                  Key ENV
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 border-b">
                  Data / Volumes
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 border-b">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, idx) => {
                const open = expandedRow === idx;
                return (
                  <tr key={idx} className={idx % 2 ? "bg-white" : "bg-slate-50/30"}>
                    <td className="px-4 py-3 align-top border-b text-sm text-slate-900 font-medium">
                      {r.svc}
                    </td>
                    <td className="px-4 py-3 align-top border-b">
                      <HostBadge host={r.host} />
                    </td>
                    <td className="px-4 py-3 align-top border-b text-sm text-slate-700">
                      {r.public !== "—" ? (
                        <span className="rounded-lg bg-slate-100 px-2 py-0.5">{r.public}</span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top border-b">
                      <Pill>{r.runtime}</Pill>
                    </td>
                    <td className="px-4 py-3 align-top border-b text-sm">
                      <code className="rounded bg-slate-100 px-1 py-0.5">{r.workdir}</code>
                    </td>
                    <td className="px-4 py-3 align-top border-b text-sm">
                      {r.env.split(",").map((e) => (
                        <Pill key={e.trim()}>{e.trim()}</Pill>
                      ))}
                    </td>
                    <td className="px-4 py-3 align-top border-b text-sm">
                      {r.data !== "—" ? r.data : <span className="text-slate-400">—</span>}
                    </td>
                    <td className="px-3 py-3 align-top border-b text-sm">
                      <button
                        onClick={() => setExpandedRow(open ? null : idx)}
                        className="rounded-lg border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50"
                        aria-expanded={open}
                      >
                        {open ? "Hide" : "Show"}
                      </button>
                      {open && (
                        <div className="mt-2 text-slate-700">{r.notes}</div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 text-xs text-slate-500 border-t bg-slate-50">
          Tip: keep all public endpoints behind Nginx (TLS) and restrict admin services via ZeroTier.
        </div>
      </div>
    </div>
  );
}
