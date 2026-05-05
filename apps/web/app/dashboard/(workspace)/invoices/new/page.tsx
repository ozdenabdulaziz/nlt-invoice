import { StatusBanner } from "@/components/shared/status-banner";
import { InvoiceCustomerEmptyState } from "@/features/invoices/components/invoice-customer-empty-state";
import { ModernInvoiceForm } from "@/features/invoices/components/modern-invoice-form";
import { listInvoiceCustomerOptionsQuery, listRecentInvoiceCustomerOptionsQuery } from "@/features/invoices/server/queries";
import { listSavedItemOptionsQuery } from "@/features/items/server/queries";
import { requireCompanyContext } from "@/lib/auth/session";

export default async function NewInvoicePage({
  searchParams,
}: {
  searchParams: Promise<{ customerId?: string }>;
}) {
  const { customerId } = await searchParams;
  const [customers, recentCustomers, savedItems, context] = await Promise.all([
    listInvoiceCustomerOptionsQuery(),
    listRecentInvoiceCustomerOptionsQuery(),
    listSavedItemOptionsQuery(),
    requireCompanyContext(),
  ]);
  const hasSelectedCustomer =
    !!customerId && customers.some((customer) => customer.id === customerId);
  const initialCustomerId = hasSelectedCustomer ? customerId : "";
  const customerSelectionMessage =
    customerId && !hasSelectedCustomer
      ? "Selected customer could not be found. Choose a customer to continue."
      : undefined;

  const { company } = context;

  const settings = {
    logo: company.logoUrl,
    businessName: company.companyName || "Your Company",
    businessAddress: [
      company.addressLine1,
      company.addressLine2,
      [company.city, company.province, company.postalCode].filter(Boolean).join(", "),
      company.country,
    ]
      .filter(Boolean)
      .join("\n"),
    businessPhone: company.phone || "",
    businessEmail: company.email || "",
    defaultCurrency: company.currency,
  };

  return (
    <div className="w-full">
      {customers.length ? (
        <>
          {customerSelectionMessage && (
            <div className="max-w-[1000px] mx-auto pt-4 px-4">
              <StatusBanner message={customerSelectionMessage} />
            </div>
          )}
          <ModernInvoiceForm
            customers={customers}
            recentCustomers={recentCustomers}
            savedItems={savedItems}
            defaultValues={{
              customerId: initialCustomerId,
            }}
            settings={settings}
            nextInvoiceNumber={company.nextInvoiceNumber}
          />
        </>
      ) : (
        <div className="max-w-[1000px] mx-auto pt-8 px-4">
          <InvoiceCustomerEmptyState />
        </div>
      )}
    </div>
  );
}
