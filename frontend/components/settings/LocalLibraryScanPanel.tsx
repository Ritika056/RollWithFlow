"use client";

import { useState } from "react";
import { FolderSearch, LoaderCircle } from "lucide-react";

import { ActionButton } from "@/components/ui/ActionButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { scanLibraryFolder } from "@/lib/api";
import type { LibraryScanResult } from "@/types/api";

export function LocalLibraryScanPanel() {
  const [folderPath, setFolderPath] = useState("");
  const [result, setResult] = useState<LibraryScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function scan() {
    if (!folderPath.trim()) return setError("Enter a folder path that the backend can access.");
    setLoading(true);
    setError(null);
    const response = await scanLibraryFolder(folderPath.trim());
    setLoading(false);
    if (!response.data) return setError(response.error ?? "Scan failed.");
    setResult(response.data);
  }

  return (
    <GlassCard className="music-sheen p-5 md:p-6">
      <div className="flex items-start gap-3"><div className="grid size-11 shrink-0 place-items-center rounded-2xl border border-signal/25 bg-signal/10 text-signal"><FolderSearch size={20} /></div><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-signal">Local library</p><h2 className="mt-1 text-xl font-semibold text-white">Scan a music folder</h2><p className="mt-2 text-sm leading-6 text-white/58">The backend scans this path recursively. Your browser cannot scan your files directly.</p></div></div>
      <div className="mt-5 flex flex-col gap-3 md:flex-row"><input value={folderPath} onChange={(event) => setFolderPath(event.target.value)} placeholder="/Users/you/Music or C:\\Music" className="h-11 min-w-0 flex-1 rounded-2xl border border-white/10 bg-deck-950/58 px-4 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-signal/40" /><ActionButton variant="primary" onClick={scan} disabled={loading}>{loading ? <LoaderCircle size={16} className="animate-spin" /> : <FolderSearch size={16} />}{loading ? "Scanning" : "Scan folder"}</ActionButton></div>
      {error ? <p className="mt-4 rounded-xl border border-cue/30 bg-cue/10 px-3 py-2 text-sm text-cue">{error}</p> : null}
      {result ? <div className="mt-5 grid gap-3 sm:grid-cols-3"><ScanValue label="Audio files" value={result.scanned_count} /><ScanValue label="Added" value={result.created_count} tone="signal" /><ScanValue label="Skipped" value={result.skipped_count} />{result.errors.length ? <p className="sm:col-span-3 text-sm text-amberline">{result.errors.length} issue(s): {result.errors.join(" | ")}</p> : null}</div> : null}
    </GlassCard>
  );
}

function ScanValue({ label, value, tone = "neutral" }: { label: string; value: number; tone?: "signal" | "neutral" }) {
  return <div className="rounded-2xl border border-white/8 bg-white/5 p-3"><p className="text-xs uppercase tracking-[0.14em] text-white/46">{label}</p><p className={`mt-1 text-2xl font-semibold ${tone === "signal" ? "text-signal" : "text-white"}`}>{value}</p></div>;
}
