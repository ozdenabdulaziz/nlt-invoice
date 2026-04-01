import { type Plan, Prisma } from "@prisma/client";

import {
  assertBillingAllowance,
  decrementCustomerMetric,
  incrementUsageMetric,
} from "@/features/billing/server/service";
import { prisma } from "@/lib/prisma/client";
import type {
  CustomerInput,
  CustomerUpdateInput,
} from "@/lib/validations/customer";
import { lockCompanyForWrite } from "@/server/shared/company-write";

const customerListArgs = Prisma.validator<Prisma.CustomerDefaultArgs>()({
  select: {
    id: true,
    type: true,
    name: true,
    companyName: true,
    email: true,
    phone: true,
    createdAt: true,
  },
});

const customerDetailArgs = Prisma.validator<Prisma.CustomerDefaultArgs>()({
  select: {
    id: true,
    type: true,
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
    notes: true,
    createdAt: true,
    updatedAt: true,
    _count: {
      select: {
        invoices: true,
        estimates: true,
      },
    },
  },
});

export type CustomerListItem = Prisma.CustomerGetPayload<typeof customerListArgs>;
export type CustomerDetailRecord = Prisma.CustomerGetPayload<typeof customerDetailArgs>;

type CustomerCompanyContext = {
  companyId: string;
  plan: Plan;
};

type CustomerEditableRecord = Pick<
  CustomerDetailRecord,
  | "type"
  | "name"
  | "companyName"
  | "email"
  | "phone"
  | "billingAddressLine1"
  | "billingAddressLine2"
  | "billingCity"
  | "billingProvince"
  | "billingPostalCode"
  | "billingCountry"
  | "shippingSameAsBilling"
  | "shippingAddressLine1"
  | "shippingAddressLine2"
  | "shippingCity"
  | "shippingProvince"
  | "shippingPostalCode"
  | "shippingCountry"
  | "notes"
>;

export class CustomerNotFoundError extends Error {
  constructor() {
    super("customer:not-found");
  }
}

export class CustomerDeleteBlockedError extends Error {
  constructor() {
    super("customer:delete-blocked");
  }
}

export function normalizeCustomerInput(input: CustomerInput) {
  const billingCountry = input.billingCountry || "Canada";
  const shippingCountry = input.shippingSameAsBilling
    ? billingCountry
    : input.shippingCountry || "Canada";

  return {
    type: input.type,
    name: input.name,
    companyName: input.companyName || null,
    email: input.email || null,
    phone: input.phone || null,
    billingAddressLine1: input.billingAddressLine1 || null,
    billingAddressLine2: input.billingAddressLine2 || null,
    billingCity: input.billingCity || null,
    billingProvince: input.billingProvince || null,
    billingPostalCode: input.billingPostalCode || null,
    billingCountry,
    shippingSameAsBilling: input.shippingSameAsBilling,
    shippingAddressLine1: input.shippingSameAsBilling
      ? null
      : input.shippingAddressLine1 || null,
    shippingAddressLine2: input.shippingSameAsBilling
      ? null
      : input.shippingAddressLine2 || null,
    shippingCity: input.shippingSameAsBilling ? null : input.shippingCity || null,
    shippingProvince: input.shippingSameAsBilling
      ? null
      : input.shippingProvince || null,
    shippingPostalCode: input.shippingSameAsBilling
      ? null
      : input.shippingPostalCode || null,
    shippingCountry,
    notes: input.notes || null,
  };
}

export function mergeCustomerInput(
  customer: CustomerEditableRecord,
  patch: CustomerUpdateInput,
): CustomerInput {
  return {
    type: patch.type ?? customer.type,
    name: patch.name ?? customer.name,
    companyName: patch.companyName ?? customer.companyName ?? "",
    email: patch.email ?? customer.email ?? "",
    phone: patch.phone ?? customer.phone ?? "",
    billingAddressLine1:
      patch.billingAddressLine1 ?? customer.billingAddressLine1 ?? "",
    billingAddressLine2:
      patch.billingAddressLine2 ?? customer.billingAddressLine2 ?? "",
    billingCity: patch.billingCity ?? customer.billingCity ?? "",
    billingProvince: patch.billingProvince ?? customer.billingProvince ?? "",
    billingPostalCode:
      patch.billingPostalCode ?? customer.billingPostalCode ?? "",
    billingCountry: patch.billingCountry ?? customer.billingCountry ?? "Canada",
    shippingSameAsBilling:
      patch.shippingSameAsBilling ?? customer.shippingSameAsBilling,
    shippingAddressLine1:
      patch.shippingAddressLine1 ?? customer.shippingAddressLine1 ?? "",
    shippingAddressLine2:
      patch.shippingAddressLine2 ?? customer.shippingAddressLine2 ?? "",
    shippingCity: patch.shippingCity ?? customer.shippingCity ?? "",
    shippingProvince: patch.shippingProvince ?? customer.shippingProvince ?? "",
    shippingPostalCode:
      patch.shippingPostalCode ?? customer.shippingPostalCode ?? "",
    shippingCountry: patch.shippingCountry ?? customer.shippingCountry ?? "Canada",
    notes: patch.notes ?? customer.notes ?? "",
  };
}

function getCustomerSearchWhere(search: string | undefined, companyId: string) {
  const normalizedSearch = search?.trim();

  if (!normalizedSearch) {
    return {
      companyId,
    };
  }

  return {
    companyId,
    OR: [
      {
        name: {
          contains: normalizedSearch,
          mode: "insensitive" as const,
        },
      },
      {
        companyName: {
          contains: normalizedSearch,
          mode: "insensitive" as const,
        },
      },
      {
        email: {
          contains: normalizedSearch,
          mode: "insensitive" as const,
        },
      },
    ],
  };
}

export async function listCustomersForCompany(
  companyId: string,
  search?: string,
) {
  return prisma.customer.findMany({
    ...customerListArgs,
    take: 100, // Safe list fetching bound
    where: getCustomerSearchWhere(search, companyId),
    orderBy: [
      {
        createdAt: "desc",
      },
      {
        name: "asc",
      },
    ],
  });
}

export async function listCustomerRecordsForCompany(
  companyId: string,
  search?: string,
) {
  return prisma.customer.findMany({
    where: getCustomerSearchWhere(search, companyId),
    take: 100, // Safe list fetching bound
    orderBy: [
      {
        createdAt: "desc",
      },
      {
        name: "asc",
      },
    ],
  });
}

export async function getCustomerByIdForCompany(
  customerId: string,
  companyId: string,
) {
  return prisma.customer.findFirst({
    ...customerDetailArgs,
    where: {
      id: customerId,
      companyId,
    },
  });
}

export async function createCustomerForCompany(
  context: CustomerCompanyContext,
  input: CustomerInput,
) {
  return prisma.$transaction(async (tx) => {
    await lockCompanyForWrite(tx, context.companyId);
    await assertBillingAllowance(
      tx,
      context,
      "customer",
    );

    const customer = await tx.customer.create({
      data: {
        companyId: context.companyId,
        ...normalizeCustomerInput(input),
      },
    });

    await incrementUsageMetric(tx, context.companyId, "customer");

    return customer;
  });
}

export async function updateCustomerForCompany(
  customerId: string,
  companyId: string,
  input: CustomerInput,
) {
  const existingCustomer = await prisma.customer.findFirst({
    where: {
      id: customerId,
      companyId,
    },
    select: {
      id: true,
    },
  });

  if (!existingCustomer) {
    throw new CustomerNotFoundError();
  }

  return prisma.customer.update({
    where: {
      id: existingCustomer.id,
    },
    data: normalizeCustomerInput(input),
  });
}

export async function deleteCustomerForCompany(
  customerId: string,
  companyId: string,
) {
  const customer = await prisma.customer.findFirst({
    where: {
      id: customerId,
      companyId,
    },
    select: {
      id: true,
      _count: {
        select: {
          invoices: true,
          estimates: true,
        },
      },
    },
  });

  if (!customer) {
    throw new CustomerNotFoundError();
  }

  if (customer._count.invoices > 0 || customer._count.estimates > 0) {
    throw new CustomerDeleteBlockedError();
  }

  await prisma.$transaction(async (tx) => {
    await tx.customer.delete({
      where: {
        id: customer.id,
      },
    });

    await decrementCustomerMetric(tx, companyId);
  });
}
