import { DiscountType, InvoiceStatus } from "@/lib/constants/enums";
import { z } from "zod";

import { calculateDocumentTotals } from "@/lib/calculations";
import {
  documentBaseSchema,
  lineItemSchema,
} from "@/lib/validations/document-shared";

const dateStringSchema = z
  .string()
  .min(1, "Date is required.")
  .refine((value) => !Number.isNaN(Date.parse(value)), "Enter a valid date.");

const invoiceFormLineItemSchema = z.object({
  savedItemId: z.string().cuid().optional(),
  name: z.string().trim().min(1, "Line item name is required."),
  description: z.string().trim().optional(),
  unitType: z.string().trim().min(1, "Unit type is required.").max(40, "Unit type is too long."),
  quantity: z.number().positive("Quantity must be greater than zero."),
  unitPrice: z.number().min(0, "Unit price cannot be negative."),
  taxRate: z.number().min(0, "Tax rate cannot be negative."),
  sortOrder: z.number().int().min(0).default(0),
});

const invoiceEditableStatusSchema = z.enum([
  InvoiceStatus.DRAFT,
  InvoiceStatus.SENT,
]);

export const invoiceFormSchema = z
  .object({
    customerId: z.string().min(1, "Customer is required."),
    issueDate: dateStringSchema,
    dueDate: dateStringSchema,
    status: invoiceEditableStatusSchema.default(InvoiceStatus.DRAFT),
    currency: z.string().trim().min(3).default("CAD"),
    notes: z.string().trim().optional(),
    terms: z.string().trim().optional(),
    discountType: z.nativeEnum(DiscountType).nullable().optional(),
    discountValue: z.number().min(0, "Discount value cannot be negative.").optional(),
    amountPaid: z.number().min(0, "Amount paid cannot be negative.").default(0),
    items: z.array(invoiceFormLineItemSchema).min(1, "At least one line item is required."),
  })
  .superRefine((value, ctx) => {
    if (Date.parse(value.dueDate) < Date.parse(value.issueDate)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["dueDate"],
        message: "Due date must be on or after the issue date.",
      });
    }

    if (!value.discountType && value.discountValue !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["discountType"],
        message: "Choose a discount type before entering a discount value.",
      });
    }

    const totals = calculateDocumentTotals({
      items: value.items.map((item) => ({
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxRate: item.taxRate,
      })),
      discountType: value.discountType ?? null,
      discountValue: value.discountType ? value.discountValue ?? 0 : 0,
      amountPaid: value.amountPaid,
    });

    if (value.amountPaid > totals.total) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["amountPaid"],
        message: "Amount paid cannot exceed the invoice total.",
      });
    }
  });

const invoiceBaseSchema = documentBaseSchema.extend({
  dueDate: z.coerce.date(),
  status: invoiceEditableStatusSchema.default(InvoiceStatus.DRAFT),
  amountPaid: z.coerce.number().min(0).default(0),
});

export const invoiceSchema = invoiceBaseSchema
  .extend({
  })
  .superRefine((value, ctx) => {
    if (value.dueDate < value.issueDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["dueDate"],
        message: "Due date must be on or after the issue date.",
      });
    }

    if (!value.discountType && value.discountValue !== undefined && value.discountValue !== null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["discountType"],
        message: "Choose a discount type before entering a discount value.",
      });
    }

    const totals = calculateDocumentTotals({
      items: value.items.map((item) => ({
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxRate: item.taxRate,
      })),
      discountType: value.discountType ?? null,
      discountValue: value.discountType ? value.discountValue ?? 0 : 0,
      amountPaid: value.amountPaid,
    });

    if (value.amountPaid > totals.total) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["amountPaid"],
        message: "Amount paid cannot exceed the invoice total.",
      });
    }
  });

export const invoiceUpdateSchema = invoiceBaseSchema.partial().superRefine((value, ctx) => {
  if (value.issueDate && value.dueDate && value.dueDate < value.issueDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["dueDate"],
      message: "Due date must be on or after the issue date.",
    });
  }

  if (!value.discountType && value.discountValue !== undefined && value.discountValue !== null) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["discountType"],
      message: "Choose a discount type before entering a discount value.",
    });
  }

  if (value.items && value.amountPaid !== undefined) {
    const totals = calculateDocumentTotals({
      items: value.items.map((item) => ({
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxRate: item.taxRate,
      })),
      discountType: value.discountType ?? null,
      discountValue: value.discountType ? value.discountValue ?? 0 : 0,
      amountPaid: value.amountPaid,
    });

    if (value.amountPaid > totals.total) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["amountPaid"],
        message: "Amount paid cannot exceed the invoice total.",
      });
    }
  }
});

export const invoiceLineItemInputSchema = lineItemSchema;

export const invoicePaymentSchema = z.object({
  paymentMethod: z.string().trim().max(100, "Payment method is too long.").optional(),
  paymentNote: z.string().trim().max(500, "Payment note is too long.").optional(),
});

export type InvoiceFormInput = z.input<typeof invoiceFormSchema>;
export type InvoiceInput = z.infer<typeof invoiceSchema>;
export type InvoiceUpdateInput = z.infer<typeof invoiceUpdateSchema>;
export type InvoicePaymentInput = z.infer<typeof invoicePaymentSchema>;
