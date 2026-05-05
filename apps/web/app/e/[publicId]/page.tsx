import { notFound } from "next/navigation";

import { PublicDocumentShell } from "@/components/documents/public-document-shell";
import { getEstimateByPublicIdQuery } from "@/features/estimates/server/queries";
import { InvoicePreview } from "@/features/invoices/components/invoice-preview";
import { headers } from "next/headers";

function isCrawler(userAgent: string | null) {
  if (!userAgent) return false;
  return /bot|crawler|spider|crawling|slackbot|whatsapp|twitterbot|linkedinbot|facebookexternalhit|applebot|discordbot/i.test(
    userAgent
  );
}

export default async function PublicEstimatePage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;
  const headersList = await headers();
  const userAgent = headersList.get("user-agent");
  const trackView = !isCrawler(userAgent);

  const estimate = await getEstimateByPublicIdQuery(publicId, trackView);

  if (!estimate) {
    notFound();
  }

  return (
    <>
      <div className="document-screen-only">
        <PublicDocumentShell
          kind="estimate"
          publicId={publicId}
          pdfUrl={`/api/estimates/public/${publicId}/pdf`}
        >
          <div className="bg-white rounded-[24px] shadow-sm border border-slate-200 overflow-hidden w-full max-w-[850px]">
            <InvoicePreview data={{
              documentTitle: "ESTIMATE",
              status: estimate.status,
              companyName: estimate.companyName || "Your Company",
              companyAddress: [
                estimate.companyAddressLine1,
                estimate.companyAddressLine2,
                [estimate.companyCity, estimate.companyProvince, estimate.companyPostalCode].filter(Boolean).join(", "),
                estimate.companyCountry,
              ].filter(Boolean) as string[],
              companyPhone: estimate.companyPhone || undefined,
              companyEmail: estimate.companyEmail || undefined,
              
              customerCompanyName: estimate.customerCompanyName || estimate.customerName || "Customer Company",
              customerName: estimate.customerCompanyName ? estimate.customerName || undefined : undefined,
              customerAddress: [
                estimate.customerBillingAddressLine1,
                estimate.customerBillingAddressLine2,
                [estimate.customerBillingCity, estimate.customerBillingProvince, estimate.customerBillingPostalCode].filter(Boolean).join(", "),
                estimate.customerBillingCountry,
              ].filter(Boolean) as string[],
              customerPhone: estimate.customerPhone || undefined,
              customerEmail: estimate.customerEmail || undefined,
              
              invoiceNumber: estimate.estimateNumber,
              issueDate: estimate.issueDate.toISOString(),
              dueDate: estimate.expiryDate.toISOString(),
              currency: estimate.currency,
              
              items: estimate.items.map((item) => ({
                id: item.id,
                name: item.name,
                quantity: Number(item.quantity),
                unitPrice: Number(item.unitPrice),
                taxAmount: 0,
                lineTotal: Number(item.lineTotal),
              })),
              
              subtotal: Number(estimate.subtotal),
              discountAmount: Number(estimate.discountTotal),
              taxTotal: Number(estimate.taxTotal),
              total: Number(estimate.total),
              amountDue: Number(estimate.total),
              notes: estimate.notes || undefined,
            }} />
          </div>
        </PublicDocumentShell>
      </div>
    </>
  );
}
