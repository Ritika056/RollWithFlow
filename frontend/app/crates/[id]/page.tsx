import { notFound } from "next/navigation";

import { SongAssignmentManager } from "@/components/collections/SongAssignmentManager";
import { PageHeader } from "@/components/ui/PageHeader";
import { getCrate, getCrateSongs, getSongs } from "@/lib/server-api";
export const dynamic = "force-dynamic";

export default async function CrateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const crateId = Number(id);
  const [{ data: crate }, { data: songs }, { data: allSongs }] = await Promise.all([getCrate(crateId), getCrateSongs(crateId), getSongs()]);
  if (!crate) notFound();
  return (
    <section className="space-y-7">
      <PageHeader eyebrow="DJ Crate" title={crate.name} description={crate.description ?? "Flexible DJ source pool."} />
      <SongAssignmentManager kind="crate" collectionId={crateId} songs={songs ?? []} allSongs={allSongs ?? []} />
    </section>
  );
}
