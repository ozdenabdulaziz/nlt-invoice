import { FeaturePlaceholder } from "@/components/shared/feature-placeholder";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { getDashboardOverviewQuery } from "@/features/dashboard/server/queries";

function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency,
  }).format(value);
}

export default async function DashboardPage() {
  const overview = await getDashboardOverviewQuery();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Dashboard"
        title={`Welcome back, ${overview.userName}.`}
        description="Track the MVP revenue loop from one place: customers created, invoices sent, and revenue collected."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total invoices"
          value={overview.invoiceCount.toString()}
          hint="Company-scoped invoices across draft, sent, and paid states."
        />
        <StatCard
          label="Revenue collected"
          value={formatCurrency(overview.paidRevenue, overview.currency)}
          hint="Based on recorded payments for partial and fully paid invoices."
        />
        <StatCard
          label="Customers"
          value={overview.customerCount.toString()}
          hint="Live company-scoped customer count."
        />
        <StatCard
          label="Current plan"
          value={overview.plan}
          hint="Billing limits continue to apply to customer and invoice creation."
        />
      </div>
      <FeaturePlaceholder
        title="Revenue loop is now connected"
        description="Create invoices, record payments, and use the public link for manual sharing while the rest of analytics stays intentionally lightweight."
        highlights={[
          `Current plan: ${overview.plan}.`,
          "Dashboard metrics are scoped to the active company.",
          "Paid revenue updates after invoice payment is recorded.",
        ]}
      />
    </div>
  );
}
