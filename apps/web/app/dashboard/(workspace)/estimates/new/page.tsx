import { StatusBanner } from "@/components/shared/status-banner";
import { EstimateCustomerEmptyState } from "@/features/estimates/components/estimate-customer-empty-state";
import { ModernEstimateForm } from "@/features/estimates/components/modern-estimate-form";
import { listEstimateCustomerOptionsQuery } from "@/features/estimates/server/queries";
import { listSavedItemOptionsQuery } from "@/features/items/server/queries";
import { requireCompanyContext } from "@/lib/auth/session";

export default async function NewEstimatePage({
  searchParams,
}: {
  searchParams: Promise<{ customerId?: string }>;
}) {
  const { customerId } = await searchParams;
  const [customers, savedItems, context] = await Promise.all([
    listEstimateCustomerOptionsQuery(),
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
          <ModernEstimateForm
            customers={customers}
            recentCustomers={customers.slice(0, 5)}
            savedItems={savedItems}
            settings={settings}
            nextEstimateNumber={company.nextEstimateNumber}
            defaultValues={{
              customerId: initialCustomerId,
            }}
          />
        </>
      ) : (
        <div className="max-w-[1024px] mx-auto px-4 pt-6">
          <EstimateCustomerEmptyState />
        </div>
      )}
    </div>
  );
}
