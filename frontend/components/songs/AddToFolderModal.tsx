"use client";

import { useState } from "react";
import { FolderPlus, Plus } from "lucide-react";

import { ActionButton } from "@/components/ui/ActionButton";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import type { Folder, Song } from "@/types/api";

export function AddToFolderModal({
  open,
  song,
  folders,
  onClose,
  onAdd,
  onCreateFolder,
}: {
  open: boolean;
  song: Song | null;
  folders: Folder[];
  onClose: () => void;
  onAdd: (folderId: number) => Promise<void>;
  onCreateFolder: (name: string) => Promise<void>;
}) {
  const [name, setName] = useState("");

  return (
    <Modal open={open} title={song ? `Add "${song.title}" to Folder` : "Add to Folder"} onClose={onClose}>
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          {folders.map((folder) => {
            const alreadyInFolder = song?.folders.some((item) => item.id === folder.id);
            return (
              <button
                key={folder.id}
                disabled={alreadyInFolder}
                onClick={() => onAdd(folder.id)}
                className="rounded-3xl border border-white/10 bg-white/7 p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:border-signal/28 hover:bg-white/10 disabled:opacity-45 disabled:hover:translate-y-0"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="font-semibold text-white">{folder.name}</p>
                  {folder.is_pinned ? <Badge tone="signal">Pinned</Badge> : null}
                </div>
                <p className="mt-2 text-xs text-white/48">{folder.songs_count ?? folder.song_count} songs</p>
              </button>
            );
          })}
        </div>
        <div className="rounded-3xl border border-white/10 bg-deck-925/58 p-4">
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-white"><FolderPlus size={16} /> Create new folder</p>
          <div className="flex gap-2">
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Folder name" className="h-10 min-w-0 flex-1 rounded-xl border border-white/10 bg-white/8 px-3 text-sm text-white outline-none transition focus:border-signal/30" />
            <ActionButton onClick={async () => { if (name.trim()) { await onCreateFolder(name.trim()); setName(""); } }}>
              <Plus size={16} /> Create
            </ActionButton>
          </div>
        </div>
      </div>
    </Modal>
  );
}
