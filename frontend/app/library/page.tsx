import { LibraryManager } from "@/components/songs/LibraryManager";
import { PageHeader } from "@/components/ui/PageHeader";
import { getFolders, getSongs } from "@/lib/server-api";
export const dynamic = "force-dynamic";

export default async function LibraryPage() {
  const [{ data: songs, error: songsError }, { data: folders }] = await Promise.all([getSongs(), getFolders()]);

  return (
    <section className="space-y-7">
      <PageHeader
        eyebrow="Music Library"
        title="Command your active song library"
        description="Create manual records, clean metadata, filter by DJ-ready fields, like tracks, file songs into folders, and reject songs without hard deleting them."
      />
      {songsError ? <p className="rounded-2xl border border-cue/30 bg-cue/10 p-4 text-sm text-cue">{songsError}</p> : null}
      <LibraryManager initialSongs={songs ?? []} initialFolders={folders ?? []} />
    </section>
  );
}
