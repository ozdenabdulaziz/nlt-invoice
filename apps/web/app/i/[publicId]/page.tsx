import { type InvoiceStatus } from "@prisma/client";
import { notFound } from "next/navigation";

import { PayOnlineButton } from "@/components/documents/pay-online-button";
import { PublicDocumentShell } from "@/components/documents/public-document-shell";
import { PublicInvoicePrintDocument } from "@/features/invoices/components/public-invoice-print-document";
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
          documentNumber={invoice.invoiceNumber}
          status={invoice.status}
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
          issueDate={invoice.issueDate}
          secondaryDateLabel="Due date"
          secondaryDate={invoice.dueDate}
          currency={invoice.currency}
          subtotal={invoice.subtotal.toString()}
          taxTotal={invoice.taxTotal.toString()}
          discountTotal={invoice.discountTotal.toString()}
          total={invoice.total.toString()}
          amountPaid={invoice.amountPaid.toString()}
          balanceDue={invoice.balanceDue.toString()}
          notes={invoice.notes}
          terms={invoice.terms}
          company={{
            companyName: invoice.companyName,
            email: invoice.companyEmail,
            phone: invoice.companyPhone,
            website: invoice.companyWebsite,
            addressLine1: invoice.companyAddressLine1,
            addressLine2: invoice.companyAddressLine2,
            city: invoice.companyCity,
            province: invoice.companyProvince,
            postalCode: invoice.companyPostalCode,
            country: invoice.companyCountry,
            taxNumber: invoice.companyTaxNumber,
          }}
          customer={{
            name: invoice.customerName || "Customer",
            companyName: invoice.customerCompanyName,
            email: invoice.customerEmail,
            phone: invoice.customerPhone,
            billingAddressLine1: invoice.customerBillingAddressLine1,
            billingAddressLine2: invoice.customerBillingAddressLine2,
            billingCity: invoice.customerBillingCity,
            billingProvince: invoice.customerBillingProvince,
            billingPostalCode: invoice.customerBillingPostalCode,
            billingCountry: invoice.customerBillingCountry,
            shippingSameAsBilling: invoice.customerShippingSameAsBilling,
            shippingAddressLine1: invoice.customerShippingAddressLine1,
            shippingAddressLine2: invoice.customerShippingAddressLine2,
            shippingCity: invoice.customerShippingCity,
            shippingProvince: invoice.customerShippingProvince,
            shippingPostalCode: invoice.customerShippingPostalCode,
            shippingCountry: invoice.customerShippingCountry,
          }}
          items={invoice.items.map((item) => ({
            id: item.id,
            name: item.name,
            description: item.description,
            unitType: item.unitType,
            quantity: item.quantity.toString(),
            unitPrice: item.unitPrice.toString(),
            taxRate: item.taxRate.toString(),
            lineTotal: item.lineTotal.toString(),
          }))}
        />
      </div>
      <PublicInvoicePrintDocument invoice={invoice} />
    </>
  );
}
