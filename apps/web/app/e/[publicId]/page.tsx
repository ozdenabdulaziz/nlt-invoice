import { EstimateStatus } from "@prisma/client";
import { notFound } from "next/navigation";

import { PublicDocumentShell } from "@/components/documents/public-document-shell";
import { prisma } from "@/lib/prisma/client";

export default async function PublicEstimatePage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;

  const estimate = await prisma.estimate.findUnique({
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

  if (!estimate) {
    notFound();
  }

  if (estimate.status === EstimateStatus.SENT) {
    await prisma.estimate.update({
      where: {
        id: estimate.id,
      },
      data: {
        status: EstimateStatus.VIEWED,
        viewedAt: new Date(),
      },
    });
  }

  return (
    <PublicDocumentShell
      kind="estimate"
      publicId={publicId}
      documentNumber={estimate.estimateNumber}
      status={estimate.status === EstimateStatus.SENT ? EstimateStatus.VIEWED : estimate.status}
      issueDate={estimate.issueDate}
      secondaryDateLabel="Expiry date"
      secondaryDate={estimate.expiryDate}
      currency={estimate.currency}
      subtotal={estimate.subtotal.toString()}
      taxTotal={estimate.taxTotal.toString()}
      discountTotal={estimate.discountTotal.toString()}
      total={estimate.total.toString()}
      notes={estimate.notes}
      terms={estimate.terms}
      company={estimate.company}
      customer={estimate.customer}
      items={estimate.items.map((item) => ({
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
