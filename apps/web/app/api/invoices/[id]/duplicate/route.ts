import { InvoiceStatus } from "@prisma/client";
import { NextResponse } from "next/server";

import { apiError } from "@/lib/api";
import { createPublicId, formatDocumentNumber } from "@/lib/document-ids";
import { assertPlanLimitAvailable, incrementUsageMetric, isLimitError } from "@/lib/limits";
import { getRequestCompanyContext } from "@/lib/permissions";
import { prisma } from "@/lib/prisma/client";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const context = await getRequestCompanyContext();

  if (!context) {
    return apiError("Unauthorized.", 401);
  }

  const { id } = await params;

  try {
    const duplicatedInvoice = await prisma.$transaction(async (tx) => {
      await assertPlanLimitAvailable(tx, context.companyId, context.plan, "invoice");

      const sourceInvoice = await tx.invoice.findFirst({
        where: {
          id,
          companyId: context.companyId,
        },
        include: {
          items: true,
        },
      });

      const company = await tx.company.findUnique({
        where: {
          id: context.companyId,
        },
        select: {
          invoicePrefix: true,
          nextInvoiceNumber: true,
        },
      });

      if (!sourceInvoice || !company) {
        throw new Error("invoice:not-found");
      }

      const duplicated = await tx.invoice.create({
        data: {
          companyId: sourceInvoice.companyId,
          customerId: sourceInvoice.customerId,
          invoiceNumber: formatDocumentNumber(company.invoicePrefix, company.nextInvoiceNumber),
          issueDate: new Date(),
          dueDate: sourceInvoice.dueDate,
          status: InvoiceStatus.DRAFT,
          currency: sourceInvoice.currency,
          subtotal: sourceInvoice.subtotal,
          taxTotal: sourceInvoice.taxTotal,
          discountType: sourceInvoice.discountType,
          discountValue: sourceInvoice.discountValue,
          discountTotal: sourceInvoice.discountTotal,
          total: sourceInvoice.total,
          amountPaid: 0,
          balanceDue: sourceInvoice.total,
          notes: sourceInvoice.notes,
          terms: sourceInvoice.terms,
          publicId: createPublicId(),
          items: {
            create: sourceInvoice.items.map((item) => ({
              name: item.name,
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              taxRate: item.taxRate,
              lineTotal: item.lineTotal,
              sortOrder: item.sortOrder,
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

      return duplicated;
    });

    return NextResponse.json({ data: duplicatedInvoice }, { status: 201 });
  } catch (error) {
    if (isLimitError(error, "invoice")) {
      return apiError("Free plan invoice limit reached for this month. Upgrade to Pro to continue.", 403);
    }

    if (error instanceof Error && error.message === "invoice:not-found") {
      return apiError("Invoice not found.", 404);
    }

    throw error;
  }
}
