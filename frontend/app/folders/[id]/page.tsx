import Link from "next/link";
import { notFound } from "next/navigation";

import { FolderDetailManager } from "@/components/folders/FolderDetailManager";
import { Badge } from "@/components/ui/Badge";
import { PageHeader } from "@/components/ui/PageHeader";
import { getFolder, getFolders, getFolderSongs } from "@/lib/server-api";

export default async function FolderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const folderId = Number(id);
  if (!Number.isFinite(folderId)) notFound();

  const [{ data: folder }, { data: songs }, { data: folders }] = await Promise.all([
    getFolder(folderId),
    getFolderSongs(folderId),
    getFolders(),
  ]);
  if (!folder) notFound();

  return (
    <section className="space-y-7">
      <Link href="/folders" className="text-sm text-white/52 transition hover:text-signal">Back to folders</Link>
      <PageHeader
        eyebrow="Folder Detail"
        title={folder.name}
        description={folder.description ?? "Songs filed into this folder are shown below."}
        actions={<Badge tone={folder.is_pinned ? "signal" : "neutral"}>{folder.songs_count ?? folder.song_count} songs</Badge>}
      />
      <FolderDetailManager folder={folder} initialSongs={songs ?? []} folders={folders ?? []} />
    </section>
  );
}
