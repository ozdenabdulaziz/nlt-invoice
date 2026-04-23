import { StatusBanner } from "@/components/shared/status-banner";
import { InvoiceCustomerEmptyState } from "@/features/invoices/components/invoice-customer-empty-state";
import { ModernInvoiceForm } from "@/features/invoices/components/modern-invoice-form";
import { getEmptyInvoiceFormValues } from "@/features/invoices/form-values";
import { listInvoiceCustomerOptionsQuery } from "@/features/invoices/server/queries";
import { listSavedItemOptionsQuery } from "@/features/items/server/queries";

export default async function NewInvoicePage({
  searchParams,
}: {
  searchParams: Promise<{ customerId?: string }>;
}) {
  const { customerId } = await searchParams;
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

  // Mocked Settings as per instructions
  const mockSettings = {
    logo: null,
    businessName: "Acme Corp",
    businessAddress: "123 Business St, Suite 100",
    businessPhone: "(555) 123-4567",
    businessEmail: "billing@acmecorp.com",
    paymentInstructions: "Please send an e-Transfer to billing@acmecorp.com. Include your invoice number in the message. For wire transfers, contact us for details.",
    defaultCurrency: "CAD",
  };

  return (
    <div className="w-full">
      {customers.length ? (
        <>
          {customerSelectionMessage && (
            <div className="max-w-[800px] mx-auto pt-4 px-4">
              <StatusBanner message={customerSelectionMessage} />
            </div>
          )}
          <ModernInvoiceForm
            customers={customers}
            savedItems={savedItems}
            defaultValues={{
              customerId: initialCustomerId,
            }}
            settings={mockSettings}
            nextInvoiceNumber={1001} // Mocked next invoice number
          />
        </>
      ) : (
        <div className="max-w-[800px] mx-auto pt-8 px-4">
          <InvoiceCustomerEmptyState />
        </div>
      )}
    </div>
  );
}
