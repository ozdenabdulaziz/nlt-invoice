import { PageHeader } from "@/components/shared/page-header";
import { InvoiceCustomerEmptyState } from "@/features/invoices/components/invoice-customer-empty-state";
import {
  InvoiceForm,
  getEmptyInvoiceFormValues,
} from "@/features/invoices/components/invoice-form";
import { listInvoiceCustomerOptionsQuery } from "@/features/invoices/server/queries";

export default async function NewInvoicePage({
  searchParams,
}: {
  searchParams: Promise<{ customerId?: string }>;
}) {
  const { customerId } = await searchParams;
  const customers = await listInvoiceCustomerOptionsQuery();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Invoices"
        title="Create a new invoice"
        description="Build a simple invoice with company-scoped customer data, line items, and reliable server-calculated totals."
      />
      {customers.length ? (
        <InvoiceForm
          mode="create"
          customers={customers}
          defaultValues={getEmptyInvoiceFormValues(customerId)}
          cancelHref="/dashboard/invoices"
        />
      ) : (
        <InvoiceCustomerEmptyState />
      )}
    </div>
  );
}
