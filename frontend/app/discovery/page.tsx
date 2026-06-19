import { DiscoveryManager } from "@/components/discovery/DiscoveryManager";
import { PageHeader } from "@/components/ui/PageHeader";
import { getDiscovery, getProviderStatus } from "@/lib/server-api";

export default async function DiscoveryPage() {
  const [{ data: items }, { data: providerStatus }] = await Promise.all([getDiscovery(), getProviderStatus()]);
  return (
    <section className="space-y-7">
      <PageHeader eyebrow="Phase 6A Foundation" title="Discovery" description="Metadata-only discovery for Spotify and YouTube, with the existing mock workflow always available." />
      <DiscoveryManager items={items ?? []} providerStatus={providerStatus ?? { spotify: { configured: false, connected: false }, youtube: { configured: false } }} />
    </section>
  );
}
