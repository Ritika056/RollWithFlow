import { FoldersManager } from "@/components/folders/FoldersManager";
import { getFolders } from "@/lib/server-api";
export const dynamic = "force-dynamic";

export default async function FoldersPage() {
  const { data: folders, error } = await getFolders();

  return (
    <section className="space-y-7">
      {error ? <p className="rounded-2xl border border-cue/30 bg-cue/10 p-4 text-sm text-cue">{error}</p> : null}
      <FoldersManager initialFolders={folders ?? []} />
    </section>
  );
}
