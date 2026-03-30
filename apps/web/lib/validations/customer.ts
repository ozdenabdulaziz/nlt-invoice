import { CustomerType } from "@prisma/client";
import { z } from "zod";

export const customerSchema = z.object({
  type: z.nativeEnum(CustomerType).default(CustomerType.BUSINESS),
  name: z.string().trim().min(2, "Customer name is required."),
  companyName: z.string().trim().optional(),
  email: z.email("Enter a valid email address.").trim().toLowerCase().optional().or(z.literal("")),
  phone: z.string().trim().optional(),
  billingAddressLine1: z.string().trim().optional(),
  billingAddressLine2: z.string().trim().optional(),
  billingCity: z.string().trim().optional(),
  billingProvince: z.string().trim().optional(),
  billingPostalCode: z.string().trim().optional(),
  billingCountry: z.string().trim().optional(),
  shippingSameAsBilling: z.boolean().default(true),
  shippingAddressLine1: z.string().trim().optional(),
  shippingAddressLine2: z.string().trim().optional(),
  shippingCity: z.string().trim().optional(),
  shippingProvince: z.string().trim().optional(),
  shippingPostalCode: z.string().trim().optional(),
  shippingCountry: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

export const customerUpdateSchema = customerSchema.partial();

export type CustomerInput = z.infer<typeof customerSchema>;
export type CustomerUpdateInput = z.infer<typeof customerUpdateSchema>;
