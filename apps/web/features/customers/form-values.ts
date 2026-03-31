import { CustomerType } from "@/lib/constants/enums";
import type { CustomerInput } from "@/lib/validations/customer";

export function getEmptyCustomerFormValues(): CustomerInput {
  return {
    type: CustomerType.BUSINESS,
    name: "",
    companyName: "",
    email: "",
    phone: "",
    billingAddressLine1: "",
    billingAddressLine2: "",
    billingCity: "",
    billingProvince: "",
    billingPostalCode: "",
    billingCountry: "Canada",
    shippingSameAsBilling: true,
    shippingAddressLine1: "",
    shippingAddressLine2: "",
    shippingCity: "",
    shippingProvince: "",
    shippingPostalCode: "",
    shippingCountry: "Canada",
    notes: "",
  };
}

export function mapCustomerToFormValues(customer: {
  type: CustomerType;
  name: string;
  companyName: string | null;
  email: string | null;
  phone: string | null;
  billingAddressLine1: string | null;
  billingAddressLine2: string | null;
  billingCity: string | null;
  billingProvince: string | null;
  billingPostalCode: string | null;
  billingCountry: string | null;
  shippingSameAsBilling: boolean;
  shippingAddressLine1: string | null;
  shippingAddressLine2: string | null;
  shippingCity: string | null;
  shippingProvince: string | null;
  shippingPostalCode: string | null;
  shippingCountry: string | null;
  notes: string | null;
}): CustomerInput {
  return {
    type: customer.type,
    name: customer.name,
    companyName: customer.companyName ?? "",
    email: customer.email ?? "",
    phone: customer.phone ?? "",
    billingAddressLine1: customer.billingAddressLine1 ?? "",
    billingAddressLine2: customer.billingAddressLine2 ?? "",
    billingCity: customer.billingCity ?? "",
    billingProvince: customer.billingProvince ?? "",
    billingPostalCode: customer.billingPostalCode ?? "",
    billingCountry: customer.billingCountry ?? "Canada",
    shippingSameAsBilling: customer.shippingSameAsBilling,
    shippingAddressLine1: customer.shippingAddressLine1 ?? "",
    shippingAddressLine2: customer.shippingAddressLine2 ?? "",
    shippingCity: customer.shippingCity ?? "",
    shippingProvince: customer.shippingProvince ?? "",
    shippingPostalCode: customer.shippingPostalCode ?? "",
    shippingCountry: customer.shippingCountry ?? "Canada",
    notes: customer.notes ?? "",
  };
}
