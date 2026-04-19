import { notFound } from "next/navigation";

import { CustomerDetail } from "@/features/customers/components/customer-detail";
import { getCustomerByIdQuery } from "@/features/customers/server/queries";

export default async function CustomerDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const { id } = await params;
  const success = typeof searchParams?.success === "string" ? searchParams.success : undefined;
  const customer = await getCustomerByIdQuery(id);

  if (!customer) {
    notFound();
  }

  return <CustomerDetail customer={customer} success={success} />;
}
