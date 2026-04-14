import { InvoiceStatus, type Plan, Prisma } from "@prisma/client";

import {
  assertBillingAllowance,
  incrementUsageMetric,
} from "@/features/billing/server/service";
import { canConvertEstimateToInvoice } from "@/features/estimates/conversion-rules";
import { listValidSavedItemIdsForCompany } from "@/features/items/server/service";
import { calculateDocumentTotals, calculateLineTotal } from "@/lib/calculations";
import { createPublicId, formatDocumentNumber } from "@/lib/document-ids";
import { prisma } from "@/lib/prisma/client";
import type { InvoiceInput } from "@/lib/validations/invoice";
import { lockCompanyForWrite } from "@/server/shared/company-write";
import {
  getDocumentSnapshotForCompanyCustomer,
  pickDocumentSnapshotFields,
} from "@/server/shared/document-snapshots";

const invoiceCustomerOptionArgs =
  Prisma.validator<Prisma.CustomerDefaultArgs>()({
    select: {
      id: true,
      name: true,
      companyName: true,
    },
  });

const invoiceListArgs = Prisma.validator<Prisma.InvoiceDefaultArgs>()({
  select: {
    id: true,
    publicId: true,
    invoiceNumber: true,
    status: true,
    issueDate: true,
    dueDate: true,
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

const invoiceDetailArgs = Prisma.validator<Prisma.InvoiceDefaultArgs>()({
  select: {
    id: true,
    customerId: true,
    estimateId: true,
    companyName: true,
    companyEmail: true,
    companyPhone: true,
    companyWebsite: true,
    companyAddressLine1: true,
    companyAddressLine2: true,
    companyCity: true,
    companyProvince: true,
    companyPostalCode: true,
    companyCountry: true,
    companyTaxNumber: true,
    customerName: true,
    customerCompanyName: true,
    customerEmail: true,
    customerPhone: true,
    customerBillingAddressLine1: true,
    customerBillingAddressLine2: true,
    customerBillingCity: true,
    customerBillingProvince: true,
    customerBillingPostalCode: true,
    customerBillingCountry: true,
    customerShippingSameAsBilling: true,
    customerShippingAddressLine1: true,
    customerShippingAddressLine2: true,
    customerShippingCity: true,
    customerShippingProvince: true,
    customerShippingPostalCode: true,
    customerShippingCountry: true,
    publicId: true,
    invoiceNumber: true,
    status: true,
    issueDate: true,
    dueDate: true,
    currency: true,
    subtotal: true,
    taxTotal: true,
    discountType: true,
    discountValue: true,
    discountTotal: true,
    total: true,
    amountPaid: true,
    balanceDue: true,
    notes: true,
    terms: true,
    sentAt: true,
    viewedAt: true,
    paidAt: true,
    paymentMethod: true,
    paymentNote: true,
    createdAt: true,
    updatedAt: true,
    estimate: {
      select: {
        id: true,
        estimateNumber: true,
      },
    },
    items: {
      orderBy: {
        sortOrder: "asc",
      },
      select: {
        id: true,
        savedItemId: true,
        name: true,
        description: true,
        unitType: true,
        quantity: true,
        unitPrice: true,
        taxRate: true,
        lineTotal: true,
        sortOrder: true,
      },
    },
  },
});

export type InvoiceCustomerOption = Prisma.CustomerGetPayload<
  typeof invoiceCustomerOptionArgs
>;
export type InvoiceListItem = Prisma.InvoiceGetPayload<typeof invoiceListArgs>;
export type InvoiceDetailRecord = Prisma.InvoiceGetPayload<typeof invoiceDetailArgs>;
export type PublicInvoiceRecord = InvoiceDetailRecord;

type InvoiceCompanyContext = {
  companyId: string;
  plan: Plan;
};

export class InvoiceNotFoundError extends Error {
  constructor() {
    super("invoice:not-found");
  }
}

export class InvoiceNotEditableError extends Error {
  constructor() {
    super("invoice:not-editable");
  }
}

export class InvoiceCustomerNotFoundError extends Error {
  constructor() {
    super("invoice:customer-not-found");
  }
}

export class InvoicePaymentNotAllowedError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class InvoiceSourceEstimateNotFoundError extends Error {
  constructor() {
    super("invoice:source-estimate-not-found");
  }
}

export class InvoiceSourceEstimateAlreadyConvertedError extends Error {
  constructor(
    public readonly invoiceId: string,
    public readonly invoiceNumber: string,
  ) {
    super("invoice:source-estimate-already-converted");
  }
}

export class InvoiceSourceEstimateNotConvertibleError extends Error {
  constructor() {
    super("invoice:source-estimate-not-convertible");
  }
}

export function isInvoicePayable(
  status: InvoiceStatus,
  balanceDue: { toString(): string } | string | number,
) {
  const remainingBalance = Number(balanceDue.toString());

  return status !== InvoiceStatus.VOID && remainingBalance > 0;
}

function getInvoiceSearchWhere(search: string | undefined, companyId: string) {
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
        invoiceNumber: {
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

async function buildInvoiceItems(
  db: Prisma.TransactionClient,
  companyId: string,
  items: InvoiceInput["items"],
) {
  const validSavedItemIds = await listValidSavedItemIdsForCompany(
    db,
    companyId,
    items.flatMap((item) => (item.savedItemId ? [item.savedItemId] : [])),
  );

  return items.map((item, index) => ({
    savedItemId:
      item.savedItemId && validSavedItemIds.has(item.savedItemId) ? item.savedItemId : null,
    name: item.name,
    description: item.description || null,
    unitType: item.unitType,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    taxRate: item.taxRate,
    lineTotal: calculateLineTotal(item.quantity, item.unitPrice),
    sortOrder: index,
  }));
}

async function buildInvoiceData(
  db: Prisma.TransactionClient,
  companyId: string,
  input: InvoiceInput,
) {
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
    amountPaid: input.amountPaid,
  });

  return {
    customerId: input.customerId,
    issueDate: input.issueDate,
    dueDate: input.dueDate,
    status: input.status,
    currency: input.currency,
    subtotal: totals.subtotal,
    taxTotal: totals.taxTotal,
    discountType: input.discountType ?? null,
    discountValue: input.discountType ? normalizedDiscountValue : null,
    discountTotal: totals.discountTotal,
    total: totals.total,
    amountPaid: totals.amountPaid,
    balanceDue: totals.balanceDue,
    notes: input.notes || null,
    terms: input.terms || null,
    items: await buildInvoiceItems(db, companyId, input.items),
  };
}

function getDefaultConvertedInvoiceDates(baseDate = new Date()) {
  const issueDate = new Date(baseDate);
  const dueDate = new Date(baseDate);
  dueDate.setDate(dueDate.getDate() + 30);

  return {
    issueDate,
    dueDate,
  };
}

export async function listInvoiceCustomersForCompany(companyId: string) {
  return prisma.customer.findMany({
    ...invoiceCustomerOptionArgs,
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

export async function listInvoicesForCompany(companyId: string, search?: string) {
  return prisma.invoice.findMany({
    ...invoiceListArgs,
    take: 100, // Implemented safe ceiling for MVP list performance
    where: getInvoiceSearchWhere(search, companyId),
    orderBy: [
      {
        createdAt: "desc",
      },
      {
        invoiceNumber: "desc",
      },
    ],
  });
}

export async function getInvoiceByIdForCompany(invoiceId: string, companyId: string) {
  return prisma.invoice.findFirst({
    ...invoiceDetailArgs,
    where: {
      id: invoiceId,
      companyId,
    },
  });
}

export async function getInvoiceByPublicId(publicId: string, trackView = true) {
  const invoice = await prisma.invoice.findUnique({
    ...invoiceDetailArgs,
    where: {
      publicId,
    },
  });

  if (!invoice) {
    return null;
  }

  if (trackView && invoice.status === InvoiceStatus.SENT) {
    const viewedAt = new Date();

    await prisma.invoice.update({
      where: {
        id: invoice.id,
      },
      data: {
        status: InvoiceStatus.VIEWED,
        viewedAt,
      },
    });

    return {
      ...invoice,
      status: InvoiceStatus.VIEWED,
      viewedAt,
    };
  }

  return invoice;
}

export async function getInvoiceForCheckout(publicId: string) {
  return prisma.invoice.findUnique({
    where: {
      publicId,
    },
    select: {
      id: true,
      companyId: true,
      publicId: true,
      invoiceNumber: true,
      status: true,
      currency: true,
      balanceDue: true,
      customerName: true,
      customerEmail: true,
      companyName: true,
    },
  });
}

export async function createInvoiceForCompany(
  context: InvoiceCompanyContext,
  input: InvoiceInput,
) {
  return prisma.$transaction(async (tx) => {
    await lockCompanyForWrite(tx, context.companyId);
    await assertBillingAllowance(tx, context, "invoice");

    const company = await tx.company.findUnique({
      where: {
        id: context.companyId,
      },
      select: {
        id: true,
        invoicePrefix: true,
        nextInvoiceNumber: true,
      },
    });

    if (!company) {
      throw new InvoiceNotFoundError();
    }

    const snapshot = await getDocumentSnapshotForCompanyCustomer(
      tx,
      context.companyId,
      input.customerId,
    );

    if (!snapshot) {
      throw new InvoiceCustomerNotFoundError();
    }

    const invoiceData = await buildInvoiceData(tx, context.companyId, input);
    const invoiceNumber = formatDocumentNumber(
      company.invoicePrefix,
      company.nextInvoiceNumber,
    );

    const createdInvoice = await tx.invoice.create({
      data: {
        companyId: context.companyId,
        invoiceNumber,
        publicId: createPublicId(),
        ...snapshot,
        ...invoiceData,
        items: {
          create: invoiceData.items,
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
        nextInvoiceNumber: {
          increment: 1,
        },
      },
    });

    await incrementUsageMetric(tx, context.companyId, "invoice");

    return createdInvoice;
  });
}

export async function convertEstimateToInvoiceForCompany(
  context: InvoiceCompanyContext,
  estimateId: string,
) {
  return prisma.$transaction(
    async (tx) => {
      await lockCompanyForWrite(tx, context.companyId);
      await assertBillingAllowance(tx, context, "invoice");

      const estimate = await tx.estimate.findFirst({
        where: {
          id: estimateId,
          companyId: context.companyId,
        },
        select: {
          id: true,
          customerId: true,
          companyName: true,
          companyEmail: true,
          companyPhone: true,
          companyWebsite: true,
          companyAddressLine1: true,
          companyAddressLine2: true,
          companyCity: true,
          companyProvince: true,
          companyPostalCode: true,
          companyCountry: true,
          companyTaxNumber: true,
          customerName: true,
          customerCompanyName: true,
          customerEmail: true,
          customerPhone: true,
          customerBillingAddressLine1: true,
          customerBillingAddressLine2: true,
          customerBillingCity: true,
          customerBillingProvince: true,
          customerBillingPostalCode: true,
          customerBillingCountry: true,
          customerShippingSameAsBilling: true,
          customerShippingAddressLine1: true,
          customerShippingAddressLine2: true,
          customerShippingCity: true,
          customerShippingProvince: true,
          customerShippingPostalCode: true,
          customerShippingCountry: true,
          estimateNumber: true,
          status: true,
          currency: true,
          subtotal: true,
          taxTotal: true,
          discountType: true,
          discountValue: true,
          discountTotal: true,
          total: true,
          notes: true,
          terms: true,
          invoices: {
            select: {
              id: true,
              invoiceNumber: true,
            },
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
          },
          items: {
            orderBy: {
              sortOrder: "asc",
            },
            select: {
              savedItemId: true,
              name: true,
              description: true,
              unitType: true,
              quantity: true,
              unitPrice: true,
              taxRate: true,
              lineTotal: true,
              sortOrder: true,
            },
          },
        },
      });

      if (!estimate) {
        throw new InvoiceSourceEstimateNotFoundError();
      }

      if (estimate.invoices[0]) {
        throw new InvoiceSourceEstimateAlreadyConvertedError(
          estimate.invoices[0].id,
          estimate.invoices[0].invoiceNumber,
        );
      }

      if (!canConvertEstimateToInvoice(estimate.status)) {
        throw new InvoiceSourceEstimateNotConvertibleError();
      }

      const company = await tx.company.findUnique({
        where: {
          id: context.companyId,
        },
        select: {
          id: true,
          invoicePrefix: true,
          nextInvoiceNumber: true,
        },
      });

      if (!company) {
        throw new InvoiceNotFoundError();
      }

      const { issueDate, dueDate } = getDefaultConvertedInvoiceDates();
      const invoiceNumber = formatDocumentNumber(
        company.invoicePrefix,
        company.nextInvoiceNumber,
      );

      const createdInvoice = await tx.invoice.create({
        data: {
          companyId: context.companyId,
          customerId: estimate.customerId,
          estimateId: estimate.id,
          invoiceNumber,
          publicId: createPublicId(),
          ...pickDocumentSnapshotFields(estimate),
          issueDate,
          dueDate,
          status: InvoiceStatus.DRAFT,
          currency: estimate.currency,
          subtotal: estimate.subtotal,
          taxTotal: estimate.taxTotal,
          discountType: estimate.discountType,
          discountValue: estimate.discountValue,
          discountTotal: estimate.discountTotal,
          total: estimate.total,
          amountPaid: 0,
          balanceDue: estimate.total,
          notes: estimate.notes,
          terms: estimate.terms,
          items: {
            create: estimate.items.map((item) => ({
              name: item.name,
              savedItemId: item.savedItemId,
              description: item.description,
              unitType: item.unitType,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              taxRate: item.taxRate,
              lineTotal: item.lineTotal,
              sortOrder: item.sortOrder,
            })),
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
          nextInvoiceNumber: {
            increment: 1,
          },
        },
      });

      await incrementUsageMetric(tx, context.companyId, "invoice");

      return createdInvoice;
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    },
  );
}

export async function updateInvoiceForCompany(
  invoiceId: string,
  companyId: string,
  input: InvoiceInput,
) {
  return prisma.$transaction(async (tx) => {
    const existingInvoice = await tx.invoice.findFirst({
      where: {
        id: invoiceId,
        companyId,
      },
      select: {
        id: true,
        publicId: true,
        status: true,
      },
    });

    if (!existingInvoice) {
      throw new InvoiceNotFoundError();
    }

    if (existingInvoice.status !== InvoiceStatus.DRAFT) {
      throw new InvoiceNotEditableError();
    }

    const snapshot = await getDocumentSnapshotForCompanyCustomer(
      tx as Parameters<typeof getDocumentSnapshotForCompanyCustomer>[0],
      companyId,
      input.customerId,
    );

    if (!snapshot) {
      throw new InvoiceCustomerNotFoundError();
    }

    const invoiceData = await buildInvoiceData(tx, companyId, input);

    return tx.invoice.update({
      where: {
        id: existingInvoice.id,
      },
      data: {
        ...snapshot,
        customerId: invoiceData.customerId,
        issueDate: invoiceData.issueDate,
        dueDate: invoiceData.dueDate,
        status: invoiceData.status,
        currency: invoiceData.currency,
        subtotal: invoiceData.subtotal,
        taxTotal: invoiceData.taxTotal,
        discountType: invoiceData.discountType,
        discountValue: invoiceData.discountValue,
        discountTotal: invoiceData.discountTotal,
        total: invoiceData.total,
        amountPaid: invoiceData.amountPaid,
        balanceDue: invoiceData.balanceDue,
        notes: invoiceData.notes,
        terms: invoiceData.terms,
        items: {
          deleteMany: {},
          create: invoiceData.items,
        },
      },
      select: {
        id: true,
        publicId: true,
      },
    });
  });
}

export async function voidInvoiceForCompany(
  invoiceId: string,
  companyId: string,
) {
  const existingInvoice = await prisma.invoice.findFirst({
    where: {
      id: invoiceId,
      companyId,
    },
    select: {
      id: true,
      status: true,
    },
  });

  if (!existingInvoice) {
    throw new InvoiceNotFoundError();
  }

  // Can't void an already PAID or VOID invoice.
  if (existingInvoice.status === InvoiceStatus.VOID || existingInvoice.status === InvoiceStatus.PAID) {
    throw new InvoiceNotEditableError(); // Reuse the generic not-editable error or create a specific one
  }

  return prisma.invoice.update({
    where: {
      id: existingInvoice.id,
    },
    data: {
      status: InvoiceStatus.VOID,
    },
    select: {
      id: true,
      publicId: true,
    },
  });
}

export async function deleteDraftInvoiceForCompany(
  invoiceId: string,
  companyId: string,
) {
  return prisma.$transaction(async (tx) => {
    const existingInvoice = await tx.invoice.findFirst({
      where: {
        id: invoiceId,
        companyId,
      },
      select: {
        id: true,
        status: true,
      },
    });

    if (!existingInvoice) {
      throw new InvoiceNotFoundError();
    }

    if (existingInvoice.status !== InvoiceStatus.DRAFT) {
      throw new InvoiceNotEditableError();
    }

    await tx.invoiceLineItem.deleteMany({
      where: {
        invoiceId: existingInvoice.id,
      },
    });

    const deleted = await tx.invoice.delete({
      where: {
        id: existingInvoice.id,
      },
      select: {
        id: true,
        publicId: true,
      },
    });

    // Note: To be fully correct, we should also decrement the UsageMetric here
    // but the UsageMetric may already be out of sync according to the audit.
    // For now we just delete the invoice.

    return deleted;
  });
}

export async function markInvoiceAsPaidForCompany(
  invoiceId: string,
  companyId: string,
  input: {
    paymentMethod?: string;
    paymentNote?: string;
  },
) {
  const existingInvoice = await prisma.invoice.findFirst({
    where: {
      id: invoiceId,
      companyId,
    },
    select: {
      id: true,
      publicId: true,
      status: true,
      total: true,
      balanceDue: true,
    },
  });

  if (!existingInvoice) {
    throw new InvoiceNotFoundError();
  }

  if (existingInvoice.status === InvoiceStatus.VOID) {
    throw new InvoicePaymentNotAllowedError("Void invoices cannot be marked as paid.");
  }

  if (existingInvoice.status === InvoiceStatus.PAID && Number(existingInvoice.balanceDue) <= 0) {
    return {
      id: existingInvoice.id,
      publicId: existingInvoice.publicId,
    };
  }

  return prisma.invoice.update({
    where: {
      id: existingInvoice.id,
    },
    data: {
      status: InvoiceStatus.PAID,
      amountPaid: existingInvoice.total,
      balanceDue: new Prisma.Decimal(0),
      paidAt: new Date(),
      paymentMethod: input.paymentMethod || null,
      paymentNote: input.paymentNote || null,
    },
    select: {
      id: true,
      publicId: true,
    },
  });
}

export async function recordStripeCheckoutPaymentForInvoice(
  invoiceId: string,
  input: {
    amountPaid?: number;
    checkoutSessionId: string;
    paymentIntentId?: string;
  },
) {
  const existingInvoice = await prisma.invoice.findUnique({
    where: {
      id: invoiceId,
    },
    select: {
      id: true,
      publicId: true,
      status: true,
      total: true,
      amountPaid: true,
      balanceDue: true,
      stripeCheckoutSessionId: true,
    },
  });

  if (!existingInvoice) {
    throw new InvoiceNotFoundError();
  }

  if (existingInvoice.status === InvoiceStatus.VOID) {
    throw new InvoicePaymentNotAllowedError("Void invoices cannot be marked as paid.");
  }

  // Idempotency guard: if this exact Stripe session was already recorded,
  // return without applying the payment again. Stripe retries can trigger
  // this path if our webhook response timed out after a successful DB write.
  if (
    existingInvoice.stripeCheckoutSessionId &&
    existingInvoice.stripeCheckoutSessionId === input.checkoutSessionId
  ) {
    return {
      id: existingInvoice.id,
      publicId: existingInvoice.publicId,
    };
  }

  if (
    existingInvoice.status === InvoiceStatus.PAID &&
    Number(existingInvoice.balanceDue.toString()) <= 0
  ) {
    return {
      id: existingInvoice.id,
      publicId: existingInvoice.publicId,
    };
  }

  const currentPaidAmount = Number(existingInvoice.amountPaid.toString());
  const totalAmount = Number(existingInvoice.total.toString());
  const appliedAmount = Math.max(0, input.amountPaid ?? Number(existingInvoice.balanceDue.toString()));
  const nextAmountPaid = Math.min(totalAmount, currentPaidAmount + appliedAmount);
  const nextBalanceDue = Math.max(0, totalAmount - nextAmountPaid);
  const nextStatus =
    nextBalanceDue === 0 ? InvoiceStatus.PAID : InvoiceStatus.PARTIAL;

  return prisma.invoice.update({
    where: {
      id: existingInvoice.id,
    },
    data: {
      status: nextStatus,
      amountPaid: new Prisma.Decimal(nextAmountPaid),
      balanceDue: new Prisma.Decimal(nextBalanceDue),
      paidAt: nextBalanceDue === 0 ? new Date() : null,
      paymentMethod: "Stripe Checkout",
      paymentNote: "Paid online via Stripe Checkout",
      stripeCheckoutSessionId: input.checkoutSessionId,
      stripePaymentIntentId: input.paymentIntentId ?? null,
    },
    select: {
      id: true,
      publicId: true,
    },
  });
}
