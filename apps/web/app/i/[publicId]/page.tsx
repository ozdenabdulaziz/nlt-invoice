import { type InvoiceStatus } from "@prisma/client";
import { notFound } from "next/navigation";

import { PayOnlineButton } from "@/components/documents/pay-online-button";
import { PublicDocumentShell } from "@/components/documents/public-document-shell";
import { PublicInvoicePrintDocument } from "@/features/invoices/components/public-invoice-print-document";
import { InvoicePreview } from "@/features/invoices/components/invoice-preview";
import { isInvoicePayable } from "@/features/invoices/server/service";
import { getInvoiceByPublicIdQuery } from "@/features/invoices/server/queries";

function getPaymentStatusMessage(payment: string | undefined) {
  if (payment === "success") {
    return {
      message:
        "Thank you! Your payment has been received and is being processed.",
      tone: "success" as const,
    };
  }

  if (payment === "cancelled") {
    return {
      message: "Payment was cancelled. You can try again when ready.",
      tone: "error" as const,
    };
  }

  return undefined;
}

function getOfflinePaymentInstructions({
  companyEmail,
  companyPhone,
}: {
  companyEmail: string | null;
  companyPhone: string | null;
}) {
  return (
    <div className="space-y-1 text-left">
      <p className="font-medium text-foreground">Offline payment</p>
      <p>
        Please pay this invoice by bank transfer or e-transfer and include the
        invoice number in your payment reference.
      </p>
      {companyEmail ? <p>Contact: {companyEmail}</p> : null}
      {companyPhone ? <p>Phone: {companyPhone}</p> : null}
    </div>
  );
}

function getPaymentAction({
  publicId,
  status,
  balanceDue,
  currency,
  companyEmail,
  companyPhone,
}: {
  publicId: string;
  status: InvoiceStatus;
  balanceDue: string;
  currency: string;
  companyEmail: string | null;
  companyPhone: string | null;
}) {
  const balanceDueNumber = Number(balanceDue);

  if (balanceDueNumber <= 0) {
    return (
      <div className="space-y-1 text-left">
        <p className="font-medium text-foreground">Payment recorded</p>
        <p>
          This invoice has already been marked as paid. Contact the sender if you
          need a receipt or payment confirmation.
        </p>
      </div>
    );
  }

  const payable = isInvoicePayable(status, balanceDue);

  return (
    <div className="space-y-4">
      {payable ? (
        <PayOnlineButton
          publicId={publicId}
          balanceDue={balanceDue}
          currency={currency}
        />
      ) : null}
      {getOfflinePaymentInstructions({ companyEmail, companyPhone })}
    </div>
  );
}

import { headers } from "next/headers";

function isCrawler(userAgent: string | null) {
  if (!userAgent) return false;
  return /bot|crawler|spider|crawling|slackbot|whatsapp|twitterbot|linkedinbot|facebookexternalhit|applebot|discordbot/i.test(
    userAgent
  );
}

export default async function PublicInvoicePage({
  params,
  searchParams,
}: {
  params: Promise<{ publicId: string }>;
  searchParams: Promise<{ payment?: string }>;
}) {
  const { publicId } = await params;
  const { payment } = await searchParams;
  const headersList = await headers();
  const userAgent = headersList.get("user-agent");
  const trackView = !isCrawler(userAgent);

  const invoice = await getInvoiceByPublicIdQuery(publicId, trackView);

  if (!invoice) {
    notFound();
  }

  const statusMessage = getPaymentStatusMessage(payment);

  return (
    <>
      <div className="document-screen-only">
        <PublicDocumentShell
          kind="invoice"
          publicId={publicId}
          statusMessage={statusMessage}
          paymentAction={getPaymentAction({
            publicId,
            status: invoice.status,
            balanceDue: invoice.balanceDue.toString(),
            currency: invoice.currency,
            companyEmail: invoice.companyEmail,
            companyPhone: invoice.companyPhone,
          })}
          pdfUrl={`/api/invoices/public/${publicId}/pdf`}
        >
          <div className="bg-white rounded-[24px] shadow-sm border border-slate-200 overflow-hidden w-full max-w-[850px]">
            <InvoicePreview data={{
              documentTitle: "INVOICE",
              status: invoice.status,
              companyName: invoice.companyName || "Your Company",
              companyAddress: [
                invoice.companyAddressLine1,
                invoice.companyAddressLine2,
                [invoice.companyCity, invoice.companyProvince, invoice.companyPostalCode].filter(Boolean).join(", "),
                invoice.companyCountry,
              ].filter(Boolean) as string[],
              companyPhone: invoice.companyPhone || undefined,
              companyEmail: invoice.companyEmail || undefined,
              
              customerCompanyName: invoice.customerCompanyName || invoice.customerName || "Customer Company",
              customerName: invoice.customerCompanyName ? invoice.customerName || undefined : undefined,
              customerAddress: [
                invoice.customerBillingAddressLine1,
                invoice.customerBillingAddressLine2,
                [invoice.customerBillingCity, invoice.customerBillingProvince, invoice.customerBillingPostalCode].filter(Boolean).join(", "),
                invoice.customerBillingCountry,
              ].filter(Boolean) as string[],
              customerPhone: invoice.customerPhone || undefined,
              customerEmail: invoice.customerEmail || undefined,
              
              invoiceNumber: invoice.invoiceNumber,
              issueDate: invoice.issueDate.toISOString(),
              dueDate: invoice.dueDate.toISOString(),
              currency: invoice.currency,
              
              items: invoice.items.map((item) => ({
                id: item.id,
                name: item.name,
                quantity: Number(item.quantity),
                unitPrice: Number(item.unitPrice),
                taxAmount: 0,
                lineTotal: Number(item.lineTotal),
              })),
              
              subtotal: Number(invoice.subtotal),
              discountAmount: Number(invoice.discountTotal),
              taxTotal: Number(invoice.taxTotal),
              total: Number(invoice.total),
              amountDue: Number(invoice.balanceDue),
              notes: invoice.notes || undefined,
            }} />
          </div>
        </PublicDocumentShell>
      </div>
      <PublicInvoicePrintDocument invoice={invoice} />
    </>
  );
}
