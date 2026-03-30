import { z } from "zod";

export const companySetupSchema = z.object({
  companyName: z.string().trim().min(2, "Company name is required."),
  legalName: z.string().trim().optional(),
  email: z.email("Enter a valid company email address.").trim().toLowerCase(),
  phone: z.string().trim().optional(),
  website: z.string().trim().optional(),
  addressLine1: z.string().trim().min(3, "Address line 1 is required."),
  addressLine2: z.string().trim().optional(),
  city: z.string().trim().min(2, "City is required."),
  province: z.string().trim().min(2, "Province is required."),
  postalCode: z.string().trim().min(3, "Postal code is required."),
  country: z.string().trim().min(2, "Country is required."),
  taxNumber: z.string().trim().optional(),
  currency: z.string().trim().min(3, "Currency is required."),
});

export type CompanySetupInput = z.infer<typeof companySetupSchema>;
