import { InvoiceStatus } from "@prisma/client";
import { z } from "zod";

import {
  documentBaseSchema,
  invoiceStatusSchema,
} from "@/lib/validations/document-shared";

export const invoiceSchema = documentBaseSchema.extend({
  dueDate: z.coerce.date(),
  status: invoiceStatusSchema.default(InvoiceStatus.DRAFT),
  amountPaid: z.coerce.number().min(0).default(0),
});

export const invoiceUpdateSchema = invoiceSchema.partial();

export type InvoiceInput = z.infer<typeof invoiceSchema>;
export type InvoiceUpdateInput = z.infer<typeof invoiceUpdateSchema>;
