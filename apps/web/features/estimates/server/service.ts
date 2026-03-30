import { EstimateStatus, type Plan, Prisma } from "@prisma/client";

import { calculateDocumentTotals, calculateLineTotal } from "@/lib/calculations";
import { createPublicId, formatDocumentNumber } from "@/lib/document-ids";
import {
  assertPlanLimitAvailable,
  incrementUsageMetric,
} from "@/lib/limits";
import { prisma } from "@/lib/prisma/client";
import type { EstimateInput } from "@/lib/validations/estimate";

const estimateCustomerOptionArgs =
  Prisma.validator<Prisma.CustomerDefaultArgs>()({
    select: {
      id: true,
      name: true,
      companyName: true,
    },
  });

const estimateListArgs = Prisma.validator<Prisma.EstimateDefaultArgs>()({
  select: {
    id: true,
    publicId: true,
    estimateNumber: true,
    status: true,
    issueDate: true,
    expiryDate: true,
    total: true,
    currency: true,
    createdAt: true,
    customer: {
      select: {
        id: true,
        name: true,
        companyName: true,
      },
    },
  },
});

const estimateDetailArgs = Prisma.validator<Prisma.EstimateDefaultArgs>()({
  select: {
    id: true,
    customerId: true,
    publicId: true,
    estimateNumber: true,
    status: true,
    issueDate: true,
    expiryDate: true,
    currency: true,
    subtotal: true,
    taxTotal: true,
    discountType: true,
    discountValue: true,
    discountTotal: true,
    total: true,
    notes: true,
    terms: true,
    sentAt: true,
    viewedAt: true,
    acceptedAt: true,
    rejectedAt: true,
    createdAt: true,
    updatedAt: true,
    company: {
      select: {
        id: true,
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
    },
    customer: {
      select: {
        id: true,
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
      },
    },
    items: {
      orderBy: {
        sortOrder: "asc",
      },
      select: {
        id: true,
        name: true,
        description: true,
        quantity: true,
        unitPrice: true,
        taxRate: true,
        lineTotal: true,
        sortOrder: true,
      },
    },
    invoices: {
      select: {
        id: true,
        invoiceNumber: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    },
  },
});

export type EstimateCustomerOption = Prisma.CustomerGetPayload<
  typeof estimateCustomerOptionArgs
>;
export type EstimateListItem = Prisma.EstimateGetPayload<typeof estimateListArgs>;
export type EstimateDetailRecord = Prisma.EstimateGetPayload<typeof estimateDetailArgs>;
export type PublicEstimateRecord = EstimateDetailRecord;

type EstimateCompanyContext = {
  companyId: string;
  plan: Plan;
};

export class EstimateNotFoundError extends Error {
  constructor() {
    super("estimate:not-found");
  }
}

export class EstimateCustomerNotFoundError extends Error {
  constructor() {
    super("estimate:customer-not-found");
  }
}

function getEstimateSearchWhere(search: string | undefined, companyId: string) {
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
        estimateNumber: {
          contains: normalizedSearch,
          mode: "insensitive" as const,
        },
      },
      {
        customer: {
          name: {
            contains: normalizedSearch,
            mode: "insensitive" as const,
          },
        },
      },
      {
        customer: {
          companyName: {
            contains: normalizedSearch,
            mode: "insensitive" as const,
          },
        },
      },
    ],
  };
}

function buildEstimateItems(items: EstimateInput["items"]) {
  return items.map((item, index) => ({
    name: item.name,
    description: item.description || null,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    taxRate: item.taxRate,
    lineTotal: calculateLineTotal(item.quantity, item.unitPrice),
    sortOrder: index,
  }));
}

function buildEstimateData(input: EstimateInput) {
  const normalizedDiscountValue =
    input.discountType && input.discountValue !== undefined && input.discountValue !== null
      ? input.discountValue
      : 0;

  const totals = calculateDocumentTotals({
    items: input.items.map((item) => ({
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      taxRate: item.taxRate,
    })),
    discountType: input.discountType,
    discountValue: normalizedDiscountValue,
  });

  return {
    customerId: input.customerId,
    issueDate: input.issueDate,
    expiryDate: input.expiryDate,
    status: input.status,
    currency: input.currency,
    subtotal: totals.subtotal,
    taxTotal: totals.taxTotal,
    discountType: input.discountType ?? null,
    discountValue: input.discountType ? normalizedDiscountValue : null,
    discountTotal: totals.discountTotal,
    total: totals.total,
    notes: input.notes || null,
    terms: input.terms || null,
    items: buildEstimateItems(input.items),
  };
}

async function assertCustomerBelongsToCompany(
  db: Prisma.TransactionClient | typeof prisma,
  customerId: string,
  companyId: string,
) {
  const customer = await db.customer.findFirst({
    where: {
      id: customerId,
      companyId,
    },
    select: {
      id: true,
    },
  });

  if (!customer) {
    throw new EstimateCustomerNotFoundError();
  }
}

export async function listEstimateCustomersForCompany(companyId: string) {
  return prisma.customer.findMany({
    ...estimateCustomerOptionArgs,
    where: {
      companyId,
    },
    orderBy: [
      {
        name: "asc",
      },
      {
        companyName: "asc",
      },
    ],
  });
}

export async function listEstimatesForCompany(companyId: string, search?: string) {
  return prisma.estimate.findMany({
    ...estimateListArgs,
    where: getEstimateSearchWhere(search, companyId),
    orderBy: [
      {
        createdAt: "desc",
      },
      {
        estimateNumber: "desc",
      },
    ],
  });
}

export async function getEstimateByIdForCompany(
  estimateId: string,
  companyId: string,
) {
  return prisma.estimate.findFirst({
    ...estimateDetailArgs,
    where: {
      id: estimateId,
      companyId,
    },
  });
}

export async function getEstimateByPublicId(publicId: string) {
  const estimate = await prisma.estimate.findUnique({
    ...estimateDetailArgs,
    where: {
      publicId,
    },
  });

  if (!estimate) {
    return null;
  }

  if (estimate.status === EstimateStatus.SENT) {
    const viewedAt = new Date();

    await prisma.estimate.update({
      where: {
        id: estimate.id,
      },
      data: {
        status: EstimateStatus.VIEWED,
        viewedAt,
      },
    });

    return {
      ...estimate,
      status: EstimateStatus.VIEWED,
      viewedAt,
    };
  }

  return estimate;
}

export async function createEstimateForCompany(
  context: EstimateCompanyContext,
  input: EstimateInput,
) {
  return prisma.$transaction(async (tx) => {
    await assertPlanLimitAvailable(tx, context.companyId, context.plan, "estimate");
    await assertCustomerBelongsToCompany(tx, input.customerId, context.companyId);

    const company = await tx.company.findUnique({
      where: {
        id: context.companyId,
      },
      select: {
        id: true,
        estimatePrefix: true,
        nextEstimateNumber: true,
      },
    });

    if (!company) {
      throw new EstimateNotFoundError();
    }

    const estimateData = buildEstimateData(input);
    const estimateNumber = formatDocumentNumber(
      company.estimatePrefix,
      company.nextEstimateNumber,
    );

    const createdEstimate = await tx.estimate.create({
      data: {
        companyId: context.companyId,
        estimateNumber,
        publicId: createPublicId(),
        ...estimateData,
        items: {
          create: estimateData.items,
        },
      },
      select: {
        id: true,
        publicId: true,
      },
    });

    await tx.company.update({
      where: {
        id: context.companyId,
      },
      data: {
        nextEstimateNumber: {
          increment: 1,
        },
      },
    });

    await incrementUsageMetric(tx, context.companyId, "estimate");

    return createdEstimate;
  });
}

export async function updateEstimateForCompany(
  estimateId: string,
  companyId: string,
  input: EstimateInput,
) {
  const existingEstimate = await prisma.estimate.findFirst({
    where: {
      id: estimateId,
      companyId,
    },
    select: {
      id: true,
      publicId: true,
    },
  });

  if (!existingEstimate) {
    throw new EstimateNotFoundError();
  }

  await assertCustomerBelongsToCompany(prisma, input.customerId, companyId);

  const estimateData = buildEstimateData(input);

  return prisma.estimate.update({
    where: {
      id: existingEstimate.id,
    },
    data: {
      customerId: estimateData.customerId,
      issueDate: estimateData.issueDate,
      expiryDate: estimateData.expiryDate,
      status: estimateData.status,
      currency: estimateData.currency,
      subtotal: estimateData.subtotal,
      taxTotal: estimateData.taxTotal,
      discountType: estimateData.discountType,
      discountValue: estimateData.discountValue,
      discountTotal: estimateData.discountTotal,
      total: estimateData.total,
      notes: estimateData.notes,
      terms: estimateData.terms,
      items: {
        deleteMany: {},
        create: estimateData.items,
      },
    },
    select: {
      id: true,
      publicId: true,
    },
  });
}
