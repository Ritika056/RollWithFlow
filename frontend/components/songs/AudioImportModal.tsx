"use client";

import { useEffect, useRef, useState } from "react";
import { FileAudio, FolderUp, LoaderCircle, PencilLine, Upload } from "lucide-react";

import { ActionButton } from "@/components/ui/ActionButton";
import { Modal } from "@/components/ui/Modal";
import { uploadAudioFiles } from "@/lib/api";
import type { AudioUploadResult } from "@/types/api";

const ACCEPTED = [".mp3", ".wav", ".flac", ".m4a", ".aiff", ".aif"];

function supported(files: FileList | null) {
  return Array.from(files ?? []).filter((file) => ACCEPTED.some((extension) => file.name.toLowerCase().endsWith(extension)));
}

export function AudioImportModal({ open, initialMode = "files", onClose, onImported, onManualEntry }: {
  open: boolean;
  initialMode?: "files" | "folder";
  onClose: () => void;
  onImported: (result: AudioUploadResult) => void;
  onManualEntry: () => void;
}) {
  const [mode, setMode] = useState<"files" | "folder">("files");
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const folderInput = useRef<HTMLInputElement>(null);

  useEffect(() => { folderInput.current?.setAttribute("webkitdirectory", ""); folderInput.current?.setAttribute("directory", ""); }, [mode]);
  useEffect(() => { if (open) { setMode(initialMode); setFiles([]); setError(null); setBusy(false); } }, [initialMode, open]);

  async function upload() {
    if (!files.length) return setError(mode === "folder" ? "Choose a folder containing audio files." : "Choose one or more audio files.");
    setBusy(true); setError(null);
    const result = await uploadAudioFiles(files);
    setBusy(false);
    if (!result.data) return setError(result.error ?? "Audio import failed.");
    onImported(result.data);
  }

  function changeMode(next: "files" | "folder") { setMode(next); setFiles([]); setError(null); }

  return <Modal open={open} title="Add music to your library" onClose={onClose}>
    <div className="flex flex-wrap gap-2 border-b border-white/8 pb-4"><Tab active={mode === "files"} icon={<Upload size={15} />} onClick={() => changeMode("files")}>Upload files</Tab><Tab active={mode === "folder"} icon={<FolderUp size={15} />} onClick={() => changeMode("folder")}>Import folder</Tab><Tab icon={<PencilLine size={15} />} onClick={onManualEntry}>Manual entry</Tab></div>
    <div className="py-6 text-center"><div className="mx-auto grid size-14 place-items-center rounded-2xl border border-signal/25 bg-signal/10 text-signal">{mode === "folder" ? <FolderUp size={25} /> : <FileAudio size={25} />}</div><h4 className="mt-4 text-lg font-semibold text-white">{mode === "folder" ? "Choose a music folder" : "Choose audio files"}</h4><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/55">{mode === "folder" ? "Select a folder and its supported audio files will be imported." : "Select one or more MP3, WAV, FLAC, M4A, or AIFF files."}</p><input key={mode} ref={mode === "folder" ? folderInput : undefined} type="file" multiple accept={ACCEPTED.join(",")} onChange={(event) => setFiles(supported(event.target.files))} className="mt-5 block w-full cursor-pointer rounded-xl border border-dashed border-white/15 bg-white/[0.035] p-3 text-sm text-white/60 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:border-signal/35" /></div>
    {files.length ? <p className="rounded-xl border border-signal/20 bg-signal/8 px-3 py-2 text-sm text-signal">{files.length} supported audio file{files.length === 1 ? "" : "s"} ready to import.</p> : null}
    {error ? <p className="mt-3 rounded-xl border border-cue/30 bg-cue/10 px-3 py-2 text-sm text-cue">{error}</p> : null}
    <div className="mt-5 flex justify-end gap-2"><ActionButton variant="ghost" onClick={onClose}>Cancel</ActionButton><ActionButton variant="primary" onClick={upload} disabled={busy}>{busy ? <LoaderCircle size={16} className="animate-spin" /> : <Upload size={16} />}{busy ? "Importing" : "Import audio"}</ActionButton></div>
  </Modal>;
}

function Tab({ active = false, icon, children, onClick }: { active?: boolean; icon: React.ReactNode; children: React.ReactNode; onClick: () => void }) {
  return <button type="button" onClick={onClick} className={`inline-flex h-9 items-center gap-2 rounded-xl px-3 text-sm font-medium transition ${active ? "bg-signal/15 text-signal" : "text-white/58 hover:bg-white/8 hover:text-white"}`}>{icon}{children}</button>;
}
