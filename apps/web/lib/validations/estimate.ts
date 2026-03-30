import { EstimateStatus } from "@prisma/client";
import { z } from "zod";

import {
  documentBaseSchema,
  estimateStatusSchema,
} from "@/lib/validations/document-shared";

export const estimateSchema = documentBaseSchema.extend({
  expiryDate: z.coerce.date(),
  status: estimateStatusSchema.default(EstimateStatus.DRAFT),
});

export const estimateUpdateSchema = estimateSchema.partial();

export type EstimateInput = z.infer<typeof estimateSchema>;
export type EstimateUpdateInput = z.infer<typeof estimateUpdateSchema>;
