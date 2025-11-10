import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";

const ROOT = path.join(process.cwd(), "public", "docx");
// whitelist to avoid path traversal
const ALLOWED = ["application", "fusion", "g3", "g7", "monthly_report"] as const;
type Allowed = typeof ALLOWED[number];

function isAllowed(x: string): x is Allowed {
  return (ALLOWED as readonly string[]).includes(x);
}

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const k = 1024, sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(i ? 1 : 0)} ${sizes[i]}`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const folderParam = searchParams.get("folder") || ""; // single
  const allParam = searchParams.getAll("all");           // if ?all=1 list all

  // If ?all: return { folder: { files... }, ... }
  if (allParam.length) {
    const out: Record<string, any[]> = {};
    for (const f of ALLOWED) {
      const dir = path.join(ROOT, f);
      let entries: any[] = [];
      try {
        const items = await fs.readdir(dir, { withFileTypes: true });
        for (const it of items) {
          if (!it.isFile()) continue;
          if (it.name.startsWith(".")) continue;
          const abs = path.join(dir, it.name);
          const st = await fs.stat(abs);
          const url = `/docx/${encodeURIComponent(f)}/${encodeURIComponent(it.name)}`;
          entries.push({
            name: it.name,
            url,
            size: st.size,
            sizeHuman: formatBytes(st.size),
            ext: path.extname(it.name).slice(1).toLowerCase(),
          });
        }
      } catch {
        // ignore missing folders
      }
      out[f] = entries.sort((a, b) => a.name.localeCompare(b.name));
    }
    return NextResponse.json(out, { status: 200 });
  }

  // Else: single folder listing
  const folder = folderParam.toLowerCase();
  if (!isAllowed(folder)) {
    return NextResponse.json(
      { error: "Invalid folder", allowed: ALLOWED },
      { status: 400 }
    );
  }
  const dir = path.join(ROOT, folder);
  try {
    const items = await fs.readdir(dir, { withFileTypes: true });
    const files = await Promise.all(
      items
        .filter((it) => it.isFile() && !it.name.startsWith("."))
        .map(async (it) => {
          const abs = path.join(dir, it.name);
          const st = await fs.stat(abs);
          const url = `/docx/${encodeURIComponent(folder)}/${encodeURIComponent(it.name)}`;
          return {
            name: it.name,
            url,
            size: st.size,
            sizeHuman: formatBytes(st.size),
            ext: path.extname(it.name).slice(1).toLowerCase(),
          };
        })
    );
    files.sort((a, b) => a.name.localeCompare(b.name));
    return NextResponse.json({ folder, files }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ folder, files: [], error: e?.message ?? "Read error" }, { status: 200 });
  }
}
