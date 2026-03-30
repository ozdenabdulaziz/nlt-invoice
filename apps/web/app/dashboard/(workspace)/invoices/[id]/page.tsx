import { FeaturePlaceholder } from "@/components/shared/feature-placeholder";
import { PageHeader } from "@/components/shared/page-header";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Invoices"
        title={`Invoice detail placeholder for ${id}`}
        description="This dynamic route will later expose send state, totals, notes, and public share controls."
      />
      <FeaturePlaceholder
        title="Invoice detail route"
        description="The route shape and protected layout are stable now, so deeper invoice work can slot in without moving URLs."
        highlights={[
          "Invoices may optionally point back to an originating estimate.",
          "Public links and print-to-PDF use a separate public route tree.",
          "Online payment collection remains excluded from the MVP.",
        ]}
      />
    </div>
  );
}
