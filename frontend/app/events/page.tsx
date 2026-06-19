import { CheckCircle2, Clock3, Headphones, TriangleAlert } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { GlassCard } from "@/components/ui/GlassCard";

const categories = [
  ["Entry Songs", "8/10", "signal"], ["Family Dance", "12/15", "violet"], ["Couple Dance", "7/10", "cue"], ["Cake Cutting", "5/6", "amber"], ["Peak Hour", "24/50", "cue"], ["After Party", "10/12", "signal"],
] as const;
const timeline = [["7:00 PM", "Entry", "8 songs", "signal"], ["8:00 PM", "Dinner", "12 songs", "amber"], ["9:30 PM", "Main Set", "28 songs", "cue"], ["11:30 PM", "Peak Hour", "30 songs", "violet"], ["1:00 AM", "After Party", "18 songs", "signal"]] as const;

export default function EventsPage() {
  return (
    <section className="space-y-4">
      <GlassCard className="event-stage overflow-hidden rounded-[1.8rem] p-6 md:p-7">
        <div className="relative z-10 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-signal">Event preparation</p>
          <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1"><h1 className="text-3xl font-semibold text-white md:text-4xl">Wedding Bash</h1><span className="text-sm text-white/62">24 May 2026</span></div>
          <div className="mt-5 max-w-md"><div className="flex justify-between text-sm"><span className="text-white/68">Event readiness</span><strong className="text-signal">87%</strong></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full w-[87%] rounded-full bg-[linear-gradient(90deg,#58f0d1,#3bdbec,#f0c86a)] shadow-[0_0_18px_rgba(88,240,209,0.55)]" /></div><p className="mt-2 text-xs text-white/52">You are almost ready. Just a few details left.</p></div>
        </div>
        <div className="relative z-10 mt-6 flex flex-wrap gap-2 md:absolute md:bottom-7 md:right-7 md:mt-0">
          {["05 DAYS", "14 HRS", "36 MIN", "24 SEC"].map((item) => <div key={item} className="rounded-xl border border-violet/32 bg-deck-950/62 px-3 py-2 text-center shadow-[0_0_24px_rgba(155,124,255,0.12)]"><strong className="block text-lg text-white">{item.split(" ")[0]}</strong><span className="text-[10px] tracking-[0.13em] text-white/46">{item.split(" ")[1]}</span></div>)}
        </div>
      </GlassCard>

      <GlassCard className="p-5"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-amberline">Phase 5 placeholder</p><div className="mt-3 grid gap-3 md:grid-cols-3"><p className="rounded-xl border border-white/8 bg-white/5 p-3 text-sm text-white/62">Event persistence is coming later.</p><p className="rounded-xl border border-white/8 bg-white/5 p-3 text-sm text-white/62">Event-to-playlist and crate links are coming later.</p><p className="rounded-xl border border-white/8 bg-white/5 p-3 text-sm text-white/62">Live countdowns and checklists are coming later.</p></div></GlassCard>

      <GlassCard className="p-4 md:p-5"><p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-white/48">Category checklist</p><div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">{categories.map(([label, count, tone]) => <div key={label} className="rounded-2xl border border-white/8 bg-white/5 p-3"><div className={`grid size-10 place-items-center rounded-full border-2 ${tone === "signal" ? "border-signal text-signal" : tone === "cue" ? "border-cue text-cue" : tone === "amber" ? "border-amberline text-amberline" : "border-violet text-violet"}`}><CheckCircle2 size={16} /></div><p className="mt-3 text-sm font-semibold text-white">{label}</p><p className="mt-1 text-xs text-white/48">{count} ready</p></div>)}</div></GlassCard>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.95fr_1.1fr]">
        <GlassCard className="p-5"><div className="flex items-center gap-2"><Clock3 size={17} className="text-signal" /><h2 className="font-semibold text-white">Timeline planner</h2></div><div className="mt-5 space-y-3">{timeline.map(([time, label, count, tone]) => <div key={label} className="grid grid-cols-[64px_1fr_auto] items-center gap-3 text-sm"><span className="text-white/54">{time}</span><div><p className="font-medium text-white">{label}</p><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/8"><div className={`h-full rounded-full ${tone === "signal" ? "w-[45%] bg-signal" : tone === "amber" ? "w-[62%] bg-amberline" : tone === "cue" ? "w-[88%] bg-cue" : "w-[73%] bg-violet"}`} /></div></div><span className="text-xs text-white/44">{count}</span></div>)}</div></GlassCard>
        <GlassCard className="p-5"><div className="flex items-center gap-2"><TriangleAlert size={17} className="text-amberline" /><h2 className="font-semibold text-white">Missing tracks</h2></div><div className="mt-5 space-y-3">{["Need 2 more couple dance songs", "Add one emotional track (80-100 BPM)", "Cake cutting song not selected", "Add regional track for family mix"].map((item) => <p key={item} className="rounded-xl border border-white/7 bg-white/4 px-3 py-2.5 text-sm text-white/62">{item}</p>)}</div></GlassCard>
        <GlassCard className="p-5"><div className="flex items-center gap-2"><Headphones size={17} className="text-cue" /><h2 className="font-semibold text-white">Guest preferences</h2></div><div className="mt-6 flex items-center gap-5"><div className="grid size-28 place-items-center rounded-full border-[12px] border-cue border-l-signal border-b-amberline border-r-violet text-sm font-semibold text-white">45%</div><div className="space-y-2 text-sm text-white/62"><p><span className="mr-2 text-cue">●</span>Bollywood 45%</p><p><span className="mr-2 text-amberline">●</span>Punjabi 20%</p><p><span className="mr-2 text-violet">●</span>House 15%</p><p><span className="mr-2 text-signal">●</span>Retro 10%</p></div></div></GlassCard>
      </div>

      <GlassCard className="p-5"><div className="flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-cue">Suggested tracks for this event</p><h2 className="mt-1 text-xl font-semibold text-white">A live-ready starting point</h2></div><Badge tone="signal">Placeholder</Badge></div><div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">{["Tere Vaaste", "Karan Aujla", "Apna Bana Le", "Midnight Groove"].map((track, index) => <div key={track} className="group rounded-2xl border border-white/9 bg-[linear-gradient(135deg,rgba(240,106,166,0.16),rgba(88,240,209,0.06))] p-3 transition hover:-translate-y-1 hover:border-cue/38"><div className="h-14 rounded-xl bg-[radial-gradient(circle_at_70%_20%,rgba(240,106,166,0.8),transparent_28%),linear-gradient(135deg,#1e163a,#082839)]" /><p className="mt-3 font-semibold text-white">{track}</p><p className="text-xs text-white/50">{92 + index * 4} BPM - A</p></div>)}</div></GlassCard>
    </section>
  );
}
