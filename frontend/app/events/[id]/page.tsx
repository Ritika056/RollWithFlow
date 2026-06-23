import { notFound } from "next/navigation";
import { EventDetailManager } from "@/components/events/EventDetailManager";
import { getCrates, getEvent, getMixes, getPlaylists } from "@/lib/server-api";
export const dynamic = "force-dynamic";

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  const [event, playlists, crates, mixes] = await Promise.all([getEvent(id), getPlaylists(), getCrates(), getMixes()]);
  if (!event.data) notFound();
  return <EventDetailManager event={event.data} playlists={playlists.data ?? []} crates={crates.data ?? []} mixes={mixes.data ?? []} />;
}
