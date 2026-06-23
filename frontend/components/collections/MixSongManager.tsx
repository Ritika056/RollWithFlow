"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { addMixSong, deleteMixSong, updateMixSong } from "@/lib/api";
import { PlayAllButton } from "@/components/player/PlayAllButton";
import { GlassCard } from "@/components/ui/GlassCard";
import type { MixSong, Song } from "@/types/api";

export function MixSongManager({ mixId, links, allSongs }: { mixId: number; links: MixSong[]; allSongs: Song[] }) {
  const [list, setList] = useState(links);
  const available = allSongs.filter((song) => !list.some((link) => link.song_id === song.id));

  async function add(songId: number) {
    const result = await addMixSong(mixId, { song_id: songId });
    if (result.data) setList((current) => [...current, result.data!]);
  }

  async function changePosition(link: MixSong, position: number) {
    const result = await updateMixSong(mixId, link.id, { position });
    if (result.data) setList((current) => current.map((item) => item.id === link.id ? result.data! : item).sort((a, b) => a.position - b.position));
  }

  async function remove(linkId: number) {
    const result = await deleteMixSong(mixId, linkId);
    if (result.data) setList((current) => current.filter((link) => link.id !== linkId));
  }

  return <GlassCard className="p-5">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs uppercase tracking-[.16em] text-signal">Linked tracks</p><h2 className="mt-1 font-semibold text-white">Mix song order</h2></div><PlayAllButton songs={list.map((link) => link.song)} /></div>
    <div className="mt-4 flex gap-2"><select onChange={(event) => event.target.value && add(Number(event.target.value))} defaultValue="" className="h-10 flex-1 rounded-xl bg-white/8 px-3 text-white"><option value="">Add a song from Library</option>{available.map((song) => <option key={song.id} value={song.id}>{song.title}</option>)}</select><Plus className="text-signal" /></div>
    <div className="mt-4 space-y-2">{list.map((link) => <div key={link.id} className="flex items-center gap-3 rounded-xl bg-white/5 p-3"><input aria-label="Position" type="number" defaultValue={link.position} onBlur={(event) => changePosition(link, Number(event.target.value))} className="w-12 rounded-lg bg-deck-950 p-1 text-center text-sm text-white" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-white">{link.song.title}</p><p className="text-xs text-white/48">{link.song.artist?.name ?? "Unknown artist"}</p></div><button aria-label="Remove song from mix" onClick={() => remove(link.id)} className="text-cue"><Trash2 size={16} /></button></div>)}{!list.length ? <p className="py-4 text-sm text-white/50">Link local Library songs to enable Mix Play All.</p> : null}</div>
  </GlassCard>;
}
