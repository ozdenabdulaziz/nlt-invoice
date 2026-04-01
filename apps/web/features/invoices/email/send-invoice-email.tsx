import { render } from "@react-email/components";
import { renderToBuffer } from "@react-pdf/renderer";
import { InvoiceStatus, Prisma } from "@prisma/client";

import { InvoiceEmail } from "@/features/invoices/email/invoice-email";
import { InvoicePdfDocument } from "@/features/invoices/pdf/invoice-pdf-document";
import { prisma } from "@/lib/prisma/client";
import { getResend } from "@/lib/email/resend";
import { getAppUrl } from "@/lib/app-url";

export class InvoiceSendError extends Error {
  constructor(
    public readonly code:
      | "not-found"
      | "no-recipient-email"
      | "no-sender-email"
      | "resend-error",
    message: string,
  ) {
    super(message);
    this.name = "InvoiceSendError";
  }
}

type SendInvoiceInput = {
  invoiceId: string;
  companyId: string;
  senderNote?: string | null;
  /** Override the app base URL (useful in tests) */
  appUrl?: string;
};

export async function sendInvoiceByEmail(input: SendInvoiceInput) {
  const invoice = await prisma.invoice.findFirst({
    where: {
      id: input.invoiceId,
      companyId: input.companyId,
    },
    select: {
      id: true,
      publicId: true,
      invoiceNumber: true,
      status: true,
      currency: true,
      total: true,
      dueDate: true,
      companyName: true,
      companyEmail: true,
      companyPhone: true,
      companyWebsite: true,
      companyAddressLine1: true,
      companyAddressLine2: true,
      companyCity: true,
      companyProvince: true,
      companyPostalCode: true,
      companyCountry: true,
      companyTaxNumber: true,
      customerName: true,
      customerCompanyName: true,
      customerEmail: true,
      customerPhone: true,
      customerBillingAddressLine1: true,
      customerBillingAddressLine2: true,
      customerBillingCity: true,
      customerBillingProvince: true,
      customerBillingPostalCode: true,
      customerBillingCountry: true,
      customerShippingSameAsBilling: true,
      customerShippingAddressLine1: true,
      customerShippingAddressLine2: true,
      customerShippingCity: true,
      customerShippingProvince: true,
      customerShippingPostalCode: true,
      customerShippingCountry: true,
      subtotal: true,
      taxTotal: true,
      discountType: true,
      discountValue: true,
      discountTotal: true,
      amountPaid: true,
      balanceDue: true,
      notes: true,
      terms: true,
      issueDate: true,
      sentAt: true,
      items: {
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          name: true,
          description: true,
          quantity: true,
          unitPrice: true,
          taxRate: true,
          lineTotal: true,
          sortOrder: true,
        },
      },
    },
  });

  if (!invoice) {
    throw new InvoiceSendError("not-found", "Invoice not found.");
  }

  if (!invoice.customerEmail) {
    throw new InvoiceSendError(
      "no-recipient-email",
      "This invoice has no customer email address. Please add one to the customer before sending.",
    );
  }

  if (!invoice.companyEmail) {
    throw new InvoiceSendError(
      "no-sender-email",
      "Your company profile has no email address. Please add one in Settings before sending.",
    );
  }

  const baseUrl = input.appUrl ?? getAppUrl();
  const viewUrl = `${baseUrl}/i/${invoice.publicId}`;
  const companyName = invoice.companyName ?? "Your Vendor";
  const customerName =
    invoice.customerCompanyName ?? invoice.customerName ?? "Customer";
  const dueDate = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(invoice.dueDate));

  // Render email HTML
  const html = await render(
    <InvoiceEmail
      companyName={companyName}
      customerName={customerName}
      invoiceNumber={invoice.invoiceNumber}
      invoiceTotal={invoice.total.toString()}
      currency={invoice.currency}
      dueDate={dueDate}
      viewUrl={viewUrl}
      senderNote={input.senderNote}
    />,
  );

  // Generate PDF attachment
  let pdfBuffer: Buffer | undefined;
  try {
    const buf = await renderToBuffer(<InvoicePdfDocument invoice={invoice} />);
    pdfBuffer = Buffer.from(buf);
  } catch (pdfErr) {
    // PDF generation failure should NOT block email sending.
    // Log and continue without attachment.
    console.error("[email/invoice] PDF generation failed, sending without attachment:", pdfErr);
  }

  const filename = `invoice-${invoice.invoiceNumber.replace(/[^a-z0-9-]/gi, "-")}.pdf`;

  // Send via Resend
  const resend = getResend();
  const result = await resend.emails.send({
    from: `${companyName} via NLT Invoice <invoices@resend.dev>`,
    to: invoice.customerEmail,
    replyTo: invoice.companyEmail,
    subject: `Invoice ${invoice.invoiceNumber} from ${companyName} — ${new Intl.NumberFormat("en-CA", { style: "currency", currency: invoice.currency }).format(Number(invoice.total.toString()))} due ${dueDate}`,
    html,
    attachments: pdfBuffer
      ? [
          {
            filename,
            content: pdfBuffer,
          },
        ]
      : undefined,
  });

  if (result.error) {
    console.error("[email/invoice] Resend API error:", result.error);
    throw new InvoiceSendError(
      "resend-error",
      `Email delivery failed: ${result.error.message}`,
    );
  }

  // Mark the invoice as SENT and record sentAt timestamp.
  // Only update to SENT if it was DRAFT — if already SENT/VIEWED/PAID, preserve status.
  const shouldUpdateStatus = invoice.status === InvoiceStatus.DRAFT;

  await prisma.invoice.update({
    where: { id: invoice.id },
    data: {
      sentAt: new Date(),
      ...(shouldUpdateStatus
        ? { status: InvoiceStatus.SENT }
        : {}),
    },
  });

  return {
    invoiceId: invoice.id,
    publicId: invoice.publicId,
    sentTo: invoice.customerEmail,
    resendId: result.data?.id,
  };
}
