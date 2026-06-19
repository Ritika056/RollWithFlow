"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { FolderOpen, Plus } from "lucide-react";

import { ActionButton } from "@/components/ui/ActionButton";
import { Modal } from "@/components/ui/Modal";
import { Toast } from "@/components/ui/Toast";
import { createFolder } from "@/lib/api";
import type { Folder } from "@/types/api";

const pointPositions = [
  [18, 27], [43, 18], [69, 30], [29, 58], [57, 50], [82, 63], [13, 76], [46, 79], [73, 82], [90, 17], [7, 46], [88, 45],
] as const;

export function FoldersManager({ initialFolders }: { initialFolders: Folder[] }) {
  const [folders, setFolders] = useState(initialFolders);
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function save(formData: FormData) {
    const name = String(formData.get("name") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    if (!name) return setError("Folder name is required.");
    const result = await createFolder({ name, description });
    if (!result.data) return setError(result.error ?? "Folder creation failed.");
    setFolders((current) => [result.data!, ...current]);
    setOpen(false);
    setToast("Folder created");
    window.setTimeout(() => setToast(null), 2500);
  }

  return (
    <div className="space-y-5">
      {error ? <p className="rounded-2xl border border-cue/30 bg-cue/10 p-4 text-sm text-cue">{error}</p> : null}
      <div className="folder-galaxy full-page-galaxy">
        <Image src="/images/discovery-galaxy.png" alt="Folder galaxy map" fill sizes="(max-width: 768px) 100vw, 75vw" className="object-cover opacity-90" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_15%,rgba(5,6,20,0.45)_72%),linear-gradient(90deg,rgba(5,6,20,0.32),transparent_50%,rgba(5,6,20,0.38))]" />
        <div className="relative z-10 flex h-full items-start justify-between gap-4 p-5 md:p-7"><div><p className="text-xs font-semibold uppercase tracking-[0.22em] text-signal">Folders / constellation</p><h1 className="mt-2 text-3xl font-semibold text-white md:text-4xl">Your collection map</h1><p className="mt-2 max-w-md text-sm text-white/60">Choose a folder signal to open its tracks and workflows.</p></div><div className="flex flex-wrap justify-end gap-2"><span className="rounded-full border border-white/12 bg-deck-950/64 px-3 py-1.5 text-xs text-white/62 backdrop-blur">{folders.length} folders</span><ActionButton variant="primary" onClick={() => setOpen(true)}><Plus size={17} /> New Folder</ActionButton></div></div>
        {folders.map((folder, index) => {
          const [left, top] = pointPositions[index % pointPositions.length];
          return (
            <Link key={folder.id} href={`/folders/${folder.id}`} className="folder-galaxy-point" style={{ left: `${left}%`, top: `${top}%` }} aria-label={`Open ${folder.name}`}>
              <span className={folder.is_pinned ? "folder-galaxy-core folder-galaxy-core-pinned" : "folder-galaxy-core"}><FolderOpen size={15} /></span>
              <span className="folder-galaxy-label"><strong>{folder.name}</strong><small>{folder.songs_count ?? folder.song_count ?? 0} tracks</small></span>
            </Link>
          );
        })}
        {!folders.length ? <div className="absolute inset-0 z-10 grid place-items-center text-center"><div><FolderOpen className="mx-auto text-signal" size={28} /><p className="mt-3 font-semibold text-white">No folder signals yet</p><p className="mt-1 text-sm text-white/58">Create a folder to place it on your map.</p></div></div> : null}
      </div>

      <Modal open={open} title="Create Folder" onClose={() => setOpen(false)}>
        <form action={save} className="space-y-4">
          <label className="space-y-2 text-sm text-white/62"><span>Name</span><input name="name" className="h-11 w-full rounded-xl border border-white/10 bg-white/8 px-3 text-white outline-none transition focus:border-signal/30" /></label>
          <label className="space-y-2 text-sm text-white/62"><span>Description</span><textarea name="description" className="min-h-24 w-full rounded-xl border border-white/10 bg-white/8 p-3 text-white outline-none transition focus:border-signal/30" /></label>
          <div className="flex justify-end gap-2"><ActionButton type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</ActionButton><ActionButton type="submit" variant="primary">Create Folder</ActionButton></div>
        </form>
      </Modal>
      <Toast message={toast} />
    </div>
  );
}
