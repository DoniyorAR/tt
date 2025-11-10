// app/page.tsx
export const metadata = {
  title: "Pyeongtaek Smart Platform — Overview",
  description: "Entry point for G3/G7 projects, schedules, and infrastructure.",
};

type Card = { href: string; title: string; desc: string; kpi?: string };

const cards: Card[] = [
  { href: "/overall",       title: "Overall",              desc: "High-level status across initiatives.", kpi: "7 streams" },
  { href: "/wbs",           title: "WBS schedule",         desc: "Timeline, milestones, owners, progress.", kpi: "Q4 focus" },
  { href: "/server-config", title: "Server Configuration", desc: "GPU/CPU, storage, services, endpoints.", kpi: "2×3090" },
  { href: "/g3",            title: "G3 tree measurement",  desc: "LiDAR → DBH/height/health pipeline.",    kpi: "v1.3" },
  { href: "/g7",            title: "G7 Project",           desc: "Underground risk prediction & alerts.",  kpi: "beta" },
  { href: "/fusion",        title: "Data fusion",          desc: "CCTV + sensors + climate + LiDAR.",      kpi: "ETL v2" },
  { href: "/about",         title: "About Project",        desc: "Context, team, documentation.",          kpi: "Docs" },
];

export default function Page() {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 shadow-card">
        <div className="absolute inset-0 bg-gradient-to-tr from-brand-600 via-brand-500 to-brand-400" />
        <div className="relative z-10 p-6 md:p-10 text-white">
          <div className="flex items-center gap-4">
            <img src="/logo.png" alt="Logo" className="h-12 w-12 rounded-xl ring-2 ring-white/30" />
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
                Pyeongtaek Smart Platform
              </h1>
              <p className="mt-1 text-sm text-brand-100/90">
                G3/G7 initiatives · schedules · infrastructure · fusion
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 text-brand-50">
            <div className="rounded-xl bg-white/10 px-4 py-3">
              <div className="text-xs uppercase tracking-wider text-brand-100/90">Systems</div>
              <div className="text-lg font-semibold">Operational</div>
            </div>
            <div className="rounded-xl bg-white/10 px-4 py-3">
              <div className="text-xs uppercase tracking-wider text-brand-100/90">GPU</div>
              <div className="text-lg font-semibold">2×3090</div>
            </div>
            <div className="rounded-xl bg-white/10 px-4 py-3">
              <div className="text-xs uppercase tracking-wider text-brand-100/90">Pipelines</div>
              <div className="text-lg font-semibold">ETL v2</div>
            </div>
            <div className="rounded-xl bg-white/10 px-4 py-3">
              <div className="text-xs uppercase tracking-wider text-brand-100/90">Sync</div>
              <div className="text-lg font-semibold">10m ago</div>
            </div>
          </div>
        </div>
      </section>

      {/* Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {cards.map((c) => (
          <a
            key={c.href}
            href={c.href}
            className="group rounded-2xl border border-slate-200 bg-white p-5 hover:shadow-card transition"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">{c.title}</h2>
              {c.kpi ? (
                <span className="text-xs rounded-full bg-accent-100 text-accent-500 px-2 py-0.5">
                  {c.kpi}
                </span>
              ) : null}
            </div>
            <p className="mt-2 text-sm text-slate-600">{c.desc}</p>
            <div className="mt-4 h-1 w-full rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full w-1/3 bg-gradient-to-r from-brand-500 to-brand-400 group-hover:w-2/3 transition-all"></div>
            </div>
          </a>
        ))}
      </section>
    </div>
  );
}
