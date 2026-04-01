import { notFound } from "next/navigation";

import { PageHeader } from "@/components/shared/page-header";
import { EstimateForm } from "@/features/estimates/components/estimate-form";
import { mapEstimateToFormValues } from "@/features/estimates/form-values";
import {
  getEstimateByIdQuery,
  listEstimateCustomerOptionsQuery,
} from "@/features/estimates/server/queries";

export default async function EditEstimatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [estimate, customers] = await Promise.all([
    getEstimateByIdQuery(id),
    listEstimateCustomerOptionsQuery(),
  ]);

  if (!estimate) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Estimates"
        title={`Edit ${estimate.estimateNumber}`}
        description="Update estimate details without changing its company-scoped numbering or public link."
      />
      <EstimateForm
        mode="edit"
        estimateId={estimate.id}
        customers={customers}
        defaultValues={mapEstimateToFormValues(estimate)}
        cancelHref={`/dashboard/estimates/${estimate.id}`}
      />
    </div>
  );
}
