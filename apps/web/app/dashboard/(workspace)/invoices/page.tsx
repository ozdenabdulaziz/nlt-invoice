import { InvoiceList } from "@/components/dashboard/invoice-list";
import { PageHeader } from "@/components/shared/page-header";

export default function InvoicesPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Invoices"
        title="Invoice list"
        description="Invoices are company-scoped, status-driven, and available through the canonical route handler surface."
      />
      <InvoiceList />
    </div>
  );
}
