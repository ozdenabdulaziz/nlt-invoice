import { notFound } from "next/navigation";

import { InvoiceDetail } from "@/features/invoices/components/invoice-detail";
import { getInvoiceByIdQuery } from "@/features/invoices/server/queries";
export default async function InvoiceDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ success?: string }>;
}) {
  const { id } = await params;
  const { success } = await searchParams;
  const invoice = await getInvoiceByIdQuery(id);

  if (!invoice) {
    notFound();
  }

  return <InvoiceDetail invoice={invoice} success={success} />;
}
