import { notFound } from "next/navigation";

import { PublicDocumentShell } from "@/components/documents/public-document-shell";
import { PublicInvoicePrintDocument } from "@/features/invoices/components/public-invoice-print-document";
import { getInvoiceByPublicIdQuery } from "@/features/invoices/server/queries";

function getOfflinePaymentInstructions({
  balanceDue,
  companyEmail,
  companyPhone,
}: {
  balanceDue: string;
  companyEmail: string | null;
  companyPhone: string | null;
}) {
  if (Number(balanceDue) <= 0) {
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

export default async function PublicInvoicePage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;
  const invoice = await getInvoiceByPublicIdQuery(publicId);

  if (!invoice) {
    notFound();
  }

  return (
    <>
      <div className="document-screen-only">
        <PublicDocumentShell
          kind="invoice"
          publicId={publicId}
          documentNumber={invoice.invoiceNumber}
          status={invoice.status}
          paymentAction={getOfflinePaymentInstructions({
            balanceDue: invoice.balanceDue.toString(),
            companyEmail: invoice.companyEmail,
            companyPhone: invoice.companyPhone,
          })}
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
      </div>
      <PublicInvoicePrintDocument invoice={invoice} />
    </>
  );
}
