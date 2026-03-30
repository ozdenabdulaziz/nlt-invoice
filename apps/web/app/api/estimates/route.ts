import { NextResponse } from "next/server";

import { apiError, apiValidationError } from "@/lib/api";
import { calculateDocumentTotals, calculateLineTotal } from "@/lib/calculations";
import { createPublicId, formatDocumentNumber } from "@/lib/document-ids";
import { assertPlanLimitAvailable, incrementUsageMetric, isLimitError } from "@/lib/limits";
import { getRequestCompanyContext } from "@/lib/permissions";
import { prisma } from "@/lib/prisma/client";
import { estimateSchema } from "@/lib/validations/estimate";

export async function GET() {
  const context = await getRequestCompanyContext();

  if (!context) {
    return apiError("Unauthorized.", 401);
  }

  const estimates = await prisma.estimate.findMany({
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

  return NextResponse.json({ data: estimates });
}

export async function POST(request: Request) {
  const context = await getRequestCompanyContext();

  if (!context) {
    return apiError("Unauthorized.", 401);
  }

  const payload = await request.json().catch(() => null);
  const parsed = estimateSchema.safeParse(payload);

  if (!parsed.success) {
    return apiValidationError(parsed.error);
  }

  try {
    const estimate = await prisma.$transaction(async (tx) => {
      await assertPlanLimitAvailable(tx, context.companyId, context.plan, "estimate");

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
      });

      const estimateNumber = formatDocumentNumber(
        company.estimatePrefix,
        company.nextEstimateNumber,
      );

      const createdEstimate = await tx.estimate.create({
        data: {
          companyId: context.companyId,
          customerId: parsed.data.customerId,
          estimateNumber,
          issueDate: parsed.data.issueDate,
          expiryDate: parsed.data.expiryDate,
          status: parsed.data.status,
          currency: parsed.data.currency,
          subtotal: totals.subtotal,
          taxTotal: totals.taxTotal,
          discountType: parsed.data.discountType ?? null,
          discountValue: parsed.data.discountValue ?? null,
          discountTotal: totals.discountTotal,
          total: totals.total,
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
          nextEstimateNumber: {
            increment: 1,
          },
        },
      });

      await incrementUsageMetric(tx, context.companyId, "estimate");

      return createdEstimate;
    });

    return NextResponse.json({ data: estimate }, { status: 201 });
  } catch (error) {
    if (isLimitError(error, "estimate")) {
      return apiError("Free plan estimate limit reached for this month. Upgrade to Pro to continue.", 403);
    }

    if (error instanceof Error && error.message === "customer:not-found") {
      return apiError("Customer not found.", 404);
    }

    throw error;
  }
}
