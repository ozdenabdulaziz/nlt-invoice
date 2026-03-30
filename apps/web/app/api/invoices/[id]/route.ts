import { NextResponse } from "next/server";

import { apiError, apiValidationError } from "@/lib/api";
import { calculateDocumentTotals, calculateLineTotal } from "@/lib/calculations";
import { getRequestCompanyContext } from "@/lib/permissions";
import { prisma } from "@/lib/prisma/client";
import { invoiceUpdateSchema } from "@/lib/validations/invoice";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const context = await getRequestCompanyContext();

  if (!context) {
    return apiError("Unauthorized.", 401);
  }

  const { id } = await params;

  const invoice = await prisma.invoice.findFirst({
    where: {
      id,
      companyId: context.companyId,
    },
    include: {
      customer: true,
      items: true,
    },
  });

  if (!invoice) {
    return apiError("Invoice not found.", 404);
  }

  return NextResponse.json({ data: invoice });
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
  const parsed = invoiceUpdateSchema.safeParse(payload);

  if (!parsed.success) {
    return apiValidationError(parsed.error);
  }

  const invoice = await prisma.invoice.findFirst({
    where: {
      id,
      companyId: context.companyId,
    },
    include: {
      items: true,
    },
  });

  if (!invoice) {
    return apiError("Invoice not found.", 404);
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

  const items = parsed.data.items ?? invoice.items.map((item) => ({
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
    discountType: parsed.data.discountType ?? invoice.discountType,
    discountValue:
      parsed.data.discountValue ??
      (invoice.discountValue ? Number(invoice.discountValue) : 0),
    amountPaid:
      parsed.data.amountPaid !== undefined
        ? parsed.data.amountPaid
        : Number(invoice.amountPaid),
  });

  const updatedInvoice = await prisma.invoice.update({
    where: {
      id,
    },
    data: {
      customerId: parsed.data.customerId ?? invoice.customerId,
      issueDate: parsed.data.issueDate ?? invoice.issueDate,
      dueDate: parsed.data.dueDate ?? invoice.dueDate,
      status: parsed.data.status ?? invoice.status,
      currency: parsed.data.currency ?? invoice.currency,
      subtotal: totals.subtotal,
      taxTotal: totals.taxTotal,
      discountType:
        parsed.data.discountType === undefined ? invoice.discountType : parsed.data.discountType,
      discountValue:
        parsed.data.discountValue === undefined
          ? invoice.discountValue
          : parsed.data.discountValue,
      discountTotal: totals.discountTotal,
      total: totals.total,
      amountPaid: totals.amountPaid,
      balanceDue: totals.balanceDue,
      notes: parsed.data.notes === undefined ? invoice.notes : parsed.data.notes || null,
      terms: parsed.data.terms === undefined ? invoice.terms : parsed.data.terms || null,
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

  return NextResponse.json({ data: updatedInvoice });
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

  const invoice = await prisma.invoice.findFirst({
    where: {
      id,
      companyId: context.companyId,
    },
    select: {
      id: true,
    },
  });

  if (!invoice) {
    return apiError("Invoice not found.", 404);
  }

  await prisma.invoice.delete({
    where: {
      id,
    },
  });

  return NextResponse.json({ success: true });
}
