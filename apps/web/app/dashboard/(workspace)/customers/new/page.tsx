import { FeaturePlaceholder } from "@/components/shared/feature-placeholder";
import { PageHeader } from "@/components/shared/page-header";

export default function NewCustomerPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Customers"
        title="New customer form placeholder"
        description="The route and layout are locked. The actual form lands in the customer CRUD phase."
      />
      <FeaturePlaceholder
        title="Future create-customer flow"
        description="This page will host the first production customer form with company details, notes, and usage checks."
        highlights={[
          "Route handlers will own canonical customer creation.",
          "Zod validation and React Hook Form are already in place.",
          "Free plan customer caps will be evaluated before insert.",
        ]}
      />
    </div>
  );
}
