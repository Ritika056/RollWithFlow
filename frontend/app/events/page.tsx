import { EventsManager } from "@/components/events/EventsManager";
import { PageHeader } from "@/components/ui/PageHeader";
import { getEvents } from "@/lib/server-api";
export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const { data } = await getEvents();
  return <section className="space-y-7"><PageHeader eyebrow="Event preparation" title="Events" description="Plan timelines, checklist readiness, and music links for every DJ event." /><EventsManager events={data ?? []} /></section>;
}
