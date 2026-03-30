import { FeaturePlaceholder } from "@/components/shared/feature-placeholder";
import { PageHeader } from "@/components/shared/page-header";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Customers"
        title={`Customer detail route ready for ${id}`}
        description="Dynamic customer routes are in place so links, layouts, and access control do not need to change once CRUD is implemented."
      />
      <FeaturePlaceholder
        title="Customer details placeholder"
        description="This page will show contact info, address data, and related estimates/invoices."
        highlights={[
          "Dynamic company-scoped route segment is already working.",
          "Protected route guard is inherited from the app shell.",
          "Detail pages will share a common data loader later.",
        ]}
      />
    </div>
  );
}
