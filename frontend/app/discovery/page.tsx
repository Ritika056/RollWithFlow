import { DiscoveryManager } from "@/components/discovery/DiscoveryManager";
import { PageHeader } from "@/components/ui/PageHeader";
import { getDiscovery, getDiscoveryFetchRuns, getDiscoveryMonitors, getProviderStatus } from "@/lib/server-api";

export default async function DiscoveryPage() {
  const [{ data: items }, { data: providerStatus }, { data: monitors }, { data: fetchRuns }] = await Promise.all([getDiscovery(), getProviderStatus(), getDiscoveryMonitors(), getDiscoveryFetchRuns()]);
  return (
    <section className="space-y-7">
      <PageHeader eyebrow="Phase 6B Local Foundation" title="Discovery" description="Local monitor runs, provider metadata search, and the existing mock workflow. No audio is downloaded or stored." />
      <DiscoveryManager items={items ?? []} monitors={monitors ?? []} fetchRuns={fetchRuns ?? []} providerStatus={providerStatus ?? { spotify: { configured: false, connected: false }, youtube: { configured: false } }} />
    </section>
  );
}
