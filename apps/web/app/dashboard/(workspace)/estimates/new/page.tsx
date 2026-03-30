import { PageHeader } from "@/components/shared/page-header";
import { EstimateCustomerEmptyState } from "@/features/estimates/components/estimate-customer-empty-state";
import {
  EstimateForm,
  getEmptyEstimateFormValues,
} from "@/features/estimates/components/estimate-form";
import { listEstimateCustomerOptionsQuery } from "@/features/estimates/server/queries";

export default async function NewEstimatePage() {
  const customers = await listEstimateCustomerOptionsQuery();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Estimates"
        title="Create a new estimate"
        description="Build a simple estimate with company-scoped customer data, line items, and reliable server-calculated totals."
      />
      {customers.length ? (
        <EstimateForm
          mode="create"
          customers={customers}
          defaultValues={getEmptyEstimateFormValues()}
          cancelHref="/dashboard/estimates"
        />
      ) : (
        <EstimateCustomerEmptyState />
      )}
    </div>
  );
}
