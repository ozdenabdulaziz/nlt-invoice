import { FeaturePlaceholder } from "@/components/shared/feature-placeholder";
import { PageHeader } from "@/components/shared/page-header";

export default function NewInvoicePage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Invoices"
        title="New invoice placeholder"
        description="This page will eventually host the invoice builder and estimate conversion entrypoint."
      />
      <FeaturePlaceholder
        title="Invoice builder coming next"
        description="Line items, issue/due dates, taxes, and notes will be captured here using the same validation stack as the company form."
        highlights={[
          "Invoice items persist quantity, unit price, line total, and sort order.",
          "Amount due lives on the invoice record for snapshot accuracy.",
          "Estimate-to-invoice conversion will feed this screen in a later phase.",
        ]}
      />
    </div>
  );
}
