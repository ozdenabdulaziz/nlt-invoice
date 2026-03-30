import { EstimateStatus } from "@prisma/client";
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
    const duplicatedEstimate = await prisma.$transaction(async (tx) => {
      await assertPlanLimitAvailable(tx, context.companyId, context.plan, "estimate");

      const sourceEstimate = await tx.estimate.findFirst({
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
          estimatePrefix: true,
          nextEstimateNumber: true,
        },
      });

      if (!sourceEstimate || !company) {
        throw new Error("estimate:not-found");
      }

      const duplicated = await tx.estimate.create({
        data: {
          companyId: sourceEstimate.companyId,
          customerId: sourceEstimate.customerId,
          estimateNumber: formatDocumentNumber(
            company.estimatePrefix,
            company.nextEstimateNumber,
          ),
          issueDate: new Date(),
          expiryDate: sourceEstimate.expiryDate,
          status: EstimateStatus.DRAFT,
          currency: sourceEstimate.currency,
          subtotal: sourceEstimate.subtotal,
          taxTotal: sourceEstimate.taxTotal,
          discountType: sourceEstimate.discountType,
          discountValue: sourceEstimate.discountValue,
          discountTotal: sourceEstimate.discountTotal,
          total: sourceEstimate.total,
          notes: sourceEstimate.notes,
          terms: sourceEstimate.terms,
          publicId: createPublicId(),
          items: {
            create: sourceEstimate.items.map((item) => ({
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
          nextEstimateNumber: {
            increment: 1,
          },
        },
      });

      await incrementUsageMetric(tx, context.companyId, "estimate");

      return duplicated;
    });

    return NextResponse.json({ data: duplicatedEstimate }, { status: 201 });
  } catch (error) {
    if (isLimitError(error, "estimate")) {
      return apiError("Free plan estimate limit reached for this month. Upgrade to Pro to continue.", 403);
    }

    if (error instanceof Error && error.message === "estimate:not-found") {
      return apiError("Estimate not found.", 404);
    }

    throw error;
  }
}
