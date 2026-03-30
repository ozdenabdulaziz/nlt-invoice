import { InvoiceList } from "@/features/invoices/components/invoice-list";
import { listInvoicesQuery } from "@/features/invoices/server/queries";

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { search } = await searchParams;
  const invoices = await listInvoicesQuery(search);

  return <InvoiceList invoices={invoices} search={search} />;
}
