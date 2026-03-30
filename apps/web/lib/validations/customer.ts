import { CustomerType } from "@/lib/constants/enums";
import { z } from "zod";

const optionalText = z.string().trim().max(255, "Value is too long.").optional();
const optionalNote = z.string().trim().max(2000, "Notes are too long.").optional();

export const customerSchema = z.object({
  type: z.nativeEnum(CustomerType),
  name: z.string().trim().min(2, "Customer name is required."),
  companyName: optionalText,
  email: z.email("Enter a valid email address.").trim().toLowerCase().optional().or(z.literal("")),
  phone: optionalText,
  billingAddressLine1: optionalText,
  billingAddressLine2: optionalText,
  billingCity: optionalText,
  billingProvince: optionalText,
  billingPostalCode: optionalText,
  billingCountry: optionalText,
  shippingSameAsBilling: z.boolean(),
  shippingAddressLine1: optionalText,
  shippingAddressLine2: optionalText,
  shippingCity: optionalText,
  shippingProvince: optionalText,
  shippingPostalCode: optionalText,
  shippingCountry: optionalText,
  notes: optionalNote,
});

export const customerUpdateSchema = customerSchema.partial();

export type CustomerInput = z.infer<typeof customerSchema>;
export type CustomerUpdateInput = z.infer<typeof customerUpdateSchema>;
