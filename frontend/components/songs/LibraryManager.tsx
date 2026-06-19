"use client";

import { useMemo, useState } from "react";
import { Plus, SlidersHorizontal } from "lucide-react";

import { AddToFolderModal } from "@/components/songs/AddToFolderModal";
import { SongFormModal } from "@/components/songs/SongFormModal";
import { SongTable } from "@/components/songs/SongTable";
import { ActionButton } from "@/components/ui/ActionButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { GlassCard } from "@/components/ui/GlassCard";
import { SearchInput } from "@/components/ui/SearchInput";
import { Toast } from "@/components/ui/Toast";
import {
  addSongToFolder,
  createFolder,
  createSong,
  likeSong,
  rejectSong,
  unlikeSong,
  updateSong,
} from "@/lib/api";
import type { Folder, Song, SongPayload, SourceType } from "@/types/api";

export function LibraryManager({
  initialSongs,
  initialFolders,
  mode = "library",
}: {
  initialSongs: Song[];
  initialFolders: Folder[];
  mode?: "library" | "liked" | "folder";
}) {
  const [songs, setSongs] = useState(initialSongs);
  const [folders, setFolders] = useState(initialFolders);
  const [search, setSearch] = useState("");
  const [source, setSource] = useState<SourceType | "all">("all");
  const [filter, setFilter] = useState("all");
  const [editing, setEditing] = useState<Song | null>(null);
  const [songFormOpen, setSongFormOpen] = useState(false);
  const [folderSong, setFolderSong] = useState<Song | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [toastTone, setToastTone] = useState<"success" | "error">("success");

  const filteredSongs = useMemo(() => {
    return songs.filter((song) => {
      const searchMatch = [song.title, song.artist?.name, song.album?.title, song.genre?.name].join(" ").toLowerCase().includes(search.toLowerCase());
      const sourceMatch = source === "all" || song.sources[0]?.type === source;
      const filterMatch =
        filter === "all" ||
        (filter === "liked" && song.is_liked) ||
        (filter === "missing_bpm" && !song.bpm) ||
        (filter === "missing_key" && !song.musical_key) ||
        (filter === "missing_genre" && !song.genre);
      return searchMatch && sourceMatch && filterMatch;
    });
  }, [songs, search, source, filter]);

  function showToast(message: string, tone: "success" | "error" = "success") {
    setToast(message);
    setToastTone(tone);
    window.setTimeout(() => setToast(null), 2500);
  }

  async function handleSave(payload: SongPayload) {
    const result = editing ? await updateSong(editing.id, payload) : await createSong(payload);
    if (!result.data) return showToast(result.error ?? "Song save failed", "error");
    setSongs((current) => editing ? current.map((song) => song.id === result.data!.id ? result.data! : song) : [result.data!, ...current]);
    setSongFormOpen(false);
    setEditing(null);
    showToast(editing ? "Song updated" : "Song created");
  }

  async function handleLikeToggle(song: Song) {
    const result = song.is_liked ? await unlikeSong(song.id) : await likeSong(song.id);
    if (!result.data) return showToast(result.error ?? "Like update failed", "error");
    setSongs((current) => {
      const updated = current.map((item) => item.id === song.id ? result.data! : item);
      return mode === "liked" && song.is_liked ? updated.filter((item) => item.id !== song.id) : updated;
    });
    showToast(song.is_liked ? "Removed from Liked Songs" : "Added to Liked Songs");
  }

  async function handleReject(song: Song) {
    if (!window.confirm(`Reject "${song.title}"? It will disappear from active lists but remain recoverable.`)) return;
    const result = await rejectSong(song.id);
    if (!result.data) return showToast(result.error ?? "Reject failed", "error");
    setSongs((current) => current.filter((item) => item.id !== song.id));
    showToast("Song rejected");
  }

  async function handleAddToFolder(folderId: number) {
    if (!folderSong) return;
    const result = await addSongToFolder(folderId, folderSong.id);
    if (!result.data) return showToast(result.error ?? "Could not add to folder", "error");
    const folder = result.data;
    setFolders((current) => current.map((item) => item.id === folder.id ? folder : item));
    setSongs((current) => current.map((song) => song.id === folderSong.id && !song.folders.some((item) => item.id === folder.id) ? { ...song, folders: [...song.folders, folder] } : song));
    setFolderSong(null);
    showToast("Added to folder");
  }

  async function handleCreateFolder(name: string) {
    const result = await createFolder({ name, description: "Created from Add to Folder" });
    if (!result.data) return showToast(result.error ?? "Folder create failed", "error");
    setFolders((current) => [result.data!, ...current]);
    showToast("Folder created");
  }

  return (
    <div className="space-y-5">
      <GlassCard className="p-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <SearchInput value={search} onChange={setSearch} placeholder="Search title, artist, album, genre" />
          <div className="flex flex-wrap gap-2">
            <select value={source} onChange={(event) => setSource(event.target.value as SourceType | "all")} className="h-11 rounded-2xl border border-white/10 bg-white/8 px-3 text-sm text-white outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition hover:bg-white/10">
              <option value="all">All sources</option>
              <option value="local">Local</option>
              <option value="spotify">Spotify</option>
              <option value="youtube">YouTube</option>
              <option value="manual">Manual</option>
            </select>
            <select value={filter} onChange={(event) => setFilter(event.target.value)} className="h-11 rounded-2xl border border-white/10 bg-white/8 px-3 text-sm text-white outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition hover:bg-white/10">
              <option value="all">All metadata</option>
              <option value="liked">Liked</option>
              <option value="missing_bpm">Missing BPM</option>
              <option value="missing_key">Missing key</option>
              <option value="missing_genre">Missing genre</option>
            </select>
            {mode === "library" ? (
              <ActionButton variant="primary" onClick={() => { setEditing(null); setSongFormOpen(true); }}>
                <Plus size={17} /> New Song
              </ActionButton>
            ) : null}
          </div>
        </div>
        <p className="mt-3 flex items-center gap-2 text-xs text-white/42"><SlidersHorizontal size={14} /> Showing {filteredSongs.length} of {songs.length} songs</p>
      </GlassCard>

      {filteredSongs.length ? (
        <SongTable songs={filteredSongs} onLikeToggle={handleLikeToggle} onEdit={(song) => { setEditing(song); setSongFormOpen(true); }} onAddToFolder={setFolderSong} onReject={handleReject} />
      ) : (
        <EmptyState title="No songs match this view" description="Try clearing filters or create a manual song to start building the library." />
      )}

      <SongFormModal open={songFormOpen} song={editing} onClose={() => { setSongFormOpen(false); setEditing(null); }} onSubmit={handleSave} />
      <AddToFolderModal open={Boolean(folderSong)} song={folderSong} folders={folders} onClose={() => setFolderSong(null)} onAdd={handleAddToFolder} onCreateFolder={handleCreateFolder} />
      <Toast message={toast} tone={toastTone} />
    </div>
  );
}
