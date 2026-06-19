"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Edit3, ListMusic, Music2, Plus, Trash2 } from "lucide-react";

import { ActionButton } from "@/components/ui/ActionButton";
import { Badge } from "@/components/ui/Badge";
import { GlassCard } from "@/components/ui/GlassCard";
import { Modal } from "@/components/ui/Modal";
import { Toast } from "@/components/ui/Toast";
import { createCrate, createMix, createPlaylist, deleteCrate, deleteMix, deletePlaylist, updateCrate, updateMix, updatePlaylist } from "@/lib/api";
import type { Crate, Mix, Playlist } from "@/types/api";

type Kind = "playlist" | "crate" | "mix";
type Item = Playlist | Crate | Mix;

const constellationPositions = [
  [16, 28], [41, 20], [68, 27], [27, 59], [55, 48], [82, 65], [11, 75], [46, 79], [73, 82], [90, 18], [8, 47], [88, 44],
] as const;

export function CollectionManager({
  kind,
  items,
}: {
  kind: Kind;
  items: Item[];
}) {
  const [list, setList] = useState(items);
  const [editing, setEditing] = useState<Item | null>(null);
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const label = kind === "crate" ? "DJ Crate" : kind === "mix" ? "Mix" : "Playlist";
  const isConstellation = kind === "playlist" || kind === "mix";

  async function save(formData: FormData) {
    const payload = Object.fromEntries(formData.entries());
    const result = await saveItem(kind, editing?.id, payload);
    if (!result) return;
    setList((current) => (editing ? current.map((item) => (item.id === result.id ? result : item)) : [result, ...current]));
    setEditing(null);
    setOpen(false);
    setToast(`${label} saved`);
    setTimeout(() => setToast(null), 2200);
  }

  async function remove(item: Item) {
    if (!window.confirm(`Delete ${"name" in item ? item.name : item.title}?`)) return;
    if (await deleteItem(kind, item.id)) setList((current) => current.filter((entry) => entry.id !== item.id));
  }

  return (
    <div className="space-y-5">
      {!isConstellation ? <div className="flex justify-end"><ActionButton variant="primary" onClick={() => { setEditing(null); setOpen(true); }}><Plus size={16} /> New {label}</ActionButton></div> : null}
      {isConstellation ? (
        <div className="collection-galaxy full-page-galaxy">
          <Image src="/images/discovery-galaxy.png" alt={`${label} galaxy map`} fill sizes="(max-width: 768px) 100vw, 75vw" className="object-cover opacity-90" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_15%,rgba(5,6,20,0.45)_72%),linear-gradient(90deg,rgba(5,6,20,0.32),transparent_50%,rgba(5,6,20,0.38))]" />
          <div className="relative z-10 flex h-full items-start justify-between gap-4 p-5 md:p-7"><div><p className="text-xs font-semibold uppercase tracking-[0.22em] text-signal">{label} / constellation</p><h1 className="mt-2 text-3xl font-semibold text-white md:text-4xl">Your {kind === "mix" ? "archive" : "set"} map</h1><p className="mt-2 max-w-md text-sm text-white/60">Choose a glowing signal to open its {kind === "mix" ? "mix detail" : "playlist tracks and notes"}.</p></div><div className="flex flex-wrap justify-end gap-2"><span className="rounded-full border border-white/12 bg-deck-950/64 px-3 py-1.5 text-xs text-white/62 backdrop-blur">{list.length} {kind === "mix" ? "mixes" : "playlists"}</span><ActionButton variant="primary" onClick={() => { setEditing(null); setOpen(true); }}><Plus size={16} /> New {label}</ActionButton></div></div>
          {list.map((item, index) => {
            const [left, top] = constellationPositions[index % constellationPositions.length];
            const title = "name" in item ? item.name : item.title;
            const href = kind === "mix" ? `/mixes/${item.id}` : `/playlists/${item.id}`;
            const Icon = kind === "mix" ? Music2 : ListMusic;
            const subtitle = kind === "mix" ? (item as Mix).genre?.name ?? "Mix archive" : `${("song_count" in item ? item.song_count : 0) ?? 0} tracks`;
            return <Link key={item.id} href={href} className="collection-galaxy-point" style={{ left: `${left}%`, top: `${top}%` }} aria-label={`Open ${title}`}><span className={kind === "mix" ? "collection-galaxy-core collection-galaxy-core-mix" : "collection-galaxy-core"}><Icon size={15} /></span><span className="collection-galaxy-label"><strong>{title}</strong><small>{subtitle}</small></span></Link>;
          })}
        </div>
      ) : (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {list.map((item) => (
          <GlassCard key={item.id} className="glow-card music-sheen relative p-5">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-xl font-semibold text-white">{"name" in item ? item.name : item.title}</h3>
              {"song_count" in item ? <Badge tone="signal">{item.song_count ?? 0} songs</Badge> : <Badge>archive</Badge>}
            </div>
            <p className="mt-3 min-h-12 text-sm leading-6 text-white/58">{"description" in item ? item.description : item.notes ?? "Metadata record ready."}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {"event_type" in item && item.event_type ? <Badge>{item.event_type}</Badge> : null}
              {"mood" in item && item.mood ? <Badge>{item.mood}</Badge> : null}
              {"energy_level" in item && item.energy_level ? <Badge>Energy {item.energy_level}</Badge> : null}
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link href={`/crates/${item.id}`}><ActionButton>Open</ActionButton></Link>
              <ActionButton onClick={() => { setEditing(item); setOpen(true); }}><Edit3 size={15} /> Edit</ActionButton>
              <ActionButton variant="danger" onClick={() => remove(item)}><Trash2 size={15} /> Delete</ActionButton>
            </div>
          </GlassCard>
        ))}
      </div>
      )}
      <Modal open={open} title={`${editing ? "Edit" : "Create"} ${label}`} onClose={() => setOpen(false)}>
        <form action={save} className="grid gap-4">
          <Field name={kind === "mix" ? "title" : "name"} label={kind === "mix" ? "Title" : "Name"} defaultValue={(editing && ("name" in editing ? editing.name : editing.title)) || ""} />
          {kind === "mix" ? <Field name="genre_name" label="Genre" defaultValue={(editing as Mix | null)?.genre?.name ?? ""} /> : null}
          <Field name="description" label="Description / notes" defaultValue={(editing as Playlist | Crate | null)?.description ?? (editing as Mix | null)?.notes ?? ""} />
          <Field name="event_type" label="Event type" defaultValue={(editing as Playlist | Mix | null)?.event_type ?? ""} />
          <Field name="mood" label="Mood" defaultValue={(editing as Playlist | Crate | Mix | null)?.mood ?? ""} />
          {kind === "crate" ? <Field name="energy_level" label="Energy level" type="number" defaultValue={(editing as Crate | null)?.energy_level ?? ""} /> : null}
          {kind === "mix" ? (
            <>
              <Field name="bpm_min" label="BPM min" type="number" defaultValue={(editing as Mix | null)?.bpm_min ?? ""} />
              <Field name="bpm_max" label="BPM max" type="number" defaultValue={(editing as Mix | null)?.bpm_max ?? ""} />
              <Field name="musical_key" label="Key" defaultValue={(editing as Mix | null)?.musical_key ?? ""} />
              <textarea name="tracklist_text" defaultValue={(editing as Mix | null)?.tracklist_text ?? ""} placeholder="Tracklist" className="min-h-28 rounded-2xl border border-white/10 bg-white/8 p-3 text-white outline-none" />
            </>
          ) : null}
          <div className="flex justify-end gap-2"><ActionButton type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</ActionButton><ActionButton type="submit" variant="primary">Save</ActionButton></div>
        </form>
      </Modal>
      <Toast message={toast} />
    </div>
  );
}

async function saveItem(kind: Kind, id: number | undefined, payload: Record<string, unknown>) {
  if (kind === "playlist") return (id ? await updatePlaylist(id, payload) : await createPlaylist(payload)).data;
  if (kind === "crate") return (id ? await updateCrate(id, payload) : await createCrate(payload)).data;
  const mixPayload = { ...payload, notes: payload.description as string };
  return (id ? await updateMix(id, mixPayload) : await createMix(mixPayload)).data;
}

async function deleteItem(kind: Kind, id: number) {
  if (kind === "playlist") return Boolean((await deletePlaylist(id)).data);
  if (kind === "crate") return Boolean((await deleteCrate(id)).data);
  return Boolean((await deleteMix(id)).data);
}

function Field(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const { label, ...rest } = props;
  return <label className="space-y-2 text-sm text-white/62"><span>{label}</span><input {...rest} className="h-11 w-full rounded-2xl border border-white/10 bg-white/8 px-3 text-white outline-none" /></label>;
}
