import { FeaturePlaceholder } from "@/components/shared/feature-placeholder";
import { PageHeader } from "@/components/shared/page-header";

export default function NewEstimatePage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Estimates"
        title="New estimate page placeholder"
        description="This route will host the estimate builder with line items, taxes, and notes."
      />
      <FeaturePlaceholder
        title="Estimate builder coming next"
        description="The estimate create flow will be server-first, with line-item totals stored as decimal snapshots."
        highlights={[
          "Estimate items already have quantity, unit price, line total, and sort order in Prisma.",
          "Public link support is reserved through the `publicId` field.",
          "Conversion to invoice will reuse this data shape later.",
        ]}
      />
    </div>
  );
}
