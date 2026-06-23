"use client";

import { useState } from "react";

import { AddToFolderModal } from "@/components/songs/AddToFolderModal";
import { SongFormModal } from "@/components/songs/SongFormModal";
import { SongTable } from "@/components/songs/SongTable";
import { PlayAllButton } from "@/components/player/PlayAllButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { SearchInput } from "@/components/ui/SearchInput";
import { Toast } from "@/components/ui/Toast";
import { addSongToFolder, createFolder, likeSong, rejectSong, removeSongFromFolder, unlikeSong, updateSong } from "@/lib/api";
import type { Folder, Song, SongPayload } from "@/types/api";

export function FolderDetailManager({ folder, initialSongs, folders }: { folder: Folder; initialSongs: Song[]; folders: Folder[] }) {
  const [songs, setSongs] = useState(initialSongs);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Song | null>(null);
  const [folderSong, setFolderSong] = useState<Song | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const visible = songs.filter((song) => [song.title, song.artist?.name, song.genre?.name].join(" ").toLowerCase().includes(query.toLowerCase()));
  const flash = (message: string) => { setToast(message); window.setTimeout(() => setToast(null), 2500); };

  async function likeToggle(song: Song) {
    const result = song.is_liked ? await unlikeSong(song.id) : await likeSong(song.id);
    if (result.data) setSongs((current) => current.map((item) => item.id === song.id ? result.data! : item));
  }

  async function save(payload: SongPayload) {
    if (!editing) return;
    const result = await updateSong(editing.id, payload);
    if (result.data) {
      setSongs((current) => current.map((item) => item.id === result.data!.id ? result.data! : item));
      setEditing(null);
      flash("Song updated");
    }
  }

  async function reject(song: Song) {
    if (!window.confirm(`Reject "${song.title}"?`)) return;
    const result = await rejectSong(song.id);
    if (result.data) {
      setSongs((current) => current.filter((item) => item.id !== song.id));
      flash("Song rejected");
    }
  }

  async function remove(song: Song) {
    const result = await removeSongFromFolder(folder.id, song.id);
    if (result.data) {
      setSongs((current) => current.filter((item) => item.id !== song.id));
      flash("Removed from folder");
    }
  }

  async function add(folderId: number) {
    if (!folderSong) return;
    const result = await addSongToFolder(folderId, folderSong.id);
    if (result.data) {
      setFolderSong(null);
      flash("Added to folder");
    }
  }

  async function create(name: string) {
    await createFolder({ name, description: "Created from Add to Folder" });
    flash("Folder created");
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row"><SearchInput value={query} onChange={setQuery} placeholder={`Search inside ${folder.name}`} /><PlayAllButton songs={visible} onResult={flash} /></div>
      {visible.length ? (
        <SongTable songs={visible} onLikeToggle={likeToggle} onEdit={setEditing} onAddToFolder={setFolderSong} onReject={reject} onRemoveFromFolder={remove} />
      ) : (
        <EmptyState title="No songs in this folder view" description="Add songs from the Library or clear your search filter." />
      )}
      <SongFormModal open={Boolean(editing)} song={editing} onClose={() => setEditing(null)} onSubmit={save} />
      <AddToFolderModal open={Boolean(folderSong)} song={folderSong} folders={folders} onClose={() => setFolderSong(null)} onAdd={add} onCreateFolder={create} />
      <Toast message={toast} />
    </div>
  );
}
