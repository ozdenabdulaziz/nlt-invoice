import { FeaturePlaceholder } from "@/components/shared/feature-placeholder";
import { PageHeader } from "@/components/shared/page-header";

export default async function EstimateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Estimates"
        title={`Estimate detail placeholder for ${id}`}
        description="This dynamic route will later show the estimate summary, send state, and conversion controls."
      />
      <FeaturePlaceholder
        title="Estimate detail route"
        description="The route shape is fixed now so public links, edit links, and invoice conversion hooks can build on it later."
        highlights={[
          "Protected detail route and public detail route are intentionally separate.",
          "Document totals persist on the estimate record for snapshot consistency.",
          "Approved estimates will convert into one invoice in MVP.",
        ]}
      />
    </div>
  );
}
