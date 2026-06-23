"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ExternalLink, Link2, Music2, Plus, Radio, RefreshCw, Save, Search, Trash2, Undo2 } from "lucide-react";

import { ActionButton } from "@/components/ui/ActionButton";
import { Badge } from "@/components/ui/Badge";
import { GlassCard } from "@/components/ui/GlassCard";
import { Modal } from "@/components/ui/Modal";
import { SearchInput } from "@/components/ui/SearchInput";
import { Toast } from "@/components/ui/Toast";
import { addSongToFolder, addSongToPlaylist, createDiscovery, createDiscoveryMonitor, deleteDiscoveryMonitor, disconnectSpotify, getProviderDiagnostics, getProviderStatus, getSpotifyConnectUrl, mockDailyFetch, rejectDiscovery, restoreDiscovery, runDiscoveryFetch, runLocalDailyFetch, saveDiscoveryToLibrary, searchSpotify, searchYouTube, updateDiscoveryMonitor } from "@/lib/api";
import type { DiscoveryFetchRun, DiscoveryItem, DiscoveryMonitor, Folder, Playlist, ProviderDiagnostics, ProviderSearchItem, ProviderStatus } from "@/types/api";

const tabs = ["manual_search", "trending", "latest", "history", "artist_monitoring", "genre_monitoring", "settings"];
type ProviderChoice = "mock" | "spotify" | "youtube";

export function DiscoveryManager({ items, monitors: initialMonitors, fetchRuns: initialFetchRuns, folders, playlists, providerStatus: initialProviderStatus }: { items: DiscoveryItem[]; monitors: DiscoveryMonitor[]; fetchRuns: DiscoveryFetchRun[]; folders: Folder[]; playlists: Playlist[]; providerStatus: ProviderStatus }) {
  const [list, setList] = useState(items);
  const [tab, setTab] = useState("history");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [provider, setProvider] = useState<ProviderChoice>("mock");
  const [providerQuery, setProviderQuery] = useState("");
  const [resultLimit, setResultLimit] = useState(50);
  const [providerResults, setProviderResults] = useState<ProviderSearchItem[]>([]);
  const [providerResultMessage, setProviderResultMessage] = useState<string | null>(null);
  const [providerBusy, setProviderBusy] = useState(false);
  const [savedResultKeys, setSavedResultKeys] = useState<string[]>([]);
  const [monitors, setMonitors] = useState(initialMonitors);
  const [fetchRuns, setFetchRuns] = useState(initialFetchRuns);
  const [monitorOpen, setMonitorOpen] = useState(false);
  const [providerStatus, setProviderStatus] = useState(initialProviderStatus);
  const [providerDiagnostics, setProviderDiagnostics] = useState<ProviderDiagnostics | null>(null);
  const [assignment, setAssignment] = useState<{ item: DiscoveryItem; kind: "folder" | "playlist" } | null>(null);
  const [assignmentId, setAssignmentId] = useState("");

  useEffect(() => {
    void Promise.all([getProviderStatus(), getProviderDiagnostics()]).then(([status, diagnostics]) => {
      if (status.data) setProviderStatus(status.data);
      if (diagnostics.data) setProviderDiagnostics(diagnostics.data);
    });
  }, []);

  const visible = useMemo(() => list.filter((item) => {
    const tabMatch = tab === "history" || tab === "settings" || item.discovery_type === tab;
    const searchMatch = [item.title, item.artist_name, item.platform].join(" ").toLowerCase().includes(search.toLowerCase());
    return tabMatch && searchMatch;
  }), [list, tab, search]);

  const flash = (message: string) => { setToast(message); setTimeout(() => setToast(null), 2600); };
  const getError = (error: string | null) => error ? error.replace(/^\{\"detail\":\"?/, "").replace(/\"?\}$/, "") : "Request failed";

  async function save(formData: FormData) {
    const result = await createDiscovery(Object.fromEntries(formData.entries()));
    if (result.data) {
      setList((current) => [result.data!, ...current]);
      setOpen(false);
      flash("Discovery item created");
    } else flash(getError(result.error));
  }

  async function runMockFetch() {
    const result = await mockDailyFetch();
    if (result.data) {
      setList((current) => [...result.data!, ...current.filter((item) => !result.data!.some((fresh) => fresh.id === item.id))]);
      flash("Mock daily fetch complete");
    } else flash(getError(result.error));
  }

  async function connectSpotify() {
    const result = await getSpotifyConnectUrl();
    if (result.data) window.location.assign(result.data.authorization_url);
    else flash(getError(result.error));
  }

  async function disconnectSpotifyAccount() {
    const result = await disconnectSpotify();
    if (!result.data) return flash(getError(result.error));
    const refreshed = await getProviderStatus();
    if (refreshed.data) {
      setProviderStatus(refreshed.data);
    } else {
      setProviderStatus((current) => ({
        ...current,
        spotify: { ...current.spotify, connected: false },
      }));
    }
    flash("Spotify disconnected from RollWithFlow");
  }

  async function searchProvider() {
    const query = providerQuery.trim();
    if (!query) return flash("Enter a search first");
    setProviderBusy(true);
    if (provider === "mock") {
      setProviderResults(list.filter((item) => [item.title, item.artist_name, item.platform].join(" ").toLowerCase().includes(query.toLowerCase())).map(toProviderItem));
      setProviderBusy(false);
      return;
    }
    const result = provider === "spotify" ? await searchSpotify(query, resultLimit) : await searchYouTube(query, resultLimit);
    setProviderBusy(false);
    if (result.data) { setProviderResults(result.data.results); setProviderResultMessage(`Provider returned ${result.data.returned_count} results out of requested ${result.data.requested_count}.`); }
    else flash(getError(result.error));
  }

  async function testProvider(choice: Exclude<ProviderChoice, "mock">) {
    setProviderBusy(true);
    const result = choice === "spotify" ? await searchSpotify("electronic music", resultLimit) : await searchYouTube("electronic music", resultLimit);
    setProviderBusy(false);
    if (result.data) {
      setProvider(choice);
      setProviderQuery("electronic music");
      setProviderResults(result.data.results);
      setProviderResultMessage(`Provider returned ${result.data.returned_count} results out of requested ${result.data.requested_count}.`);
      flash(`${choice === "spotify" ? "Spotify" : "YouTube"} test returned ${result.data.results.length} result(s)`);
    } else flash(getError(result.error));
  }

  async function saveSearchResult(item: ProviderSearchItem) {
    const result = await createDiscovery(item);
    if (result.data) {
      setList((current) => [result.data!, ...current]);
      setSavedResultKeys((current) => [...current, resultKey(item)]);
      flash("Saved to discovery history");
    } else flash(getError(result.error));
  }

  async function saveItem(item: DiscoveryItem) {
    const result = await saveDiscoveryToLibrary(item.id);
    if (result.data) {
      setList((current) => current.map((entry) => entry.id === item.id ? { ...entry, is_saved: true } : entry));
      flash("Saved to library");
    } else flash(getError(result.error));
  }

  async function assignDiscovery() {
    if (!assignment || !assignmentId) return flash("Choose a destination first");
    const saved = await saveDiscoveryToLibrary(assignment.item.id);
    if (!saved.data) return flash(getError(saved.error));
    const result = assignment.kind === "folder"
      ? await addSongToFolder(Number(assignmentId), saved.data.id)
      : await addSongToPlaylist(Number(assignmentId), saved.data.id);
    if (!result.data) return flash(getError(result.error));
    setList((current) => current.map((entry) => entry.id === assignment.item.id ? { ...entry, is_saved: true } : entry));
    setAssignment(null);
    setAssignmentId("");
    flash(`Added ${saved.data.title} to ${assignment.kind}`);
  }

  async function reject(item: DiscoveryItem) {
    const result = await rejectDiscovery(item.id);
    if (result.data) setList((current) => current.map((entry) => entry.id === item.id ? { ...entry, is_rejected: true } : entry));
    else flash(getError(result.error));
  }

  async function restore(item: DiscoveryItem) {
    const result = await restoreDiscovery(item.id);
    if (result.data) setList((current) => current.map((entry) => entry.id === item.id ? result.data! : entry));
    else flash(getError(result.error));
  }

  async function createMonitor(formData: FormData) {
    const result = await createDiscoveryMonitor(Object.fromEntries(formData.entries()));
    if (result.data) { setMonitors((current) => [result.data!, ...current]); setMonitorOpen(false); flash("Monitor added"); }
    else flash(getError(result.error));
  }

  async function toggleMonitor(monitor: DiscoveryMonitor) {
    const result = await updateDiscoveryMonitor(monitor.id, { is_active: !monitor.is_active });
    if (result.data) setMonitors((current) => current.map((entry) => entry.id === monitor.id ? result.data! : entry));
    else flash(getError(result.error));
  }

  async function removeMonitor(id: number) {
    const result = await deleteDiscoveryMonitor(id);
    if (result.data) { setMonitors((current) => current.filter((monitor) => monitor.id !== id)); flash("Monitor removed"); }
    else flash(getError(result.error));
  }

  async function runFetch(localDaily: boolean) {
    const result = localDaily ? await runLocalDailyFetch() : await runDiscoveryFetch();
    if (result.data) { setFetchRuns((current) => [...result.data!, ...current].slice(0, 20)); flash("Local discovery fetch finished"); }
    else flash(getError(result.error));
  }

  return (
    <div className="space-y-5">
      <GlassCard className="galaxy-surface glow-card p-5 md:p-7">
        <Image src="/images/discovery-galaxy.png" alt="Abstract neon music galaxy" fill priority sizes="(max-width: 768px) 100vw, 75vw" className="object-cover opacity-90 mix-blend-screen" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,6,20,0.9),rgba(5,6,20,0.24)_54%,rgba(5,6,20,0.56)),linear-gradient(0deg,rgba(5,6,20,0.35),transparent_45%)]" />
        <div className="relative z-10 flex items-start justify-between gap-4">
          <div><p className="text-xs font-semibold uppercase tracking-[0.22em] text-signal">Musical galaxy</p><h2 className="mt-2 text-2xl font-semibold text-white">Explore your sound universe</h2><p className="mt-2 max-w-md text-sm leading-6 text-white/60">Search provider metadata, keep discovery history, and save only the tracks you want in your library.</p></div>
          <Badge tone="cue">{list.length} signals</Badge>
        </div>
        <span className="galaxy-node left-[23%] top-[38%] text-cue" data-label="Techno" /><span className="galaxy-node left-[54%] top-[44%] text-violet" data-label="House" /><span className="galaxy-node bottom-[24%] left-[40%] text-signal" data-label="Afro" /><span className="galaxy-node bottom-[20%] right-[18%] text-amberline" data-label="Remix" />
        <div className="absolute bottom-5 right-5 rounded-2xl border border-white/12 bg-deck-950/66 px-4 py-3 text-xs text-white/58 backdrop-blur-xl"><span className="text-signal">Live map</span> foundation</div>
      </GlassCard>

      <div className="grid gap-4 xl:grid-cols-[1.05fr_1.45fr]">
        <GlassCard className="p-5">
          <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/42">Provider status</p><h3 className="mt-1 text-lg font-semibold">Connections</h3></div><Link2 size={18} className="text-signal" /></div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <ProviderRow name="Spotify" configured={providerStatus.spotify.configured} connected={providerStatus.spotify.connected} busy={providerBusy} action={providerStatus.spotify.connected ? () => testProvider("spotify") : connectSpotify} actionLabel={providerStatus.spotify.connected ? "Test Spotify Search" : "Connect Spotify"} secondaryAction={providerStatus.spotify.connected ? disconnectSpotifyAccount : undefined} secondaryLabel="Disconnect Spotify" />
            <ProviderRow name="YouTube" configured={providerStatus.youtube.configured} connected={false} busy={providerBusy} action={providerStatus.youtube.configured ? () => testProvider("youtube") : undefined} actionLabel="Test YouTube Search" statusLabel={providerStatus.youtube.configured ? "API configured" : undefined} />
          </div>
          {providerDiagnostics?.spotify_redirect_uri ? <p className="mt-4 text-xs text-white/42">Spotify redirect: {providerDiagnostics.spotify_redirect_uri}</p> : null}
        </GlassCard>
        <GlassCard className="music-sheen p-5">
          <div className="flex items-center gap-2"><Search size={17} className="text-signal" /><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/42">Provider search</p><h3 className="mt-1 text-lg font-semibold">Find new signals</h3></div></div>
          <div className="mt-5 flex flex-col gap-3 md:flex-row">
            <select value={provider} onChange={(event) => setProvider(event.target.value as ProviderChoice)} className="h-11 rounded-2xl border border-white/10 bg-deck-950/65 px-3 text-sm text-white outline-none"><option value="mock">Mock</option><option value="spotify" disabled={!providerStatus.spotify.configured}>Spotify</option><option value="youtube" disabled={!providerStatus.youtube.configured}>YouTube</option></select>
            <input value={providerQuery} onChange={(event) => setProviderQuery(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") searchProvider(); }} placeholder={`Search ${provider === "mock" ? "existing signals" : provider}`} className="h-11 min-w-0 flex-1 rounded-2xl border border-white/10 bg-deck-950/65 px-4 text-sm text-white outline-none focus:border-signal/40" />
            <select value={resultLimit} onChange={(event) => setResultLimit(Number(event.target.value))} className="h-11 rounded-2xl border border-white/10 bg-deck-950/65 px-3 text-sm text-white outline-none"><option value={25}>25</option><option value={50}>50</option><option value={100}>100</option></select>
            <ActionButton variant="primary" onClick={searchProvider} disabled={providerBusy}>{providerBusy ? "Searching" : "Search"}</ActionButton>
          </div>
          <p className="mt-3 text-xs leading-5 text-white/45">Spotify and YouTube searches return metadata and source links only. No audio is downloaded or stored.</p>
        </GlassCard>
      </div>

      {providerResults.length ? <GlassCard className="p-5"><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/42">Search results</p><h3 className="mt-1 text-lg font-semibold">{provider} results</h3>{providerResultMessage ? <p className="mt-1 text-xs text-white/48">{providerResultMessage}</p> : null}</div><Badge tone="signal">{providerResults.length} found</Badge></div><div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{providerResults.map((item) => <ProviderResultCard key={resultKey(item)} item={item} saved={savedResultKeys.includes(resultKey(item))} onSave={() => saveSearchResult(item)} />)}</div></GlassCard> : null}

      <div className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
        <GlassCard className="p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/42">Local monitoring</p><h3 className="mt-1 text-lg font-semibold">Discovery monitors</h3></div><div className="flex flex-wrap gap-2"><ActionButton onClick={() => runFetch(false)}><RefreshCw size={15} /> Run monitors</ActionButton><ActionButton variant="primary" onClick={() => runFetch(true)}><Radio size={15} /> Run Local Daily Fetch</ActionButton><ActionButton onClick={() => setMonitorOpen(true)}><Plus size={15} /> Add monitor</ActionButton></div></div><div className="mt-4 space-y-2">{monitors.length ? monitors.map((monitor) => <div key={monitor.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-3"><div><p className="font-medium text-white">{monitor.name}</p><p className="mt-1 text-xs text-white/48">{monitor.provider} · {monitor.monitor_type} · {monitor.query || monitor.artist_name || monitor.genre || "default signal"}</p></div><div className="flex items-center gap-2"><Badge tone={monitor.is_active ? "signal" : "neutral"}>{monitor.is_active ? "Active" : "Paused"}</Badge><ActionButton onClick={() => toggleMonitor(monitor)}>{monitor.is_active ? "Pause" : "Resume"}</ActionButton><ActionButton variant="danger" onClick={() => removeMonitor(monitor.id)}><Trash2 size={14} /></ActionButton></div></div>) : <p className="rounded-2xl border border-dashed border-white/12 p-4 text-sm text-white/50">Add a local query, genre, artist, trending, or latest monitor to automate discovery.</p>}</div></GlassCard>
        <GlassCard className="p-5"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/42">Fetch history</p><h3 className="mt-1 text-lg font-semibold">Recent local runs</h3><div className="mt-4 space-y-2">{fetchRuns.length ? fetchRuns.slice(0, 6).map((run) => <div key={run.id} className="rounded-2xl border border-white/10 bg-white/[0.035] p-3"><div className="flex items-center justify-between gap-2"><span className="font-medium text-white">{run.provider}</span><Badge tone={run.status === "success" ? "signal" : run.status === "skipped" ? "amber" : "cue"}>{run.status}</Badge></div><p className="mt-1 text-xs text-white/48">{(run.metadata_json?.requested_count as number | undefined) ?? run.items_found} requested · {run.items_found} fetched · {run.items_saved} saved · {(run.metadata_json?.duplicate_count as number | undefined) ?? 0} duplicates</p>{run.error_message ? <p className="mt-2 text-xs leading-5 text-cue">{run.error_message}</p> : null}</div>) : <p className="rounded-2xl border border-dashed border-white/12 p-4 text-sm text-white/50">No local fetch runs yet.</p>}</div></GlassCard>
      </div>

      <GlassCard className="music-sheen p-4"><div className="flex flex-col gap-3 xl:flex-row xl:items-center"><SearchInput value={search} onChange={setSearch} placeholder="Search discovery history" /><div className="flex flex-wrap gap-2"><ActionButton variant="primary" onClick={() => setOpen(true)}><Plus size={16} /> Manual Item</ActionButton><ActionButton onClick={runMockFetch}><RefreshCw size={16} /> Mock Daily Fetch</ActionButton></div></div><div className="mt-4 flex flex-wrap gap-2">{tabs.map((item) => <button key={item} onClick={() => setTab(item)} className={`rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] transition ${tab === item ? "border-signal/30 bg-signal/12 text-signal" : "border-white/10 bg-white/7 text-white/52 hover:text-white"}`}>{item.replaceAll("_", " ")}</button>)}</div></GlassCard>

      {tab === "settings" ? <GlassCard className="p-5 text-sm leading-6 text-white/65">Real Spotify and YouTube daily fetch scheduling is planned for Phase 6B. The current mock daily fetch remains available and provider secrets stay server-side.</GlassCard> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{visible.map((item) => <GlassCard key={item.id} className="glow-card music-sheen p-5"><div className="flex items-start justify-between gap-3"><Radio className="text-signal" /><Badge>{item.platform}</Badge></div><h3 className="mt-4 text-lg font-semibold text-white">{item.title}</h3><p className="mt-2 text-sm text-white/58">{item.artist_name ?? "Unknown artist"}</p><div className="mt-4 flex flex-wrap gap-2"><Badge>{item.discovery_type}</Badge>{item.is_saved ? <Badge tone="signal">Saved</Badge> : null}{item.is_rejected ? <Badge tone="cue">Rejected</Badge> : null}</div><div className="mt-5 flex flex-wrap gap-2"><ActionButton disabled={item.is_saved} onClick={() => saveItem(item)}><Save size={15} /> Save to Library</ActionButton><ActionButton onClick={() => setAssignment({ item, kind: "folder" })}><Plus size={15} /> Folder</ActionButton><ActionButton onClick={() => setAssignment({ item, kind: "playlist" })}><Plus size={15} /> Playlist</ActionButton>{item.source_url ? <ActionButton onClick={() => window.open(item.source_url!, "_blank", "noopener,noreferrer")}><ExternalLink size={15} /> Source</ActionButton> : null}{item.is_rejected ? <ActionButton onClick={() => restore(item)}><Undo2 size={15} /> Restore</ActionButton> : <ActionButton variant="danger" onClick={() => reject(item)}><Trash2 size={15} /> Reject</ActionButton>}</div></GlassCard>)}</div>
      <Modal open={open} title="Create Discovery Item" onClose={() => setOpen(false)}><form action={save} className="grid gap-4"><Field name="title" label="Title" /><Field name="artist_name" label="Artist" /><Field name="platform" label="Platform" defaultValue="manual" /><Field name="source_url" label="Source URL" /><Field name="discovery_type" label="Discovery type" defaultValue="manual_search" /><Field name="popularity_score" label="Popularity" type="number" /><div className="flex justify-end"><ActionButton type="submit" variant="primary">Save</ActionButton></div></form></Modal>
      <Modal open={monitorOpen} title="Add Local Discovery Monitor" onClose={() => setMonitorOpen(false)}><form action={createMonitor} className="grid gap-4"><Field name="name" label="Monitor name" placeholder="Afro house pulse" required /><SelectField name="provider" label="Provider" values={["mock", "spotify", "youtube"]} /><SelectField name="monitor_type" label="Monitor type" values={["query", "genre", "artist", "trending", "latest", "famous", "old_classics", "hindi", "punjabi", "bollywood", "edm", "house", "techno", "hip_hop"]} /><Field name="query" label="Query" placeholder="Afro house 2026" /><Field name="genre" label="Genre" placeholder="Afro House" /><Field name="artist_name" label="Artist" placeholder="Artist name" /><div className="flex justify-end"><ActionButton type="submit" variant="primary">Add monitor</ActionButton></div></form></Modal>
      <Modal open={Boolean(assignment)} title={assignment?.kind === "folder" ? "Add discovery song to folder" : "Add discovery song to playlist"} onClose={() => setAssignment(null)}><div className="space-y-4"><p className="text-sm text-white/60">{assignment?.item.title} will be saved to your library first if needed.</p><select value={assignmentId} onChange={(event) => setAssignmentId(event.target.value)} className="h-11 w-full rounded-xl border border-white/10 bg-deck-950 px-3 text-white"><option value="">Choose {assignment?.kind}</option>{(assignment?.kind === "folder" ? folders : playlists).map((collection) => <option key={collection.id} value={collection.id}>{collection.name}</option>)}</select><div className="flex justify-end"><ActionButton variant="primary" onClick={assignDiscovery}>Add</ActionButton></div></div></Modal>
      <Toast message={toast} />
    </div>
  );
}

function ProviderRow({ name, configured, connected, busy, action, actionLabel, secondaryAction, secondaryLabel, statusLabel }: { name: string; configured: boolean; connected: boolean; busy: boolean; action?: () => void; actionLabel?: string; secondaryAction?: () => void; secondaryLabel?: string; statusLabel?: string }) {
  return <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3"><div className="flex items-center justify-between gap-2"><span className="font-medium text-white">{name}</span><Badge tone={connected ? "signal" : configured ? "amber" : "neutral"}>{statusLabel ?? (connected ? "Connected" : configured ? "Configured" : "Not configured")}</Badge></div>{action ? <ActionButton className="mt-3 w-full" onClick={action} disabled={!configured || busy}><Music2 size={15} /> {actionLabel}</ActionButton> : null}{secondaryAction ? <ActionButton className="mt-2 w-full" variant="danger" onClick={secondaryAction} disabled={busy}>{secondaryLabel}</ActionButton> : null}</div>;
}

function ProviderResultCard({ item, saved, onSave }: { item: ProviderSearchItem; saved: boolean; onSave: () => void }) {
  return <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4"><div className="flex items-start gap-3">{item.thumbnail_url ? <Image src={item.thumbnail_url} alt="" width={44} height={44} unoptimized className="size-11 rounded-xl object-cover" /> : <div className="grid size-11 place-items-center rounded-xl bg-signal/10 text-signal"><Music2 size={18} /></div>}<div className="min-w-0"><p className="truncate font-semibold text-white">{item.title}</p><p className="mt-1 truncate text-xs text-white/55">{item.artist_name ?? "Unknown artist"}</p></div></div><div className="mt-4 flex flex-wrap gap-2"><Badge>{item.platform}</Badge>{item.popularity_score !== null && item.popularity_score !== undefined ? <Badge tone="amber">{Math.round(item.popularity_score)}</Badge> : null}</div><div className="mt-4 flex flex-wrap gap-2"><ActionButton onClick={onSave} disabled={saved}><Save size={15} /> {saved ? "Saved" : "Save to Discovery"}</ActionButton>{item.source_url ? <ActionButton onClick={() => window.open(item.source_url!, "_blank", "noopener,noreferrer")}><ExternalLink size={15} /> Source</ActionButton> : null}</div></div>;
}

function toProviderItem(item: DiscoveryItem): ProviderSearchItem { return { title: item.title, artist_name: item.artist_name, platform: item.platform, source_url: item.source_url, thumbnail_url: item.thumbnail_url, discovery_type: item.discovery_type, popularity_score: item.popularity_score, metadata_json: item.metadata_json }; }
function resultKey(item: ProviderSearchItem): string { return `${item.platform}:${item.source_url ?? item.title}:${item.artist_name ?? ""}`; }
function Field(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) { const { label, ...rest } = props; return <label className="space-y-2 text-sm text-white/62"><span>{label}</span><input {...rest} className="h-11 w-full rounded-2xl border border-white/10 bg-white/8 px-3 text-white outline-none" /></label>; }
function SelectField({ name, label, values }: { name: string; label: string; values: string[] }) { return <label className="space-y-2 text-sm text-white/62"><span>{label}</span><select name={name} className="h-11 w-full rounded-2xl border border-white/10 bg-deck-950 px-3 text-white outline-none">{values.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>; }
