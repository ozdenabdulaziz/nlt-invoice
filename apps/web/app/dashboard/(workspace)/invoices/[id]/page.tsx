import { notFound } from "next/navigation";

import { InvoiceDetail } from "@/features/invoices/components/invoice-detail";
import { getInvoiceByIdQuery } from "@/features/invoices/server/queries";
export default async function InvoiceDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const { id } = await params;
  const success = typeof searchParams?.success === "string" ? searchParams.success : undefined;
  const invoice = await getInvoiceByIdQuery(id);

  if (!invoice) {
    notFound();
  }

  return <InvoiceDetail invoice={invoice} success={success} />;
}
