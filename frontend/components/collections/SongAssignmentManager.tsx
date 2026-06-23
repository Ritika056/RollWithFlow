"use client";

import { useState } from "react";

import { EmptyState } from "@/components/ui/EmptyState";
import { SearchInput } from "@/components/ui/SearchInput";
import { SongTable } from "@/components/songs/SongTable";
import { PlayAllButton } from "@/components/player/PlayAllButton";
import { addSongToCrate, addSongToPlaylist, removeSongFromCrate, removeSongFromPlaylist } from "@/lib/api";
import type { Song } from "@/types/api";

export function SongAssignmentManager({
  songs,
  allSongs,
  kind,
  collectionId,
}: {
  songs: Song[];
  allSongs: Song[];
  kind: "playlist" | "crate";
  collectionId: number;
}) {
  const [list, setList] = useState(songs);
  const [query, setQuery] = useState("");
  const visible = list.filter((song) => [song.title, song.artist?.name, song.genre?.name].join(" ").toLowerCase().includes(query.toLowerCase()));
  const available = allSongs.filter((song) => !list.some((item) => item.id === song.id));

  async function add(songId: number) {
    if (kind === "playlist") await addSongToPlaylist(collectionId, songId);
    else await addSongToCrate(collectionId, songId);
    const song = allSongs.find((item) => item.id === songId);
    if (song) setList((current) => [...current, song]);
  }

  async function remove(song: Song) {
    if (kind === "playlist") await removeSongFromPlaylist(collectionId, song.id);
    else await removeSongFromCrate(collectionId, song.id);
    setList((current) => current.filter((item) => item.id !== song.id));
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row">
        <SearchInput value={query} onChange={setQuery} placeholder="Search songs in this collection" />
        <select onChange={(event) => event.target.value && add(Number(event.target.value))} defaultValue="" className="h-11 rounded-2xl border border-white/10 bg-white/8 px-3 text-sm text-white outline-none">
          <option value="">Add song...</option>
          {available.map((song) => <option key={song.id} value={song.id}>{song.title}</option>)}
        </select>
        <PlayAllButton songs={visible} />
      </div>
      {visible.length ? <SongTable songs={visible} onLikeToggle={() => undefined} onEdit={() => undefined} onAddToFolder={() => undefined} onReject={() => undefined} onRemoveFromFolder={remove} /> : <EmptyState title="No songs here yet" description="Use the Add song selector to build this collection." />}
    </div>
  );
}
