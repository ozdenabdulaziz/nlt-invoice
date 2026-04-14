import { DiscountType, EstimateStatus, InvoiceStatus } from "@/lib/constants/enums";
import { z } from "zod";

export const lineItemSchema = z.object({
  savedItemId: z.string().cuid().optional(),
  name: z.string().trim().min(1, "Line item name is required."),
  description: z.string().trim().optional(),
  unitType: z.string().trim().min(1, "Unit type is required.").max(40, "Unit type is too long."),
  quantity: z.coerce.number().positive("Quantity must be greater than zero."),
  unitPrice: z.coerce.number().min(0, "Unit price cannot be negative."),
  taxRate: z.coerce.number().min(0, "Tax rate cannot be negative.").default(0),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

export const documentBaseSchema = z.object({
  customerId: z.string().min(1, "Customer is required."),
  issueDate: z.coerce.date(),
  currency: z.string().trim().min(3).default("CAD"),
  notes: z.string().trim().optional(),
  terms: z.string().trim().optional(),
  discountType: z.nativeEnum(DiscountType).optional().nullable(),
  discountValue: z.coerce.number().min(0).optional().nullable(),
  items: z.array(lineItemSchema).min(1, "At least one line item is required."),
});

export const invoiceStatusSchema = z.nativeEnum(InvoiceStatus);
export const estimateStatusSchema = z.nativeEnum(EstimateStatus);

export type LineItemInput = z.infer<typeof lineItemSchema>;
