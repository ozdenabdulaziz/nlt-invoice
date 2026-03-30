import { EstimateList } from "@/components/dashboard/estimate-list";
import { PageHeader } from "@/components/shared/page-header";

export default function EstimatesPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Estimates"
        title="Estimate list"
        description="Estimates are company-scoped, status-driven, and available through the canonical route handler surface."
      />
      <EstimateList />
    </div>
  );
}
