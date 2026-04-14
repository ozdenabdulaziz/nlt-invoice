export type SavedItemOption = {
  id: string;
  name: string;
  description: string;
  defaultRate: number;
  unitType: string;
  defaultTaxRate: number;
  updatedAt: string;
};

export type ItemListItem = SavedItemOption & {
  createdAt: string;
};
