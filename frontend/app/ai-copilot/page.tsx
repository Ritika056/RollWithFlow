import { Bot, Command, Sparkles, WandSparkles } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { GlassCard } from "@/components/ui/GlassCard";
import { PageHeader } from "@/components/ui/PageHeader";

export default function AiCopilotPage() {
  return (
    <section className="space-y-7">
      <GlassCard className="music-sheen glow-card overflow-hidden rounded-[2rem] p-7 md:p-9">
        <PageHeader eyebrow="Private assistant" title="AI Copilot" description="A future command layer for finding musical paths, cleaning prep details, and shaping event flow from your private library." />
        <div className="mt-7 flex max-w-3xl items-center gap-3 rounded-2xl border border-violet/28 bg-deck-950/62 px-4 py-3 text-sm text-white/48 shadow-[0_0_35px_rgba(155,124,255,0.1)]">
          <Command size={17} className="text-signal" />
          Ask about your library when the AI layer is connected
          <Badge tone="neutral">Coming later</Badge>
        </div>
      </GlassCard>
      <div className="grid gap-5 md:grid-cols-3">
        {[
          [Bot, "Library intelligence", "Spot DJ-ready gaps and metadata that needs attention."],
          [WandSparkles, "Set preparation", "Find a coherent path through energy, key, and mood."],
          [Sparkles, "Discovery signals", "Turn monitoring into choices you can act on."],
        ].map(([Icon, title, description]) => {
          const FeatureIcon = Icon as typeof Bot;
          return <GlassCard key={title as string} className="glow-card p-5"><div className="grid size-11 place-items-center rounded-2xl border border-violet/25 bg-violet/10 text-violet"><FeatureIcon size={20} /></div><h2 className="mt-5 text-lg font-semibold text-white">{title as string}</h2><p className="mt-2 text-sm leading-6 text-white/58">{description as string}</p></GlassCard>;
        })}
      </div>
    </section>
  );
}
