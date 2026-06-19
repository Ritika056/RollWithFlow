"use client";

import { useEffect, useState } from "react";

import { ActionButton } from "@/components/ui/ActionButton";
import { Modal } from "@/components/ui/Modal";
import type { Song, SongPayload, SourceType } from "@/types/api";

const sourceOptions: SourceType[] = ["manual", "local", "spotify", "youtube", "soundcloud", "beatport", "other"];

function numberValue(value: FormDataEntryValue | null) {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function SongFormModal({
  open,
  song,
  onClose,
  onSubmit,
}: {
  open: boolean;
  song: Song | null;
  onClose: () => void;
  onSubmit: (payload: SongPayload) => Promise<void>;
}) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => setError(null), [open, song]);

  async function handleSubmit(formData: FormData) {
    const title = String(formData.get("title") ?? "").trim();
    const bpm = numberValue(formData.get("bpm"));
    const energy = numberValue(formData.get("energy_level"));
    const rating = numberValue(formData.get("rating"));
    if (!title) return setError("Title is required.");
    if (bpm !== null && bpm < 0) return setError("BPM must be a positive number.");
    if (energy !== null && (energy < 1 || energy > 10)) return setError("Energy must be between 1 and 10.");
    if (rating !== null && (rating < 1 || rating > 5)) return setError("Rating must be between 1 and 5.");

    setBusy(true);
    await onSubmit({
      title,
      artist_name: String(formData.get("artist_name") ?? "").trim(),
      album_name: String(formData.get("album_name") ?? "").trim(),
      genre_name: String(formData.get("genre_name") ?? "").trim(),
      duration_seconds: numberValue(formData.get("duration_seconds")),
      bpm,
      musical_key: String(formData.get("musical_key") ?? "").trim(),
      energy_level: energy,
      rating,
      source_type: String(formData.get("source_type") ?? "manual") as SourceType,
      source_url: String(formData.get("source_url") ?? "").trim(),
      notes: String(formData.get("notes") ?? "").trim(),
      is_liked: formData.get("is_liked") === "on",
    });
    setBusy(false);
  }

  return (
    <Modal open={open} title={song ? "Edit Song" : "Create Manual Song"} onClose={onClose}>
      <form action={handleSubmit} className="space-y-4">
        {error ? <p className="rounded-xl border border-cue/30 bg-cue/10 p-3 text-sm text-cue">{error}</p> : null}
        <div className="grid gap-4 md:grid-cols-2">
          <Field name="title" label="Title" defaultValue={song?.title} required />
          <Field name="artist_name" label="Artist" defaultValue={song?.artist?.name} />
          <Field name="album_name" label="Album" defaultValue={song?.album?.title} />
          <Field name="genre_name" label="Genre" defaultValue={song?.genre?.name} />
          <Field name="duration_seconds" label="Duration seconds" type="number" defaultValue={song?.duration_seconds ?? ""} />
          <Field name="bpm" label="BPM" type="number" step="0.1" defaultValue={song?.bpm ?? ""} />
          <Field name="musical_key" label="Key" defaultValue={song?.musical_key ?? ""} />
          <Field name="energy_level" label="Energy 1-10" type="number" defaultValue={song?.energy_level ?? ""} />
          <Field name="rating" label="Rating 1-5" type="number" defaultValue={song?.rating ?? ""} />
          <label className="space-y-2 text-sm text-white/62">
            <span>Source Type</span>
            <select name="source_type" defaultValue={song?.sources[0]?.type ?? "manual"} className="h-11 w-full rounded-xl border border-white/10 bg-white/8 px-3 text-white outline-none transition focus:border-signal/30">
              {sourceOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
          <Field name="source_url" label="Source URL" defaultValue={song?.sources[0]?.url ?? ""} />
        </div>
        <label className="space-y-2 text-sm text-white/62">
          <span>Notes</span>
          <textarea name="notes" defaultValue={song?.notes ?? ""} className="min-h-24 w-full rounded-xl border border-white/10 bg-white/8 p-3 text-white outline-none transition focus:border-signal/30" />
        </label>
        <label className="flex items-center gap-3 text-sm text-white/72">
          <input name="is_liked" type="checkbox" defaultChecked={song?.is_liked ?? false} className="size-4 accent-[#58f0d1]" />
          Add to Liked Songs
        </label>
        <div className="flex justify-end gap-2">
          <ActionButton type="button" variant="ghost" onClick={onClose}>Cancel</ActionButton>
          <ActionButton type="submit" variant="primary" disabled={busy}>{busy ? "Saving..." : "Save Song"}</ActionButton>
        </div>
      </form>
    </Modal>
  );
}

function Field(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string; name: string }) {
  const { label, ...inputProps } = props;
  return (
    <label className="space-y-2 text-sm text-white/62">
      <span>{label}</span>
      <input {...inputProps} className="h-11 w-full rounded-xl border border-white/10 bg-white/8 px-3 text-white outline-none transition placeholder:text-white/30 focus:border-signal/30" />
    </label>
  );
}
