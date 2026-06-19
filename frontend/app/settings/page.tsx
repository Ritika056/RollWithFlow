import { Database, HardDrive, Radio, ShieldCheck, Wifi, Youtube } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { GlassCard } from "@/components/ui/GlassCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { LocalLibraryScanPanel } from "@/components/settings/LocalLibraryScanPanel";

const settings = [
  ["Local library scan path", "Folder scanning lands in a later phase.", HardDrive, "Phase 3/4"],
  ["Spotify connection", "OAuth and discovery integration are planned for Phase 4.", Radio, "Phase 4"],
  ["YouTube connection", "Search, metadata, and legal playback/embed options arrive in Phase 4.", Youtube, "Phase 4"],
  ["LAN access", "Same-Wi-Fi usage and hardening are planned for Phase 5.", Wifi, "Phase 5"],
  ["Backup/export", "Private backups and export workflows are planned for Phase 5.", ShieldCheck, "Phase 5"],
  ["Database", "SQLite is active for local development; PostgreSQL can be added later.", Database, "Active"],
] as const;

export default function SettingsPage() {
  return (
    <section className="space-y-7">
      <PageHeader eyebrow="Control Room" title="Settings" description="Local scanning is available. External connections remain intentionally inactive." />
      <LocalLibraryScanPanel />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {settings.map(([title, description, Icon, phase]) => (
          <GlassCard key={title} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="grid size-11 place-items-center rounded-2xl border border-white/10 bg-white/8 text-signal">
                <Icon size={20} />
              </div>
              <Badge tone={phase === "Active" ? "signal" : "neutral"}>{phase}</Badge>
            </div>
            <h3 className="mt-5 text-lg font-semibold text-white">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-white/58">{description}</p>
          </GlassCard>
        ))}
      </div>
    </section>
  );
}
