"use client";

import { useState } from "react";
import { Download, FileCheck, Upload } from "lucide-react";

import { ActionButton } from "@/components/ui/ActionButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { API_BASE_URL } from "@/lib/api";

type BackupReport = {
  valid: boolean;
  errors: string[];
  counts: Record<string, number>;
  would_create?: Record<string, number>;
  would_update?: Record<string, number>;
  would_skip?: Record<string, number>;
  notes?: string[];
};

function tokenHeader(): Record<string, string> {
  const token = document.cookie.split("; ").find((item) => item.startsWith("rwf_token="))?.split("=")[1];
  return token ? { Authorization: `Bearer ${decodeURIComponent(token)}` } : {};
}

export function BackupTools() {
  const [report, setReport] = useState<string | null>(null);
  const [busy, setBusy] = useState<"validate" | "dry-run" | null>(null);

  async function download(path: string, name: string) {
    const response = await fetch(`${API_BASE_URL}${path}`, { headers: tokenHeader() });
    if (!response.ok) return setReport("Export failed. Sign in again and retry.");
    const url = URL.createObjectURL(await response.blob());
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function inspect(file: File, mode: "validate" | "dry-run") {
    setBusy(mode);
    const form = new FormData();
    form.append("file", file);
    try {
      const response = await fetch(`${API_BASE_URL}/api/import/${mode === "validate" ? "validate-backup" : "dry-run-restore"}`, {
        method: "POST",
        headers: tokenHeader(),
        body: form,
      });
      const data = await response.json() as BackupReport;
      if (!response.ok || !data.valid) return setReport((data.errors ?? ["Backup validation failed"]).join(", "));
      const counts = Object.entries(data.counts).map(([key, value]) => `${key} ${value}`).join(", ");
      const creates = Object.entries(data.would_create ?? {}).map(([key, value]) => `${key} ${value}`).join(", ");
      setReport(mode === "dry-run" ? `Dry run: would create ${creates || "nothing"}. No data changed.` : `Backup valid: ${counts}`);
    } catch {
      setReport("Backup tool could not reach the local backend.");
    } finally {
      setBusy(null);
    }
  }

  return <GlassCard className="p-5">
    <p className="text-xs uppercase tracking-[.18em] text-signal">Local backup</p>
    <h2 className="mt-1 font-semibold text-white">Export and validate</h2>
    <div className="mt-4 flex flex-wrap gap-2">
      {[["/api/export/library.csv", "Library CSV"], ["/api/export/library.json", "Library JSON"], ["/api/export/playlists.json", "Playlists JSON"], ["/api/export/full-backup.json", "Full Backup JSON"]].map(([path, name]) => <ActionButton key={path} onClick={() => download(path, name.replaceAll(" ", "-").toLowerCase())}><Download size={15} />{name}</ActionButton>)}
    </div>
    <div className="mt-5 grid gap-2 sm:grid-cols-2">
      <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-white/15 p-3 text-sm text-white/62"><Upload size={16} /> Validate backup JSON<input type="file" accept="application/json" className="hidden" onChange={(event) => event.target.files?.[0] && inspect(event.target.files[0], "validate")} /></label>
      <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-amberline/25 p-3 text-sm text-white/62"><FileCheck size={16} /> {busy === "dry-run" ? "Checking backup..." : "Dry Run Restore"}<input type="file" accept="application/json" className="hidden" disabled={busy !== null} onChange={(event) => event.target.files?.[0] && inspect(event.target.files[0], "dry-run")} /></label>
    </div>
    {report ? <p className="mt-3 flex items-center gap-2 text-sm text-signal"><FileCheck size={15} />{report}</p> : null}
    <p className="mt-3 text-xs text-white/42">Dry run and validation are non-destructive. Restore is intentionally not enabled yet.</p>
  </GlassCard>;
}
