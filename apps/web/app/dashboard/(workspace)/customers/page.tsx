import { CustomerList } from "@/features/customers/components/customer-list";
import { listCustomersQuery } from "@/features/customers/server/queries";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; success?: string }>;
}) {
  const { search, success } = await searchParams;
  const customers = await listCustomersQuery(search);

  return <CustomerList customers={customers} search={search} success={success} />;
}
