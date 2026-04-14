import { requireCompanyContext } from "@/lib/auth/session";
import {
  listItemsForCompany,
  listSavedItemsForCompany,
  type ItemRecord,
  type SavedItemRecord,
} from "@/features/items/server/service";
import type { ItemListItem, SavedItemOption } from "@/features/items/types";

function serializeSavedItem(item: SavedItemRecord): SavedItemOption {
  return {
    id: item.id,
    name: item.name,
    description: item.description ?? "",
    defaultRate: Number(item.defaultRate.toString()),
    unitType: item.unitType,
    defaultTaxRate: Number(item.defaultTaxRate.toString()),
    updatedAt: item.updatedAt.toISOString(),
  };
}

function serializeItem(item: ItemRecord): ItemListItem {
  return {
    ...serializeSavedItem(item),
    createdAt: item.createdAt.toISOString(),
  };
}

export async function listItemsQuery(): Promise<ItemListItem[]> {
  const context = await requireCompanyContext();
  const items = await listItemsForCompany(context.company.id);

  return items.map(serializeItem);
}

export async function listSavedItemOptionsQuery(): Promise<SavedItemOption[]> {
  const context = await requireCompanyContext();
  const items = await listSavedItemsForCompany(context.company.id);

  return items.map(serializeSavedItem);
}
