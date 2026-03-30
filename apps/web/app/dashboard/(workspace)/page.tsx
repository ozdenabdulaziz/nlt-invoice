import { FeaturePlaceholder } from "@/components/shared/feature-placeholder";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { requireCompanyContext } from "@/lib/auth/session";

export default async function DashboardPage() {
  const context = await requireCompanyContext();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Dashboard"
        title={`Welcome back, ${context.user.name}.`}
        description="The dashboard stays intentionally light in MVP. These cards reserve the future KPI layout without pulling in heavy analytics early."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total invoices" value="0" hint="Invoice CRUD arrives in the next phases." />
        <StatCard label="Total estimates" value="0" hint="Estimate CRUD will feed this module." />
        <StatCard label="Revenue total" value="CA$0.00" hint="Computed from invoices once live data exists." />
        <StatCard label="Customers" value="0" hint="Customer usage is plan-gated from the backend." />
      </div>
      <FeaturePlaceholder
        title="Dashboard skeleton is ready"
        description="Recent invoices, recent estimates, and unpaid counts will slot into this area once the document modules move beyond scaffolding."
        highlights={[
          `Current plan: ${context.subscription.plan}.`,
          "No advanced charts are included in Phase 1.",
          "TanStack Query will hydrate list views from the new API routes.",
        ]}
      />
    </div>
  );
}
