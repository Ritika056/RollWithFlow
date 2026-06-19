import { Heart } from "lucide-react";

import { LibraryManager } from "@/components/songs/LibraryManager";
import { Badge } from "@/components/ui/Badge";
import { PageHeader } from "@/components/ui/PageHeader";
import { getFolders, getLikedSongs } from "@/lib/server-api";

export default async function LikedSongsPage() {
  const [{ data: songs, error }, { data: folders }] = await Promise.all([getLikedSongs(), getFolders()]);

  return (
    <section className="space-y-7">
      <PageHeader
        eyebrow="Intentional saves"
        title="Liked Songs"
        description="Only active songs you explicitly liked appear here. Unliking removes a track from this view without deleting it."
        actions={<Badge tone="cue"><Heart size={14} /> {songs?.length ?? 0} liked</Badge>}
      />
      {error ? <p className="rounded-2xl border border-cue/30 bg-cue/10 p-4 text-sm text-cue">{error}</p> : null}
      <LibraryManager initialSongs={songs ?? []} initialFolders={folders ?? []} mode="liked" />
    </section>
  );
}
