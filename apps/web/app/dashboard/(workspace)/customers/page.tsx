import { CustomerList } from "@/features/customers/components/customer-list";
import { listCustomersQuery } from "@/features/customers/server/queries";

export const dynamic = "force-dynamic";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const search = typeof searchParams?.search === "string" ? searchParams.search : undefined;
  const success = typeof searchParams?.success === "string" ? searchParams.success : undefined;
  const customers = await listCustomersQuery(search);

  return <CustomerList customers={customers} search={search} success={success} />;
}
