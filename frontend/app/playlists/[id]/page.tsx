import { notFound } from "next/navigation";

import { SongAssignmentManager } from "@/components/collections/SongAssignmentManager";
import { PageHeader } from "@/components/ui/PageHeader";
import { getPlaylist, getPlaylistSongs, getSongs } from "@/lib/server-api";

export default async function PlaylistDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const playlistId = Number(id);
  const [{ data: playlist }, { data: songs }, { data: allSongs }] = await Promise.all([getPlaylist(playlistId), getPlaylistSongs(playlistId), getSongs()]);
  if (!playlist) notFound();
  return (
    <section className="space-y-7">
      <PageHeader eyebrow="Playlist Builder" title={playlist.name} description={playlist.description ?? "Add songs, then edit playlist-song notes via the API as needed."} />
      <SongAssignmentManager kind="playlist" collectionId={playlistId} songs={songs ?? []} allSongs={allSongs ?? []} />
    </section>
  );
}
