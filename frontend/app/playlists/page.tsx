import { CollectionManager } from "@/components/collections/CollectionManagers";
import { getPlaylists } from "@/lib/server-api";
export const dynamic = "force-dynamic";

export default async function PlaylistsPage() {
  const { data } = await getPlaylists();
  return (
    <section>
      <CollectionManager kind="playlist" items={data ?? []} />
    </section>
  );
}
