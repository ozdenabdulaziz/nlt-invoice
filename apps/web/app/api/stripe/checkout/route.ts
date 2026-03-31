import { NextResponse } from "next/server";

import { getInvoiceByPublicId } from "@/features/invoices/server/service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const payload = (await request.json()) as {
    publicId?: string;
  };
  const publicId = payload.publicId?.trim() ?? "";

  if (!publicId) {
    return NextResponse.json(
      {
        message: "Invoice not found.",
      },
      {
        status: 400,
      },
    );
  }

  const invoice = await getInvoiceByPublicId(publicId);

  if (!invoice) {
    return NextResponse.json(
      {
        message: "Invoice not found.",
      },
      {
        status: 404,
      },
    );
  }

  console.info("[stripe/checkout] blocked for invoice", {
    publicId,
    invoiceId: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    status: invoice.status,
    balanceDue: invoice.balanceDue.toString(),
  });

  return NextResponse.json(
    {
      message:
        "Online invoice payments are disabled. Please contact the sender for bank transfer or e-transfer instructions.",
    },
    {
      status: 409,
    },
  );
}
