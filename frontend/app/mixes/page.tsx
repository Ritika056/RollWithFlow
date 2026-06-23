import { CollectionManager } from "@/components/collections/CollectionManagers";
import { getMixes } from "@/lib/server-api";
export const dynamic = "force-dynamic";

export default async function MixesPage() {
  const { data } = await getMixes();
  return (
    <section>
      <CollectionManager kind="mix" items={data ?? []} />
    </section>
  );
}
