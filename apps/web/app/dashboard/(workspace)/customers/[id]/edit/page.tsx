import { notFound } from "next/navigation";

import { PageHeader } from "@/components/shared/page-header";
import { CustomerForm } from "@/features/customers/components/customer-form";
import { mapCustomerToFormValues } from "@/features/customers/form-values";
import { getCustomerByIdQuery } from "@/features/customers/server/queries";

export default async function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await getCustomerByIdQuery(id);

  if (!customer) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Customers"
        title={`Edit ${customer.name}`}
        description="Keep contact details accurate before creating invoices and estimates."
      />
      <CustomerForm
        mode="edit"
        customerId={customer.id}
        defaultValues={mapCustomerToFormValues(customer)}
        cancelHref={`/dashboard/customers/${customer.id}`}
      />
    </div>
  );
}
