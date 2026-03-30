import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma/client";

type DbClient = typeof prisma | Prisma.TransactionClient;

const companySnapshotArgs = Prisma.validator<Prisma.CompanyDefaultArgs>()({
  select: {
    companyName: true,
    email: true,
    phone: true,
    website: true,
    addressLine1: true,
    addressLine2: true,
    city: true,
    province: true,
    postalCode: true,
    country: true,
    taxNumber: true,
  },
});

const customerSnapshotArgs = Prisma.validator<Prisma.CustomerDefaultArgs>()({
  select: {
    name: true,
    companyName: true,
    email: true,
    phone: true,
    billingAddressLine1: true,
    billingAddressLine2: true,
    billingCity: true,
    billingProvince: true,
    billingPostalCode: true,
    billingCountry: true,
    shippingSameAsBilling: true,
    shippingAddressLine1: true,
    shippingAddressLine2: true,
    shippingCity: true,
    shippingProvince: true,
    shippingPostalCode: true,
    shippingCountry: true,
  },
});

type CompanySnapshotSource = Prisma.CompanyGetPayload<typeof companySnapshotArgs>;
type CustomerSnapshotSource = Prisma.CustomerGetPayload<typeof customerSnapshotArgs>;

export type DocumentSnapshotFields = {
  companyName: string | null;
  companyEmail: string | null;
  companyPhone: string | null;
  companyWebsite: string | null;
  companyAddressLine1: string | null;
  companyAddressLine2: string | null;
  companyCity: string | null;
  companyProvince: string | null;
  companyPostalCode: string | null;
  companyCountry: string | null;
  companyTaxNumber: string | null;
  customerName: string | null;
  customerCompanyName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  customerBillingAddressLine1: string | null;
  customerBillingAddressLine2: string | null;
  customerBillingCity: string | null;
  customerBillingProvince: string | null;
  customerBillingPostalCode: string | null;
  customerBillingCountry: string | null;
  customerShippingSameAsBilling: boolean;
  customerShippingAddressLine1: string | null;
  customerShippingAddressLine2: string | null;
  customerShippingCity: string | null;
  customerShippingProvince: string | null;
  customerShippingPostalCode: string | null;
  customerShippingCountry: string | null;
};

export async function getDocumentSnapshotForCompanyCustomer(
  db: DbClient,
  companyId: string,
  customerId: string,
) {
  const [company, customer] = await Promise.all([
    db.company.findUnique({
      ...companySnapshotArgs,
      where: {
        id: companyId,
      },
    }),
    db.customer.findFirst({
      ...customerSnapshotArgs,
      where: {
        id: customerId,
        companyId,
      },
    }),
  ]);

  if (!company || !customer) {
    return null;
  }

  return buildDocumentSnapshotFields(company, customer);
}

export function buildDocumentSnapshotFields(
  company: CompanySnapshotSource,
  customer: CustomerSnapshotSource,
): DocumentSnapshotFields {
  return {
    companyName: company.companyName,
    companyEmail: company.email,
    companyPhone: company.phone,
    companyWebsite: company.website,
    companyAddressLine1: company.addressLine1,
    companyAddressLine2: company.addressLine2,
    companyCity: company.city,
    companyProvince: company.province,
    companyPostalCode: company.postalCode,
    companyCountry: company.country,
    companyTaxNumber: company.taxNumber,
    customerName: customer.name,
    customerCompanyName: customer.companyName,
    customerEmail: customer.email,
    customerPhone: customer.phone,
    customerBillingAddressLine1: customer.billingAddressLine1,
    customerBillingAddressLine2: customer.billingAddressLine2,
    customerBillingCity: customer.billingCity,
    customerBillingProvince: customer.billingProvince,
    customerBillingPostalCode: customer.billingPostalCode,
    customerBillingCountry: customer.billingCountry,
    customerShippingSameAsBilling: customer.shippingSameAsBilling,
    customerShippingAddressLine1: customer.shippingAddressLine1,
    customerShippingAddressLine2: customer.shippingAddressLine2,
    customerShippingCity: customer.shippingCity,
    customerShippingProvince: customer.shippingProvince,
    customerShippingPostalCode: customer.shippingPostalCode,
    customerShippingCountry: customer.shippingCountry,
  };
}

export function pickDocumentSnapshotFields(
  source: DocumentSnapshotFields,
): DocumentSnapshotFields {
  return {
    companyName: source.companyName,
    companyEmail: source.companyEmail,
    companyPhone: source.companyPhone,
    companyWebsite: source.companyWebsite,
    companyAddressLine1: source.companyAddressLine1,
    companyAddressLine2: source.companyAddressLine2,
    companyCity: source.companyCity,
    companyProvince: source.companyProvince,
    companyPostalCode: source.companyPostalCode,
    companyCountry: source.companyCountry,
    companyTaxNumber: source.companyTaxNumber,
    customerName: source.customerName,
    customerCompanyName: source.customerCompanyName,
    customerEmail: source.customerEmail,
    customerPhone: source.customerPhone,
    customerBillingAddressLine1: source.customerBillingAddressLine1,
    customerBillingAddressLine2: source.customerBillingAddressLine2,
    customerBillingCity: source.customerBillingCity,
    customerBillingProvince: source.customerBillingProvince,
    customerBillingPostalCode: source.customerBillingPostalCode,
    customerBillingCountry: source.customerBillingCountry,
    customerShippingSameAsBilling: source.customerShippingSameAsBilling,
    customerShippingAddressLine1: source.customerShippingAddressLine1,
    customerShippingAddressLine2: source.customerShippingAddressLine2,
    customerShippingCity: source.customerShippingCity,
    customerShippingProvince: source.customerShippingProvince,
    customerShippingPostalCode: source.customerShippingPostalCode,
    customerShippingCountry: source.customerShippingCountry,
  };
}
