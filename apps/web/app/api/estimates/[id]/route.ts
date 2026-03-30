import { NextResponse } from "next/server";

import { apiError, apiValidationError } from "@/lib/api";
import { calculateDocumentTotals, calculateLineTotal } from "@/lib/calculations";
import { getRequestCompanyContext } from "@/lib/permissions";
import { prisma } from "@/lib/prisma/client";
import { estimateUpdateSchema } from "@/lib/validations/estimate";

export async function GET(
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
    include: {
      customer: true,
      items: true,
    },
  });

  if (!estimate) {
    return apiError("Estimate not found.", 404);
  }

  return NextResponse.json({ data: estimate });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const context = await getRequestCompanyContext();

  if (!context) {
    return apiError("Unauthorized.", 401);
  }

  const { id } = await params;
  const payload = await request.json().catch(() => null);
  const parsed = estimateUpdateSchema.safeParse(payload);

  if (!parsed.success) {
    return apiValidationError(parsed.error);
  }

  const estimate = await prisma.estimate.findFirst({
    where: {
      id,
      companyId: context.companyId,
    },
    include: {
      items: true,
    },
  });

  if (!estimate) {
    return apiError("Estimate not found.", 404);
  }

  if (parsed.data.customerId) {
    const customer = await prisma.customer.findFirst({
      where: {
        id: parsed.data.customerId,
        companyId: context.companyId,
      },
      select: {
        id: true,
      },
    });

    if (!customer) {
      return apiError("Customer not found.", 404);
    }
  }

  const items = parsed.data.items ?? estimate.items.map((item) => ({
    name: item.name,
    description: item.description ?? undefined,
    quantity: Number(item.quantity),
    unitPrice: Number(item.unitPrice),
    taxRate: Number(item.taxRate),
    sortOrder: item.sortOrder,
  }));

  const totals = calculateDocumentTotals({
    items: items.map((item) => ({
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      taxRate: item.taxRate,
    })),
    discountType: parsed.data.discountType ?? estimate.discountType,
    discountValue:
      parsed.data.discountValue ??
      (estimate.discountValue ? Number(estimate.discountValue) : 0),
  });

  const updatedEstimate = await prisma.estimate.update({
    where: {
      id,
    },
    data: {
      customerId: parsed.data.customerId ?? estimate.customerId,
      issueDate: parsed.data.issueDate ?? estimate.issueDate,
      expiryDate: parsed.data.expiryDate ?? estimate.expiryDate,
      status: parsed.data.status ?? estimate.status,
      currency: parsed.data.currency ?? estimate.currency,
      subtotal: totals.subtotal,
      taxTotal: totals.taxTotal,
      discountType:
        parsed.data.discountType === undefined ? estimate.discountType : parsed.data.discountType,
      discountValue:
        parsed.data.discountValue === undefined
          ? estimate.discountValue
          : parsed.data.discountValue,
      discountTotal: totals.discountTotal,
      total: totals.total,
      notes: parsed.data.notes === undefined ? estimate.notes : parsed.data.notes || null,
      terms: parsed.data.terms === undefined ? estimate.terms : parsed.data.terms || null,
      items: parsed.data.items
        ? {
            deleteMany: {},
            create: parsed.data.items.map((item, index) => ({
              name: item.name,
              description: item.description || null,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              taxRate: item.taxRate,
              lineTotal: calculateLineTotal(item.quantity, item.unitPrice),
              sortOrder: item.sortOrder ?? index,
            })),
          }
        : undefined,
    },
    include: {
      customer: true,
      items: true,
    },
  });

  return NextResponse.json({ data: updatedEstimate });
}

export async function DELETE(
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

  await prisma.estimate.delete({
    where: {
      id,
    },
  });

  return NextResponse.json({ success: true });
}
