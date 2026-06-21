"use client";

import { useState } from "react";
import { FileWarning, LoaderCircle, Wrench } from "lucide-react";

import { ActionButton } from "@/components/ui/ActionButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { checkLocalFiles, repairLocalPath } from "@/lib/api";
import type { LocalFileHealthResult } from "@/types/api";

export function LocalFileHealthPanel() {
  const [result, setResult] = useState<LocalFileHealthResult | null>(null);
  const [paths, setPaths] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [repairing, setRepairing] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function checkFiles() {
    setLoading(true); setMessage(null);
    const response = await checkLocalFiles();
    setLoading(false);
    if (!response.data) return setMessage(response.error ?? "File check failed.");
    setResult(response.data);
  }

  async function repair(songId: number) {
    const path = paths[songId]?.trim();
    if (!path) return setMessage("Enter the new local file path first.");
    setRepairing(songId); setMessage(null);
    const response = await repairLocalPath(songId, path);
    setRepairing(null);
    if (!response.data) return setMessage(response.error ?? "Path repair failed.");
    setMessage(`Repaired ${response.data.title}.`);
    await checkFiles();
  }

  return (
    <GlassCard className="p-5 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div className="flex gap-3"><div className="grid size-11 shrink-0 place-items-center rounded-2xl border border-amberline/25 bg-amberline/10 text-amberline"><FileWarning size={20} /></div><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-amberline">Local file health</p><h2 className="mt-1 text-xl font-semibold text-white">Check moved or missing tracks</h2><p className="mt-2 text-sm leading-6 text-white/58">Checks local file links without changing or removing any songs.</p></div></div><ActionButton onClick={checkFiles} disabled={loading}>{loading ? <LoaderCircle size={16} className="animate-spin" /> : <FileWarning size={16} />}{loading ? "Checking" : "Check local files"}</ActionButton></div>
      {message ? <p className="mt-4 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/72">{message}</p> : null}
      {result ? <><div className="mt-5 grid gap-3 sm:grid-cols-3"><HealthValue label="Checked" value={result.checked_count} /><HealthValue label="Available" value={result.ok_count} tone="signal" /><HealthValue label="Needs repair" value={result.missing_count} tone="amber" /></div>{result.missing_songs.length ? <div className="mt-5 space-y-3">{result.missing_songs.map((song) => <div key={song.id} className="rounded-2xl border border-amberline/20 bg-amberline/5 p-3"><div className="flex flex-wrap items-center justify-between gap-2"><div><p className="font-medium text-white">{song.title}</p><p className="text-xs text-white/52">{song.artist_name ?? "Unknown artist"} · {song.status}</p></div><span className="text-xs text-white/38">{song.source_name ?? "Local source"}</span></div><div className="mt-3 flex flex-col gap-2 sm:flex-row"><input value={paths[song.id] ?? ""} onChange={(event) => setPaths((current) => ({ ...current, [song.id]: event.target.value }))} placeholder="New file path" className="h-10 min-w-0 flex-1 rounded-xl border border-white/10 bg-deck-950/58 px-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-signal/40" /><ActionButton onClick={() => repair(song.id)} disabled={repairing === song.id}>{repairing === song.id ? <LoaderCircle size={15} className="animate-spin" /> : <Wrench size={15} />}{repairing === song.id ? "Repairing" : "Repair path"}</ActionButton></div></div>)}</div> : <p className="mt-5 text-sm text-signal">All checked local files are available.</p>}</> : null}
    </GlassCard>
  );
}

function HealthValue({ label, value, tone = "neutral" }: { label: string; value: number; tone?: "neutral" | "signal" | "amber" }) {
  const color = tone === "signal" ? "text-signal" : tone === "amber" ? "text-amberline" : "text-white";
  return <div className="rounded-2xl border border-white/8 bg-white/5 p-3"><p className="text-xs uppercase tracking-[0.14em] text-white/46">{label}</p><p className={`mt-1 text-2xl font-semibold ${color}`}>{value}</p></div>;
}
