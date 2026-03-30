import { CustomerList } from "@/components/dashboard/customer-list";
import { PageHeader } from "@/components/shared/page-header";

export default function CustomersPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Customers"
        title="Customer management route is reserved."
        description="This view will list customers, usage limits, and quick create actions. The route already exists so the dashboard shell and navigation stay stable."
      />
      <CustomerList />
    </div>
  );
}
