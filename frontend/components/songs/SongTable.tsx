"use client";

import { Edit3, FolderPlus, Heart, Play, RefreshCw, RotateCcw, Trash2 } from "lucide-react";

import { usePlayer } from "@/components/player/PlayerProvider";
import { ActionButton } from "@/components/ui/ActionButton";
import { Badge } from "@/components/ui/Badge";
import type { Song } from "@/types/api";

export function sourceTone(source?: string) {
  if (source === "local") return "signal";
  if (source === "spotify") return "cue";
  if (source === "youtube") return "amber";
  return "neutral";
}

export function SongTable({
  songs,
  onLikeToggle,
  onEdit,
  onAddToFolder,
  onReject,
  onRemoveFromFolder,
  onRescanMetadata,
}: {
  songs: Song[];
  onLikeToggle: (song: Song) => void;
  onEdit: (song: Song) => void;
  onAddToFolder: (song: Song) => void;
  onReject: (song: Song) => void;
  onRemoveFromFolder?: (song: Song) => void;
  onRescanMetadata?: (song: Song) => void;
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-deck-925/54 shadow-panel backdrop-blur-xl neon-ring">
      <div className="hidden overflow-x-auto soft-scrollbar xl:block">
        <table className="w-full min-w-[1120px] text-left text-sm">
          <thead className="bg-white/7 text-xs uppercase tracking-[0.18em] text-white/48">
            <tr>
              <th className="px-4 py-4">#</th>
              <th className="px-4 py-4">Title</th>
              <th className="px-4 py-4">Artist</th>
              <th className="px-4 py-4">Album</th>
              <th className="px-4 py-4">Genre</th>
              <th className="px-4 py-4">Duration</th>
              <th className="px-4 py-4">BPM</th>
              <th className="px-4 py-4">Key</th>
              <th className="px-4 py-4">Energy</th>
              <th className="px-4 py-4">Rating</th>
              <th className="px-4 py-4">Source</th>
              <th className="px-4 py-4">Folders</th>
              <th className="px-4 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/8">
            {songs.map((song, index) => <SongRow key={song.id} song={song} index={index} queue={songs} onLikeToggle={onLikeToggle} onEdit={onEdit} onAddToFolder={onAddToFolder} onReject={onReject} onRemoveFromFolder={onRemoveFromFolder} onRescanMetadata={onRescanMetadata} />)}
          </tbody>
        </table>
      </div>
      <div className="grid gap-3 p-3 xl:hidden">
        {songs.map((song, index) => <SongCard key={song.id} song={song} index={index} queue={songs} onLikeToggle={onLikeToggle} onEdit={onEdit} onAddToFolder={onAddToFolder} onReject={onReject} onRemoveFromFolder={onRemoveFromFolder} onRescanMetadata={onRescanMetadata} />)}
      </div>
    </div>
  );
}

function SongRow(props: Parameters<typeof SongCard>[0]) {
  const { song, index } = props;
  return (
    <tr className="table-row-glow text-white/72 transition duration-200">
      <td className="px-4 py-4 text-white/36">{index + 1}</td>
      <td className="px-4 py-4"><p className="font-semibold text-white">{song.title}</p>{song.is_liked ? <Badge tone="cue">Liked</Badge> : null}</td>
      <td className="px-4 py-4">{song.artist?.name ?? "Unknown"}</td>
      <td className="px-4 py-4">{song.album?.title ?? "-"}</td>
      <td className="px-4 py-4">{song.genre?.name ? <Badge>{song.genre.name}</Badge> : <Badge tone="amber">Missing</Badge>}</td>
      <td className="px-4 py-4">{formatDuration(song.duration_seconds)}</td>
      <td className="px-4 py-4">{song.bpm ?? <Badge tone="amber">Missing</Badge>}</td>
      <td className="px-4 py-4">{song.musical_key ?? <Badge tone="amber">Missing</Badge>}</td>
      <td className="px-4 py-4">{song.energy_level ?? "-"}</td>
      <td className="px-4 py-4">{song.rating ? `${song.rating}/5` : "-"}</td>
      <td className="px-4 py-4"><Badge tone={sourceTone(song.sources[0]?.type)}>{song.sources[0]?.type ?? "manual"}</Badge></td>
      <td className="px-4 py-4"><FolderBadges song={song} /></td>
      <td className="px-4 py-4"><ActionStrip {...props} /></td>
    </tr>
  );
}

function SongCard(props: {
  song: Song;
  index: number;
  onLikeToggle: (song: Song) => void;
  onEdit: (song: Song) => void;
  onAddToFolder: (song: Song) => void;
  onReject: (song: Song) => void;
  onRemoveFromFolder?: (song: Song) => void;
  onRescanMetadata?: (song: Song) => void;
  queue: Song[];
}) {
  const { song, index } = props;
  return (
    <article className="rounded-3xl border border-white/10 bg-white/7 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-white/38">#{index + 1}</p>
          <h3 className="mt-1 text-lg font-semibold text-white">{song.title}</h3>
          <p className="text-sm text-white/54">{song.artist?.name ?? "Unknown artist"} · {song.album?.title ?? "No album"}</p>
        </div>
        <Badge tone={sourceTone(song.sources[0]?.type)}>{song.sources[0]?.type ?? "manual"}</Badge>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {song.genre?.name ? <Badge>{song.genre.name}</Badge> : <Badge tone="amber">Missing genre</Badge>}
        <Badge tone={song.duration_seconds ? "neutral" : "amber"}>{formatDuration(song.duration_seconds)}</Badge>
        <Badge tone={song.bpm ? "neutral" : "amber"}>{song.bpm ? `${song.bpm} BPM` : "Missing BPM"}</Badge>
        <Badge tone={song.musical_key ? "neutral" : "amber"}>{song.musical_key ?? "Missing key"}</Badge>
        {song.is_liked ? <Badge tone="cue">Liked</Badge> : null}
      </div>
      <div className="mt-4"><FolderBadges song={song} /></div>
      <div className="mt-4"><ActionStrip {...props} /></div>
    </article>
  );
}

function FolderBadges({ song }: { song: Song }) {
  if (!song.folders.length) return <Badge tone="amber">Unfiled</Badge>;
  return <div className="flex max-w-xs flex-wrap gap-1.5">{song.folders.slice(0, 3).map((folder) => <Badge key={folder.id}>{folder.name}</Badge>)}</div>;
}

function formatDuration(seconds?: number | null) {
  if (!seconds) return "Unknown duration";
  return `${Math.floor(seconds / 60)}:${Math.round(seconds % 60).toString().padStart(2, "0")}`;
}

function ActionStrip({
  song,
  onLikeToggle,
  onEdit,
  onAddToFolder,
  onReject,
  onRemoveFromFolder,
  onRescanMetadata,
  queue,
}: {
  song: Song;
  onLikeToggle: (song: Song) => void;
  onEdit: (song: Song) => void;
  onAddToFolder: (song: Song) => void;
  onReject: (song: Song) => void;
  onRemoveFromFolder?: (song: Song) => void;
  onRescanMetadata?: (song: Song) => void;
  queue: Song[];
}) {
  const { isLocalPlayable, playSong } = usePlayer();
  return (
    <div className="flex flex-wrap gap-2">
      {isLocalPlayable(song) ? <ActionButton className="size-9 p-0" variant="primary" onClick={() => playSong(song, queue)} aria-label="Play local audio"><Play size={16} /></ActionButton> : null}
      {onRescanMetadata && song.sources.some((source) => source.type === "local") ? <ActionButton className="size-9 p-0" onClick={() => onRescanMetadata(song)} aria-label="Rescan local metadata"><RefreshCw size={15} /></ActionButton> : null}
      <ActionButton className="size-9 p-0" variant={song.is_liked ? "danger" : "secondary"} onClick={() => onLikeToggle(song)} aria-label="Toggle liked"><Heart size={16} /></ActionButton>
      <ActionButton className="size-9 p-0" onClick={() => onAddToFolder(song)} aria-label="Add to folder"><FolderPlus size={16} /></ActionButton>
      <ActionButton className="size-9 p-0" onClick={() => onEdit(song)} aria-label="Edit"><Edit3 size={16} /></ActionButton>
      {onRemoveFromFolder ? <ActionButton className="size-9 p-0" onClick={() => onRemoveFromFolder(song)} aria-label="Remove from folder"><RotateCcw size={16} /></ActionButton> : null}
      <ActionButton className="size-9 p-0" variant="danger" onClick={() => onReject(song)} aria-label="Reject"><Trash2 size={16} /></ActionButton>
    </div>
  );
}
