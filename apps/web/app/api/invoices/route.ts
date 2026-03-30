import { NextResponse } from "next/server";

import { apiError, apiValidationError } from "@/lib/api";
import { calculateDocumentTotals, calculateLineTotal } from "@/lib/calculations";
import { createPublicId, formatDocumentNumber } from "@/lib/document-ids";
import { assertPlanLimitAvailable, incrementUsageMetric, isLimitError } from "@/lib/limits";
import { getRequestCompanyContext } from "@/lib/permissions";
import { prisma } from "@/lib/prisma/client";
import { invoiceSchema } from "@/lib/validations/invoice";

export async function GET() {
  const context = await getRequestCompanyContext();

  if (!context) {
    return apiError("Unauthorized.", 401);
  }

  const invoices = await prisma.invoice.findMany({
    where: {
      companyId: context.companyId,
    },
    include: {
      customer: true,
      items: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json({ data: invoices });
}

export async function POST(request: Request) {
  const context = await getRequestCompanyContext();

  if (!context) {
    return apiError("Unauthorized.", 401);
  }

  const payload = await request.json().catch(() => null);
  const parsed = invoiceSchema.safeParse(payload);

  if (!parsed.success) {
    return apiValidationError(parsed.error);
  }

  try {
    const invoice = await prisma.$transaction(async (tx) => {
      await assertPlanLimitAvailable(tx, context.companyId, context.plan, "invoice");

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

      const customer = await tx.customer.findFirst({
        where: {
          id: parsed.data.customerId,
          companyId: context.companyId,
        },
        select: {
          id: true,
        },
      });

      if (!company) {
        throw new Error("company:not-found");
      }

      if (!customer) {
        throw new Error("customer:not-found");
      }

      const totals = calculateDocumentTotals({
        items: parsed.data.items.map((item) => ({
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          taxRate: item.taxRate,
        })),
        discountType: parsed.data.discountType,
        discountValue: parsed.data.discountValue ?? 0,
        amountPaid: parsed.data.amountPaid,
      });

      const invoiceNumber = formatDocumentNumber(company.invoicePrefix, company.nextInvoiceNumber);

      const createdInvoice = await tx.invoice.create({
        data: {
          companyId: context.companyId,
          customerId: parsed.data.customerId,
          invoiceNumber,
          issueDate: parsed.data.issueDate,
          dueDate: parsed.data.dueDate,
          status: parsed.data.status,
          currency: parsed.data.currency,
          subtotal: totals.subtotal,
          taxTotal: totals.taxTotal,
          discountType: parsed.data.discountType ?? null,
          discountValue: parsed.data.discountValue ?? null,
          discountTotal: totals.discountTotal,
          total: totals.total,
          amountPaid: totals.amountPaid,
          balanceDue: totals.balanceDue,
          notes: parsed.data.notes || null,
          terms: parsed.data.terms || null,
          publicId: createPublicId(),
          items: {
            create: parsed.data.items.map((item, index) => ({
              name: item.name,
              description: item.description || null,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              taxRate: item.taxRate,
              lineTotal: calculateLineTotal(item.quantity, item.unitPrice),
              sortOrder: item.sortOrder ?? index,
            })),
          },
        },
        include: {
          customer: true,
          items: true,
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

    return NextResponse.json({ data: invoice }, { status: 201 });
  } catch (error) {
    if (isLimitError(error, "invoice")) {
      return apiError("Free plan invoice limit reached for this month. Upgrade to Pro to continue.", 403);
    }

    if (error instanceof Error && error.message === "customer:not-found") {
      return apiError("Customer not found.", 404);
    }

    throw error;
  }
}
