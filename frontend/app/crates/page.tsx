import { CollectionManager } from "@/components/collections/CollectionManagers";
import { PageHeader } from "@/components/ui/PageHeader";
import { getCrates } from "@/lib/server-api";

export default async function CratesPage() {
  const { data } = await getCrates();
  return (
    <section className="space-y-7">
      <PageHeader eyebrow="Phase 3" title="DJ Crates" description="Flexible performance pools for energy, mood, and event prep." />
      <CollectionManager kind="crate" items={data ?? []} />
    </section>
  );
}
