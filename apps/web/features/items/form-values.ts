import type { ItemListItem } from "@/features/items/types";
import type { ItemFormInput } from "@/lib/validations/item";

export function getEmptyItemFormValues(): ItemFormInput {
  return {
    name: "",
    description: "",
    defaultRate: 0,
    unitType: "each",
    defaultTaxRate: 0,
  };
}

export function mapItemToFormValues(item: ItemListItem): ItemFormInput {
  return {
    name: item.name,
    description: item.description,
    defaultRate: item.defaultRate,
    unitType: item.unitType,
    defaultTaxRate: item.defaultTaxRate,
  };
}
