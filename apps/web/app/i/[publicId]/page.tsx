import { notFound } from "next/navigation";

import { PublicDocumentShell } from "@/components/documents/public-document-shell";
import { PublicInvoiceCheckoutButton } from "@/features/invoices/components/public-invoice-checkout-button";
import { getInvoiceByPublicIdQuery } from "@/features/invoices/server/queries";
import { isInvoicePayable } from "@/features/invoices/server/service";

function getPaymentStatusMessage(
  payment: string | undefined,
  status: string,
) {
  if (payment === "canceled") {
    return {
      tone: "error" as const,
      message: "Checkout was canceled. You can try again anytime.",
    };
  }

  if (payment === "success") {
    return {
      tone: "success" as const,
      message:
        status === "PAID"
          ? "Payment received successfully."
          : "Payment submitted. Confirmation may take a moment.",
    };
  }

  return undefined;
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
  const invoice = await getInvoiceByPublicIdQuery(publicId);

  if (!invoice) {
    notFound();
  }

  return (
    <PublicDocumentShell
      kind="invoice"
      publicId={publicId}
      documentNumber={invoice.invoiceNumber}
      status={invoice.status}
      statusMessage={getPaymentStatusMessage(payment, invoice.status)}
      paymentAction={
        <PublicInvoiceCheckoutButton
          publicId={invoice.publicId}
          isDisabled={!isInvoicePayable(invoice.status, invoice.balanceDue)}
        />
      }
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
        quantity: item.quantity.toString(),
        unitPrice: item.unitPrice.toString(),
        taxRate: item.taxRate.toString(),
        lineTotal: item.lineTotal.toString(),
      }))}
    />
  );
}
