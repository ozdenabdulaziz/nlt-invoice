import { requireCompanyContext } from "@/lib/auth/session";
import { ItemsLibrary } from "@/features/items/components/items-library";
import { listItemsQuery } from "@/features/items/server/queries";

export const dynamic = "force-dynamic";

export default async function ItemsPage() {
  const context = await requireCompanyContext();
  const items = await listItemsQuery();

  return <ItemsLibrary items={items} currency={context.company.currency} />;
}
