import { z } from "zod";

export const itemSchema = z.object({
  name: z.string().trim().min(1, "Item name is required.").max(120, "Item name is too long."),
  description: z.string().trim().max(1000, "Description is too long.").optional(),
  defaultRate: z.number().min(0, "Default rate cannot be negative."),
  unitType: z.string().trim().min(1, "Unit type is required.").max(40, "Unit type is too long."),
  defaultTaxRate: z.number().min(0, "Default tax rate cannot be negative."),
});

export type ItemFormInput = z.input<typeof itemSchema>;
export type ItemInput = z.infer<typeof itemSchema>;
