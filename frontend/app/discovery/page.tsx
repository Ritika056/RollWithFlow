import { DiscoveryManager } from "@/components/discovery/DiscoveryManager";
import { PageHeader } from "@/components/ui/PageHeader";
import { getDiscovery } from "@/lib/server-api";

export default async function DiscoveryPage() {
  const { data } = await getDiscovery();
  return (
    <section className="space-y-7">
      <PageHeader eyebrow="Phase 4 Foundation" title="Discovery" description="Mock discovery history, manual items, save-to-library, reject/restore, and daily fetch placeholder. Real Spotify/YouTube credentials stay pending." />
      <DiscoveryManager items={data ?? []} />
    </section>
  );
}
