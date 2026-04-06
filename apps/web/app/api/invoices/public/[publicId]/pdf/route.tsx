import { renderToBuffer } from "@react-pdf/renderer";
import { NextResponse } from "next/server";

import { globalRateLimiter, getClientIp } from "@/lib/rate-limit";
import { InvoicePdfDocument } from "@/features/invoices/pdf/invoice-pdf-document";
import { getInvoiceByPublicId } from "@/features/invoices/server/service";

export const runtime = "nodejs";

const PDF_RATE_LIMIT = 20; // 20 downloads per IP per hour
const PDF_RATE_WINDOW = 60 * 60 * 1000;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ publicId: string }> },
) {
  const ip = await getClientIp();
  const rateLimitResult = await globalRateLimiter.check({
    id: `public_pdf_${ip}`,
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

  // Use getInvoiceByPublicId but without the SENT→VIEWED side effect for this route.
  // We fetch directy to avoid mutating status on a PDF download.
  const invoice = await getInvoiceByPublicId(publicId, false);

  if (!invoice) {
    return NextResponse.json({ message: "Invoice not found." }, { status: 404 });
  }

  try {
    const buffer = await renderToBuffer(
      <InvoicePdfDocument invoice={invoice} />,
    );

    const filename = `invoice-${invoice.invoiceNumber.replace(/[^a-z0-9-]/gi, "-")}.pdf`;

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filename}"`,
        "Cache-Control": "private, no-cache",
      },
    });
  } catch (err) {
    console.error("[pdf/public-invoice] Failed to generate PDF:", err);
    return NextResponse.json(
      { message: "Failed to generate PDF." },
      { status: 500 },
    );
  }
}
