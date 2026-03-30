import { EstimateStatus } from "@prisma/client";
import { NextResponse } from "next/server";

import { apiError } from "@/lib/api";
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

  const estimate = await prisma.estimate.findFirst({
    where: {
      id,
      companyId: context.companyId,
    },
    select: {
      id: true,
    },
  });

  if (!estimate) {
    return apiError("Estimate not found.", 404);
  }

  const updatedEstimate = await prisma.estimate.update({
    where: {
      id,
    },
    data: {
      status: EstimateStatus.SENT,
      sentAt: new Date(),
    },
  });

  return NextResponse.json({ data: updatedEstimate });
}
