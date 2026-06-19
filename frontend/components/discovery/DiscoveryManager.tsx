"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Plus, Radio, RefreshCw, Save, Trash2, Undo2 } from "lucide-react";

import { ActionButton } from "@/components/ui/ActionButton";
import { Badge } from "@/components/ui/Badge";
import { GlassCard } from "@/components/ui/GlassCard";
import { Modal } from "@/components/ui/Modal";
import { SearchInput } from "@/components/ui/SearchInput";
import { Toast } from "@/components/ui/Toast";
import { createDiscovery, mockDailyFetch, rejectDiscovery, restoreDiscovery, saveDiscoveryToLibrary } from "@/lib/api";
import type { DiscoveryItem } from "@/types/api";

const tabs = ["manual_search", "trending", "latest", "history", "artist_monitoring", "genre_monitoring", "settings"];

export function DiscoveryManager({ items }: { items: DiscoveryItem[] }) {
  const [list, setList] = useState(items);
  const [tab, setTab] = useState("history");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const visible = useMemo(() => list.filter((item) => {
    const tabMatch = tab === "history" || tab === "settings" || item.discovery_type === tab;
    const searchMatch = [item.title, item.artist_name, item.platform].join(" ").toLowerCase().includes(search.toLowerCase());
    return tabMatch && searchMatch;
  }), [list, tab, search]);

  const flash = (message: string) => { setToast(message); setTimeout(() => setToast(null), 2200); };

  async function save(formData: FormData) {
    const result = await createDiscovery(Object.fromEntries(formData.entries()));
    if (result.data) {
      setList((current) => [result.data!, ...current]);
      setOpen(false);
      flash("Discovery item created");
    }
  }

  async function runMockFetch() {
    const result = await mockDailyFetch();
    if (result.data) {
      setList((current) => [...result.data!, ...current.filter((item) => !result.data!.some((fresh) => fresh.id === item.id))]);
      flash("Mock daily fetch complete");
    }
  }

  async function saveItem(item: DiscoveryItem) {
    const result = await saveDiscoveryToLibrary(item.id);
    if (result.data) {
      setList((current) => current.map((entry) => entry.id === item.id ? { ...entry, is_saved: true } : entry));
      flash("Saved to library");
    }
  }

  async function reject(item: DiscoveryItem) {
    const result = await rejectDiscovery(item.id);
    if (result.data) setList((current) => current.map((entry) => entry.id === item.id ? { ...entry, is_rejected: true } : entry));
  }

  async function restore(item: DiscoveryItem) {
    const result = await restoreDiscovery(item.id);
    if (result.data) setList((current) => current.map((entry) => entry.id === item.id ? result.data! : entry));
  }

  return (
    <div className="space-y-5">
      <GlassCard className="galaxy-surface glow-card p-5 md:p-7">
        <Image src="/images/discovery-galaxy.png" alt="Abstract neon music galaxy" fill priority sizes="(max-width: 768px) 100vw, 75vw" className="object-cover opacity-90 mix-blend-screen" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,6,20,0.9),rgba(5,6,20,0.24)_54%,rgba(5,6,20,0.56)),linear-gradient(0deg,rgba(5,6,20,0.35),transparent_45%)]" />
        <div className="relative z-10 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-signal">Musical galaxy</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Explore your sound universe</h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-white/60">Discovery items, genres, and future monitoring will orbit here once external connections are enabled.</p>
          </div>
          <Badge tone="cue">{list.length} signals</Badge>
        </div>
        <span className="galaxy-node left-[23%] top-[38%] text-cue" data-label="Techno" />
        <span className="galaxy-node left-[54%] top-[44%] text-violet" data-label="House" />
        <span className="galaxy-node bottom-[24%] left-[40%] text-signal" data-label="Afro" />
        <span className="galaxy-node bottom-[20%] right-[18%] text-amberline" data-label="Remix" />
        <div className="absolute bottom-5 right-5 rounded-2xl border border-white/12 bg-deck-950/66 px-4 py-3 text-xs text-white/58 backdrop-blur-xl">
          <span className="text-signal">Live map</span> foundation
        </div>
      </GlassCard>
      <GlassCard className="music-sheen p-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <SearchInput value={search} onChange={setSearch} placeholder="Search discovery history" />
          <div className="flex flex-wrap gap-2">
            <ActionButton variant="primary" onClick={() => setOpen(true)}><Plus size={16} /> Manual Item</ActionButton>
            <ActionButton onClick={runMockFetch}><RefreshCw size={16} /> Mock Daily Fetch</ActionButton>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {tabs.map((item) => <button key={item} onClick={() => setTab(item)} className={`rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] transition ${tab === item ? "border-signal/30 bg-signal/12 text-signal" : "border-white/10 bg-white/7 text-white/52 hover:text-white"}`}>{item.replaceAll("_", " ")}</button>)}
        </div>
      </GlassCard>

      {tab === "settings" ? (
        <GlassCard className="p-5"><p className="text-white/68">Spotify and YouTube credentials are intentionally pending. Mock discovery is ready for tomorrow’s real integration work.</p></GlassCard>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((item) => (
          <GlassCard key={item.id} className="glow-card music-sheen p-5">
            <div className="flex items-start justify-between gap-3"><Radio className="text-signal" /><Badge>{item.platform}</Badge></div>
            <h3 className="mt-4 text-lg font-semibold text-white">{item.title}</h3>
            <p className="mt-2 text-sm text-white/58">{item.artist_name ?? "Unknown artist"}</p>
            <div className="mt-4 flex flex-wrap gap-2"><Badge>{item.discovery_type}</Badge>{item.is_saved ? <Badge tone="signal">Saved</Badge> : null}{item.is_rejected ? <Badge tone="cue">Rejected</Badge> : null}</div>
            <div className="mt-5 flex flex-wrap gap-2">
              <ActionButton disabled={item.is_saved} onClick={() => saveItem(item)}><Save size={15} /> Save</ActionButton>
              {item.is_rejected ? <ActionButton onClick={() => restore(item)}><Undo2 size={15} /> Restore</ActionButton> : <ActionButton variant="danger" onClick={() => reject(item)}><Trash2 size={15} /> Reject</ActionButton>}
            </div>
          </GlassCard>
        ))}
      </div>
      <Modal open={open} title="Create Discovery Item" onClose={() => setOpen(false)}>
        <form action={save} className="grid gap-4">
          <Field name="title" label="Title" />
          <Field name="artist_name" label="Artist" />
          <Field name="platform" label="Platform" defaultValue="manual" />
          <Field name="source_url" label="Source URL" />
          <Field name="discovery_type" label="Discovery type" defaultValue="manual_search" />
          <Field name="popularity_score" label="Popularity" type="number" />
          <div className="flex justify-end"><ActionButton type="submit" variant="primary">Save</ActionButton></div>
        </form>
      </Modal>
      <Toast message={toast} />
    </div>
  );
}

function Field(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const { label, ...rest } = props;
  return <label className="space-y-2 text-sm text-white/62"><span>{label}</span><input {...rest} className="h-11 w-full rounded-2xl border border-white/10 bg-white/8 px-3 text-white outline-none" /></label>;
}
