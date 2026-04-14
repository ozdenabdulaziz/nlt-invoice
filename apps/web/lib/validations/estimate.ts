import { DiscountType, EstimateStatus } from "@prisma/client";
import { z } from "zod";

import {
  documentBaseSchema,
  estimateStatusSchema,
  lineItemSchema,
} from "@/lib/validations/document-shared";

const dateStringSchema = z
  .string()
  .min(1, "Date is required.")
  .refine((value) => !Number.isNaN(Date.parse(value)), "Enter a valid date.");

const estimateFormLineItemSchema = z.object({
  savedItemId: z.string().cuid().optional(),
  name: z.string().trim().min(1, "Line item name is required."),
  description: z.string().trim().optional(),
  unitType: z.string().trim().min(1, "Unit type is required.").max(40, "Unit type is too long."),
  quantity: z.number().positive("Quantity must be greater than zero."),
  unitPrice: z.number().min(0, "Unit price cannot be negative."),
  taxRate: z.number().min(0, "Tax rate cannot be negative."),
  sortOrder: z.number().int().min(0).default(0),
});

export const estimateFormSchema = z.object({
  customerId: z.string().min(1, "Customer is required."),
  issueDate: dateStringSchema,
  expiryDate: dateStringSchema,
  status: estimateStatusSchema.default(EstimateStatus.DRAFT),
  currency: z.string().trim().min(3).default("CAD"),
  notes: z.string().trim().optional(),
  terms: z.string().trim().optional(),
  discountType: z.nativeEnum(DiscountType).nullable().optional(),
  discountValue: z.number().min(0, "Discount value cannot be negative.").optional(),
  items: z.array(estimateFormLineItemSchema).min(1, "At least one line item is required."),
}).superRefine((value, ctx) => {
  if (Date.parse(value.expiryDate) < Date.parse(value.issueDate)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["expiryDate"],
      message: "Expiry date must be on or after the issue date.",
    });
  }

  if (!value.discountType && value.discountValue !== undefined) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["discountType"],
      message: "Choose a discount type before entering a discount value.",
    });
  }
});

const estimateBaseSchema = documentBaseSchema.extend({
  expiryDate: z.coerce.date(),
  status: estimateStatusSchema.default(EstimateStatus.DRAFT),
});

export const estimateSchema = estimateBaseSchema
  .extend({
  })
  .superRefine((value, ctx) => {
    if (value.expiryDate < value.issueDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["expiryDate"],
        message: "Expiry date must be on or after the issue date.",
      });
    }

    if (!value.discountType && value.discountValue !== undefined && value.discountValue !== null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["discountType"],
        message: "Choose a discount type before entering a discount value.",
      });
    }
  });

export const estimateUpdateSchema = estimateBaseSchema.partial().superRefine((value, ctx) => {
  if (value.issueDate && value.expiryDate && value.expiryDate < value.issueDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["expiryDate"],
      message: "Expiry date must be on or after the issue date.",
    });
  }

  if (!value.discountType && value.discountValue !== undefined && value.discountValue !== null) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["discountType"],
      message: "Choose a discount type before entering a discount value.",
    });
  }
});

export const estimateLineItemInputSchema = lineItemSchema;

export type EstimateFormInput = z.input<typeof estimateFormSchema>;
export type EstimateInput = z.infer<typeof estimateSchema>;
export type EstimateUpdateInput = z.infer<typeof estimateUpdateSchema>;
