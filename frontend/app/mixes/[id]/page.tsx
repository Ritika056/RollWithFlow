import { notFound } from "next/navigation";
import { CalendarDays, Music2 } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { GlassCard } from "@/components/ui/GlassCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { getMix } from "@/lib/server-api";
import { getMixSongs, getSongs } from "@/lib/server-api";
export const dynamic = "force-dynamic";
import { MixSongManager } from "@/components/collections/MixSongManager";

export default async function MixDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [{ data: mix }, { data: links }, { data: songs }] = await Promise.all([getMix(Number(id)), getMixSongs(Number(id)), getSongs()]);
  if (!mix) notFound();
  return (
    <section className="space-y-7">
      <PageHeader eyebrow="Mix archive" title={mix.title} description={mix.notes ?? "Mix metadata and tracklist archive."} />
      <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
        <GlassCard className="music-sheen p-6"><div className="grid size-12 place-items-center rounded-2xl border border-cue/30 bg-cue/10 text-cue"><Music2 size={22} /></div><div className="mt-6 flex flex-wrap gap-2">{mix.genre?.name ? <Badge>{mix.genre.name}</Badge> : null}{mix.mood ? <Badge tone="cue">{mix.mood}</Badge> : null}{mix.event_type ? <Badge tone="signal">{mix.event_type}</Badge> : null}</div><div className="mt-6 space-y-3 text-sm text-white/62"><p>BPM range <span className="float-right text-white">{mix.bpm_min ?? "-"} - {mix.bpm_max ?? "-"}</span></p><p>Key <span className="float-right text-white">{mix.musical_key ?? "-"}</span></p><p className="flex items-center gap-2"><CalendarDays size={15} className="text-signal" /> {new Date(mix.created_at).toLocaleDateString()}</p></div></GlassCard>
        <GlassCard className="p-6"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-signal">Tracklist</p><pre className="mt-5 whitespace-pre-wrap font-sans text-sm leading-7 text-white/70">{mix.tracklist_text ?? "No tracklist has been added yet."}</pre></GlassCard>
      </div>
      <MixSongManager mixId={mix.id} links={links ?? []} allSongs={songs ?? []} />
    </section>
  );
}
