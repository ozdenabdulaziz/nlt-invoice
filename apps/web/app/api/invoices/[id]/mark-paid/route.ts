import { InvoiceStatus } from "@prisma/client";
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

  const invoice = await prisma.invoice.findFirst({
    where: {
      id,
      companyId: context.companyId,
    },
    select: {
      id: true,
      total: true,
    },
  });

  if (!invoice) {
    return apiError("Invoice not found.", 404);
  }

  const updatedInvoice = await prisma.invoice.update({
    where: {
      id,
    },
    data: {
      status: InvoiceStatus.PAID,
      amountPaid: invoice.total,
      balanceDue: 0,
      paidAt: new Date(),
    },
  });

  return NextResponse.json({ data: updatedInvoice });
}
