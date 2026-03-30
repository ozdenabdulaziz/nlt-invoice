import { PageHeader } from "@/components/shared/page-header";
import {
  CustomerForm,
  getEmptyCustomerFormValues,
} from "@/features/customers/components/customer-form";

export default function NewCustomerPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Customers"
        title="Create a new customer"
        description="Add billing and shipping details once so invoice and estimate workflows stay fast."
      />
      <CustomerForm
        mode="create"
        defaultValues={getEmptyCustomerFormValues()}
        cancelHref="/dashboard/customers"
      />
    </div>
  );
}
