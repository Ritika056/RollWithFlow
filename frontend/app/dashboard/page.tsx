import Link from "next/link";
import { AlertTriangle, ArrowUpRight, Boxes, Compass, Folder, Heart, Library, ListMusic, Music2, Plus, Sparkles, Tags, Waves } from "lucide-react";

import { StatCard } from "@/components/dashboard/StatCard";
import { ActionButton } from "@/components/ui/ActionButton";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { GlassCard } from "@/components/ui/GlassCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { getDashboardSummary } from "@/lib/server-api";

const fallbackSummary = {
  total_songs: 0,
  local_songs: 0,
  liked_songs: 0,
  discovered_songs: 0,
  folders: 0,
  playlists: 0,
  crates: 0,
  mixes: 0,
  discovery_items: 0,
  rejected_songs: 0,
  missing_bpm: 0,
  missing_key: 0,
  missing_genre: 0,
  unfiled_songs: 0,
  recently_added: [],
};

export default async function DashboardPage() {
  const { data, error } = await getDashboardSummary();
  const summary = data ?? fallbackSummary;

  const cards = [
    ["Total Songs", summary.total_songs, <Library key="i" size={18} />, "signal", "/library"],
    ["Local Songs", summary.local_songs, <Music2 key="i" size={18} />, "neutral", "/library"],
    ["Liked Songs", summary.liked_songs, <Heart key="i" size={18} />, "cue", "/liked-songs"],
    ["Folders", summary.folders, <Folder key="i" size={18} />, "signal", "/folders"],
    ["Playlists", summary.playlists, <ListMusic key="i" size={18} />, "amber", "/playlists"],
    ["DJ Crates", summary.crates, <Boxes key="i" size={18} />, "cue", "/crates"],
    ["Discovery Items", summary.discovery_items, <Compass key="i" size={18} />, "signal", "/discovery"],
    ["Unfiled Songs", summary.unfiled_songs, <Tags key="i" size={18} />, "amber", "/library"],
  ] as const;

  return (
    <section className="space-y-7">
      <GlassCard className="music-sheen overflow-hidden rounded-[2rem] p-6 md:p-8">
        <div className="relative">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <PageHeader
            eyebrow="DJ operating system"
            title="Your music workflow, tuned for prep"
            description="Phase 2 turns the shell into a working library: create songs, clean metadata, like tracks, assign folders, and keep active lists clear."
          />
          <div className="flex flex-wrap gap-2">
            <Link href="/library"><ActionButton variant="primary"><Plus size={17} /> Add Song</ActionButton></Link>
            <Link href="/folders"><ActionButton><Folder size={17} /> Manage Folders</ActionButton></Link>
          </div>
        </div>
        </div>
      </GlassCard>

      {error ? <EmptyState title="Backend connection needed" description={error} /> : null}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">
        {cards.map(([label, value, icon, tone, href]) => (
          <Link key={label} href={href}>
            <StatCard label={label} value={value} icon={icon} tone={tone} detail="Open view" compact />
          </Link>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_1.25fr_0.9fr]">
        <GlassCard className="p-5">
          <div className="flex items-center justify-between"><div><p className="text-xs uppercase tracking-[0.2em] text-signal">Library health</p><h3 className="mt-1 text-xl font-semibold text-white">DJ readiness</h3></div><Badge tone="signal">Active</Badge></div>
          <div className="mt-6 flex items-center gap-5"><div className="grid size-28 place-items-center rounded-full border-[9px] border-signal border-t-violet border-r-cue text-center shadow-[0_0_30px_rgba(88,240,209,0.14)]"><strong className="text-2xl text-white">{Math.max(0, 100 - summary.missing_bpm - summary.missing_key)}%</strong><span className="text-[10px] uppercase tracking-[0.12em] text-white/46">ready</span></div><div className="space-y-2 text-sm text-white/60"><p>Missing BPM <span className="float-right ml-5 text-amberline">{summary.missing_bpm}</span></p><p>Missing Key <span className="float-right ml-5 text-amberline">{summary.missing_key}</span></p><p>Unfiled <span className="float-right ml-5 text-cue">{summary.unfiled_songs}</span></p></div></div>
        </GlassCard>
        <GlassCard className="dashboard-grid music-sheen p-5">
          <div className="flex items-start justify-between"><div><p className="text-xs uppercase tracking-[0.2em] text-violet">New additions</p><h3 className="mt-1 text-xl font-semibold text-white">{summary.recently_added.length} fresh signals</h3><p className="mt-1 text-sm text-white/52">This workspace view</p></div><Waves size={20} className="text-signal" /></div>
          <div className="mt-7 flex h-20 items-center gap-1 overflow-hidden"><div className="wave-line h-7 flex-1 rounded-full opacity-50" />{[18, 36, 52, 30, 74, 42, 88, 56, 92, 44, 68, 36, 76, 28, 62, 46].map((height, index) => <span key={index} className="w-1.5 shrink-0 rounded-full bg-[linear-gradient(180deg,#f06aa6,#9b7cff,#58f0d1)] shadow-[0_0_8px_rgba(88,240,209,0.4)]" style={{ height }} />)}<div className="wave-line h-7 flex-1 rounded-full opacity-50" /></div>
        </GlassCard>
        <GlassCard className="p-5"><p className="text-xs uppercase tracking-[0.2em] text-cue">Top genres</p><div className="mt-5 flex items-center gap-4"><div className="size-24 rounded-full border-[11px] border-cue border-l-signal border-b-amberline border-r-violet shadow-[0_0_28px_rgba(240,106,166,0.12)]" /><div className="space-y-2 text-sm text-white/62"><p><span className="mr-2 text-cue">●</span>House</p><p><span className="mr-2 text-signal">●</span>Electronic</p><p><span className="mr-2 text-amberline">●</span>Hip Hop</p><p><span className="mr-2 text-violet">●</span>Other</p></div></div></GlassCard>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <GlassCard className="rounded-[1.75rem] p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-signal">Freshly added</p>
              <h3 className="mt-1 text-xl font-semibold text-white">Recently Added Songs</h3>
            </div>
            <Sparkles className="text-signal" size={20} />
          </div>
          <div className="space-y-3">
            {summary.recently_added.map((song) => (
              <Link key={song.id} href="/library" className="flex items-center justify-between gap-4 rounded-2xl border border-white/8 bg-white/6 p-4 transition duration-200 hover:-translate-y-0.5 hover:border-signal/22 hover:bg-white/9">
                <div>
                  <p className="font-semibold text-white">{song.title}</p>
                  <p className="mt-1 text-sm text-white/52">{song.artist ?? "Unknown artist"} - {song.genre ?? "Missing genre"}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Badge>{song.source_type ?? "manual"}</Badge>
                    {song.folder_names.length ? song.folder_names.slice(0, 2).map((name) => <Badge key={name}>{name}</Badge>) : <Badge tone="amber">Unfiled</Badge>}
                  </div>
                </div>
                {song.is_liked ? <Heart className="shrink-0 text-cue" size={18} /> : null}
              </Link>
            ))}
            {!summary.recently_added.length ? <EmptyState title="No active songs yet" description="Seed data or create a song to populate this list." /> : null}
          </div>
        </GlassCard>

        <GlassCard className="rounded-[1.75rem] p-5">
          <div className="mb-5 flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-2xl border border-amberline/25 bg-amberline/10 text-amberline">
              <AlertTriangle size={18} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-amberline">Cleanup</p>
              <h3 className="text-xl font-semibold text-white">Metadata Attention</h3>
            </div>
          </div>
          <div className="space-y-3">
            <CleanupRow label="Missing BPM" value={summary.missing_bpm} />
            <CleanupRow label="Missing Key" value={summary.missing_key} />
            <CleanupRow label="Missing Genre" value={summary.missing_genre} />
            <CleanupRow label="Rejected Songs" value={summary.rejected_songs} />
          </div>
          <Link href="/library" className="mt-5 block"><ActionButton className="w-full" variant="primary">Open Library Cleanup</ActionButton></Link>
        </GlassCard>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <GlassCard className="music-sheen p-5">
          <div className="flex items-center justify-between">
            <div><p className="text-xs uppercase tracking-[0.2em] text-violet">Library signal</p><h3 className="mt-1 text-xl font-semibold text-white">Your prep pulse</h3></div>
            <Waves size={21} className="text-signal" />
          </div>
          <div className="mt-8 flex h-24 items-end gap-2 px-1">
            {[35, 54, 42, 78, 59, 88, 64, 72, 48, 93, 67, 81].map((height, index) => <span key={index} className="flex-1 rounded-t-full bg-[linear-gradient(180deg,rgba(88,240,209,0.95),rgba(155,124,255,0.5),rgba(240,106,166,0.18))] shadow-[0_0_18px_rgba(88,240,209,0.12)]" style={{ height: `${height}%` }} />)}
          </div>
          <div className="mt-4 flex items-center justify-between text-sm text-white/54"><span>Library activity visual</span><span>{summary.total_songs} active tracks</span></div>
        </GlassCard>
        <GlassCard className="p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-cue">Quick routes</p>
          <h3 className="mt-1 text-xl font-semibold text-white">Keep the flow moving</h3>
          <div className="mt-5 grid gap-2">
            <Link href="/playlists" className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/5 px-4 py-3 text-sm font-medium text-white/82 transition hover:border-violet/28 hover:bg-white/9"><span>Shape a playlist</span><ArrowUpRight size={16} className="text-violet" /></Link>
            <Link href="/crates" className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/5 px-4 py-3 text-sm font-medium text-white/82 transition hover:border-signal/28 hover:bg-white/9"><span>Organize DJ crates</span><ArrowUpRight size={16} className="text-signal" /></Link>
            <Link href="/events" className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/5 px-4 py-3 text-sm font-medium text-white/82 transition hover:border-cue/28 hover:bg-white/9"><span>Open event prep</span><ArrowUpRight size={16} className="text-cue" /></Link>
          </div>
        </GlassCard>
      </div>
    </section>
  );
}

function CleanupRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/6 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <span className="text-sm text-white/68">{label}</span>
      <Badge tone={value ? "amber" : "signal"}>{value}</Badge>
    </div>
  );
}
