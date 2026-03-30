import { InvoiceStatus } from "@prisma/client";
import { notFound } from "next/navigation";

import { PublicDocumentShell } from "@/components/documents/public-document-shell";
import { prisma } from "@/lib/prisma/client";

export default async function PublicInvoicePage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: {
      publicId,
    },
    include: {
      company: true,
      customer: true,
      items: {
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
  });

  if (!invoice) {
    notFound();
  }

  if (invoice.status === InvoiceStatus.SENT) {
    await prisma.invoice.update({
      where: {
        id: invoice.id,
      },
      data: {
        status: InvoiceStatus.VIEWED,
        viewedAt: new Date(),
      },
    });
  }

  return (
    <PublicDocumentShell
      kind="invoice"
      publicId={publicId}
      documentNumber={invoice.invoiceNumber}
      status={invoice.status === InvoiceStatus.SENT ? InvoiceStatus.VIEWED : invoice.status}
      issueDate={invoice.issueDate}
      secondaryDateLabel="Due date"
      secondaryDate={invoice.dueDate}
      currency={invoice.currency}
      subtotal={invoice.subtotal.toString()}
      taxTotal={invoice.taxTotal.toString()}
      discountTotal={invoice.discountTotal.toString()}
      total={invoice.total.toString()}
      amountPaid={invoice.amountPaid.toString()}
      balanceDue={invoice.balanceDue.toString()}
      notes={invoice.notes}
      terms={invoice.terms}
      company={invoice.company}
      customer={invoice.customer}
      items={invoice.items.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        quantity: item.quantity.toString(),
        unitPrice: item.unitPrice.toString(),
        taxRate: item.taxRate.toString(),
        lineTotal: item.lineTotal.toString(),
      }))}
    />
  );
}
