import { PageHeader } from "@/components/ui/PageHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { getAnalytics } from "@/lib/server-api";
export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const { data } = await getAnalytics();
  const stats = data ? [["Songs",data.total_songs],["Playable local",data.playable_local_songs],["Liked",data.liked_songs],["Missing BPM",data.missing_bpm],["Missing key",data.missing_key],["Missing genre",data.missing_genre],["Events",data.event_count]] : [];
  return <section className="space-y-7"><PageHeader eyebrow="Music intelligence" title="Analytics" description="Practical health signals from your private music library." /><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{stats.map(([label,value])=><GlassCard key={String(label)} className="p-5"><p className="text-xs uppercase tracking-[.16em] text-white/45">{label}</p><p className="mt-2 text-3xl font-semibold text-white">{value}</p></GlassCard>)}</div>{data?<div className="grid gap-5 lg:grid-cols-2"><DataCard title="Top artists" items={data.top_artists}/><DataCard title="Source breakdown" items={data.source_breakdown}/><DataCard title="Most used folders" items={data.most_used_folders}/><DataCard title="Energy distribution" items={data.energy_distribution}/></div>:<GlassCard className="p-6 text-white/55">Analytics needs an active backend session.</GlassCard>}</section>;
}
function DataCard({title,items}:{title:string;items:{name:string;count:number}[]}){return <GlassCard className="p-5"><h2 className="font-semibold text-white">{title}</h2><div className="mt-4 space-y-3">{items.map(item=><div key={item.name} className="flex justify-between text-sm"><span className="text-white/60">{item.name}</span><strong className="text-signal">{item.count}</strong></div>)||<p>No data yet.</p>}</div></GlassCard>}
