import { InvoiceList } from "@/features/invoices/components/invoice-list";
import { listInvoicesQuery } from "@/features/invoices/server/queries";

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const search = typeof searchParams?.search === "string" ? searchParams.search : undefined;
  const invoices = await listInvoicesQuery(search);

  return <InvoiceList invoices={invoices} search={search} />;
}
