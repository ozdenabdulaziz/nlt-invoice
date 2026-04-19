import { PageHeader } from "@/components/shared/page-header";
import { StatusBanner } from "@/components/shared/status-banner";
import { InvoiceCustomerEmptyState } from "@/features/invoices/components/invoice-customer-empty-state";
import { InvoiceForm } from "@/features/invoices/components/invoice-form";
import { getEmptyInvoiceFormValues } from "@/features/invoices/form-values";
import { listInvoiceCustomerOptionsQuery } from "@/features/invoices/server/queries";
import { listSavedItemOptionsQuery } from "@/features/items/server/queries";

export default async function NewInvoicePage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const customerId = typeof searchParams?.customerId === "string" ? searchParams.customerId : undefined;
  const [customers, savedItems] = await Promise.all([
    listInvoiceCustomerOptionsQuery(),
    listSavedItemOptionsQuery(),
  ]);
  const hasSelectedCustomer =
    !!customerId && customers.some((customer) => customer.id === customerId);
  const initialCustomerId = hasSelectedCustomer ? customerId : "";
  const customerSelectionMessage =
    customerId && !hasSelectedCustomer
      ? "Selected customer could not be found. Choose a customer to continue."
      : undefined;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Invoices"
        title="Create a new invoice"
        description="Build a simple invoice with company-scoped customer data, line items, and reliable server-calculated totals."
      />
      {customers.length ? (
        <>
          <StatusBanner message={customerSelectionMessage} />
          <InvoiceForm
            mode="create"
            customers={customers}
            savedItems={savedItems}
            defaultValues={getEmptyInvoiceFormValues(initialCustomerId)}
            cancelHref="/dashboard/invoices"
          />
        </>
      ) : (
        <InvoiceCustomerEmptyState />
      )}
    </div>
  );
}
