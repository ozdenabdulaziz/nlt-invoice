import { notFound } from "next/navigation";

import { PageHeader } from "@/components/shared/page-header";
import {
  InvoiceForm,
  mapInvoiceToFormValues,
} from "@/features/invoices/components/invoice-form";
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
  const [invoice, customers] = await Promise.all([
    getInvoiceByIdQuery(id),
    listInvoiceCustomerOptionsQuery(),
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
        defaultValues={mapInvoiceToFormValues(invoice)}
        cancelHref={`/dashboard/invoices/${invoice.id}`}
      />
    </div>
  );
}
