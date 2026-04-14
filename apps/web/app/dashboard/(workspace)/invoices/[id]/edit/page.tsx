import { notFound } from "next/navigation";

import { PageHeader } from "@/components/shared/page-header";
import { InvoiceForm } from "@/features/invoices/components/invoice-form";
import { mapInvoiceToFormValues } from "@/features/invoices/form-values";
import { listSavedItemOptionsQuery } from "@/features/items/server/queries";
import {
  getInvoiceByIdQuery,
  listInvoiceCustomerOptionsQuery,
} from "@/features/invoices/server/queries";

export default async function EditInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [invoice, customers, savedItems] = await Promise.all([
    getInvoiceByIdQuery(id),
    listInvoiceCustomerOptionsQuery(),
    listSavedItemOptionsQuery(),
  ]);

  if (!invoice) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Invoices"
        title={`Edit ${invoice.invoiceNumber}`}
        description="Update invoice details without changing company-scoped numbering or the public link."
      />
      <InvoiceForm
        mode="edit"
        invoiceId={invoice.id}
        customers={customers}
        savedItems={savedItems}
        defaultValues={mapInvoiceToFormValues(invoice)}
        cancelHref={`/dashboard/invoices/${invoice.id}`}
      />
    </div>
  );
}
