import { notFound } from "next/navigation";

import { PublicDocumentShell } from "@/components/documents/public-document-shell";
import { getEstimateByPublicIdQuery } from "@/features/estimates/server/queries";

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
    <PublicDocumentShell
      kind="estimate"
      publicId={publicId}
      documentNumber={estimate.estimateNumber}
      status={estimate.status}
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
      company={{
        companyName: estimate.companyName,
        email: estimate.companyEmail,
        phone: estimate.companyPhone,
        website: estimate.companyWebsite,
        addressLine1: estimate.companyAddressLine1,
        addressLine2: estimate.companyAddressLine2,
        city: estimate.companyCity,
        province: estimate.companyProvince,
        postalCode: estimate.companyPostalCode,
        country: estimate.companyCountry,
        taxNumber: estimate.companyTaxNumber,
      }}
      customer={{
        name: estimate.customerName || "Customer",
        companyName: estimate.customerCompanyName,
        email: estimate.customerEmail,
        phone: estimate.customerPhone,
        billingAddressLine1: estimate.customerBillingAddressLine1,
        billingAddressLine2: estimate.customerBillingAddressLine2,
        billingCity: estimate.customerBillingCity,
        billingProvince: estimate.customerBillingProvince,
        billingPostalCode: estimate.customerBillingPostalCode,
        billingCountry: estimate.customerBillingCountry,
        shippingSameAsBilling: estimate.customerShippingSameAsBilling,
        shippingAddressLine1: estimate.customerShippingAddressLine1,
        shippingAddressLine2: estimate.customerShippingAddressLine2,
        shippingCity: estimate.customerShippingCity,
        shippingProvince: estimate.customerShippingProvince,
        shippingPostalCode: estimate.customerShippingPostalCode,
        shippingCountry: estimate.customerShippingCountry,
      }}
      items={estimate.items.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        unitType: item.unitType,
        quantity: item.quantity.toString(),
        unitPrice: item.unitPrice.toString(),
        taxRate: item.taxRate.toString(),
        lineTotal: item.lineTotal.toString(),
      }))}
    />
  );
}
