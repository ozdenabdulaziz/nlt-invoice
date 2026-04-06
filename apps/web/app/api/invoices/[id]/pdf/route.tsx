import { renderToBuffer } from "@react-pdf/renderer";
import { NextResponse } from "next/server";

import { globalRateLimiter, getClientIp } from "@/lib/rate-limit";
import { InvoicePdfDocument } from "@/features/invoices/pdf/invoice-pdf-document";
import { getInvoiceByIdForCompany } from "@/features/invoices/server/service";
import { requireCompanyContext } from "@/lib/auth/session";

export const runtime = "nodejs";

const PDF_RATE_LIMIT = 100; // 100 downloads per IP per hour
const PDF_RATE_WINDOW = 60 * 60 * 1000;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const ip = await getClientIp();
  const rateLimitResult = await globalRateLimiter.check({
    id: `auth_pdf_${ip}`,
    limit: PDF_RATE_LIMIT,
    windowMs: PDF_RATE_WINDOW,
  });

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { message: "Too many PDF downloads. Please try again later." },
      { status: 429 },
    );
  }

  const { id } = await params;

  const context = await requireCompanyContext();

  const invoice = await getInvoiceByIdForCompany(id, context.company.id);

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
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-cache",
      },
    });
  } catch (err) {
    console.error("[pdf/invoice] Failed to generate PDF:", err);
    return NextResponse.json(
      { message: "Failed to generate PDF." },
      { status: 500 },
    );
  }
}
