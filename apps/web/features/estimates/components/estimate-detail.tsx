import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";
import { EstimateConvertToInvoice } from "@/features/estimates/components/estimate-convert-to-invoice";
import { StatusBanner } from "@/components/shared/status-banner";
import { EstimateStatusBadge } from "@/features/estimates/components/estimate-status-badge";
import type { EstimateDetailRecord } from "@/features/estimates/server/queries";
import {
  buttonVariants,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@nlt-invoice/ui";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatCurrency(value: string | number, currency: string) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency,
  }).format(Number(value));
}

function formatAddress(parts: Array<string | null | undefined>) {
  const value = parts.filter(Boolean).join(", ");

  return value || "Not provided";
}

function getSuccessMessage(success?: string) {
  switch (success) {
    case "created":
      return "Estimate created successfully.";
    case "updated":
      return "Estimate updated successfully.";
    default:
      return undefined;
  }
}

export function EstimateDetail({
  estimate,
  success,
}: {
  estimate: EstimateDetailRecord;
  success?: string;
}) {
  const linkedInvoice = estimate.invoices[0] ?? null;
  const billingAddress = formatAddress([
    estimate.customerBillingAddressLine1,
    estimate.customerBillingAddressLine2,
    estimate.customerBillingCity,
    estimate.customerBillingProvince,
    estimate.customerBillingPostalCode,
    estimate.customerBillingCountry,
  ]);

  const shippingAddress = estimate.customerShippingSameAsBilling
    ? "Same as billing address"
    : formatAddress([
        estimate.customerShippingAddressLine1,
        estimate.customerShippingAddressLine2,
        estimate.customerShippingCity,
        estimate.customerShippingProvince,
        estimate.customerShippingPostalCode,
        estimate.customerShippingCountry,
      ]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <PageHeader
          eyebrow="Estimates"
          title={estimate.estimateNumber}
          description="Estimate details remain company-scoped and ready for public sharing or future invoice conversion."
          className="max-w-3xl"
        />
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/dashboard/estimates/${estimate.id}/edit`}
            className={buttonVariants({
              variant: "outline",
              className: "rounded-full px-6",
            })}
          >
            Edit
          </Link>
          <Link
            href={`/e/${estimate.publicId}`}
            className={buttonVariants({
              className: "rounded-full px-6",
            })}
          >
            View public estimate
          </Link>
          <EstimateConvertToInvoice
            estimateId={estimate.id}
            status={estimate.status}
            linkedInvoice={linkedInvoice}
          />
        </div>
      </div>

      <StatusBanner message={getSuccessMessage(success)} tone="success" />

      <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="space-y-6">
          <Card className="border-border/70 bg-card/90">
            <CardHeader>
              <CardTitle>Estimate overview</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  Status
                </p>
                <div className="mt-2">
                  <EstimateStatusBadge status={estimate.status} />
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  Public link
                </p>
                <p className="mt-1 text-sm text-foreground">{estimate.publicId}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  Issue date
                </p>
                <p className="mt-1 text-sm text-foreground">
                  {formatDate(estimate.issueDate)}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  Expiry date
                </p>
                <p className="mt-1 text-sm text-foreground">
                  {formatDate(estimate.expiryDate)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/90">
            <CardHeader>
              <CardTitle>Company and customer</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  From
                </p>
                <div className="space-y-1 text-sm leading-6 text-foreground">
                  <p className="font-medium">
                    {estimate.companyName || "Company details not set"}
                  </p>
                  <p>{estimate.companyEmail || "No company email"}</p>
                  <p>{estimate.companyPhone || "No company phone"}</p>
                  <p>{estimate.companyWebsite || "No company website"}</p>
                  <p>
                    {formatAddress([
                      estimate.companyAddressLine1,
                      estimate.companyAddressLine2,
                      estimate.companyCity,
                      estimate.companyProvince,
                      estimate.companyPostalCode,
                      estimate.companyCountry,
                    ])}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-3">
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                    Bill to
                  </p>
                  <div className="space-y-1 text-sm leading-6 text-foreground">
                    <p className="font-medium">{estimate.customerName || "Customer details not set"}</p>
                    <p>{estimate.customerCompanyName || "No company name"}</p>
                    <p>{estimate.customerEmail || "No customer email"}</p>
                    <p>{estimate.customerPhone || "No customer phone"}</p>
                    <p>{billingAddress}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                    Ship to
                  </p>
                  <p className="text-sm leading-6 text-foreground">{shippingAddress}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/90">
            <CardHeader>
              <CardTitle>Line items</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-border/70 bg-background/70 text-muted-foreground">
                  <tr>
                    <th className="px-6 py-4 font-medium">Item</th>
                    <th className="px-6 py-4 font-medium">Qty</th>
                    <th className="px-6 py-4 font-medium">Unit price</th>
                    <th className="px-6 py-4 font-medium">Tax</th>
                    <th className="px-6 py-4 font-medium text-right">Line total</th>
                  </tr>
                </thead>
                <tbody>
                  {estimate.items.map((item) => (
                    <tr key={item.id} className="border-b border-border/60 last:border-b-0">
                      <td className="px-6 py-4">
                        <div className="font-medium text-foreground">{item.name}</div>
                        <div className="text-muted-foreground">{item.description || "—"}</div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {item.quantity.toString()}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {formatCurrency(item.unitPrice.toString(), estimate.currency)}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {item.taxRate.toString()}%
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-foreground">
                        {formatCurrency(item.lineTotal.toString(), estimate.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-border/70 bg-card/90">
            <CardHeader>
              <CardTitle>Totals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium text-foreground">
                  {formatCurrency(estimate.subtotal.toString(), estimate.currency)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Tax total</span>
                <span className="font-medium text-foreground">
                  {formatCurrency(estimate.taxTotal.toString(), estimate.currency)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Discount</span>
                <span className="font-medium text-foreground">
                  {formatCurrency(estimate.discountTotal.toString(), estimate.currency)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 border-t border-border/70 pt-3">
                <span className="font-medium text-foreground">Total</span>
                <span className="text-lg font-semibold text-foreground">
                  {formatCurrency(estimate.total.toString(), estimate.currency)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/90">
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-6 text-foreground">
                {estimate.notes || "No notes added."}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/90">
            <CardHeader>
              <CardTitle>Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-6 text-foreground">
                {estimate.terms || "No terms added."}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/90">
            <CardHeader>
              <CardTitle>MVP limitations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>Estimate conversion creates a draft invoice with a default due date 30 days after conversion.</p>
              <p>Send, accept, reject, and duplicate actions are not built into the dashboard yet.</p>
              <p>PDF download currently relies on the public print view.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
