import { Prisma } from "@prisma/client";
import { renderToBuffer } from "@react-pdf/renderer";
import { NextResponse } from "next/server";

import { globalRateLimiter, getClientIp } from "@/lib/rate-limit";
import { InvoicePdfDocument } from "@/features/invoices/pdf/invoice-pdf-document";
import { getEstimateByPublicId } from "@/features/estimates/server/service";

export const runtime = "nodejs";

const PDF_RATE_LIMIT = 20; // 20 downloads per IP per hour
const PDF_RATE_WINDOW = 60 * 60 * 1000;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ publicId: string }> },
) {
  const ip = await getClientIp();
  const rateLimitResult = await globalRateLimiter.check({
    id: `public_estimate_pdf_${ip}`,
    limit: PDF_RATE_LIMIT,
    windowMs: PDF_RATE_WINDOW,
  });

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { message: "Too many PDF downloads. Please try again later." },
      { status: 429 },
    );
  }

  const { publicId } = await params;

  // Skip the SENT→VIEWED side effect for PDF downloads.
  const estimate = await getEstimateByPublicId(publicId, false);

  if (!estimate) {
    return NextResponse.json({ message: "Estimate not found." }, { status: 404 });
  }

  const invoice = {
    ...estimate,
    invoiceNumber: estimate.estimateNumber,
    dueDate: estimate.expiryDate,
    amountPaid: new Prisma.Decimal(0),
    balanceDue: estimate.total,
  };

  try {
    const buffer = await renderToBuffer(
      <InvoicePdfDocument invoice={invoice} kind="estimate" />,
    );

    const filename = `estimate-${invoice.invoiceNumber.replace(/[^a-z0-9-]/gi, "-")}.pdf`;

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filename}"`,
        "Cache-Control": "private, no-cache",
      },
    });
  } catch (err) {
    console.error("[pdf/public-estimate] Failed to generate PDF:", err);
    return NextResponse.json(
      { message: "Failed to generate PDF." },
      { status: 500 },
    );
  }
}
