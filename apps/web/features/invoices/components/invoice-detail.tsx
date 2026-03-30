import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";
import { StatusBanner } from "@/components/shared/status-banner";
import { InvoiceStatusBadge } from "@/features/invoices/components/invoice-status-badge";
import type { InvoiceDetailRecord } from "@/features/invoices/server/queries";
import { Button, buttonVariants, Card, CardContent, CardHeader, CardTitle } from "@nlt-invoice/ui";

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
      return "Invoice created successfully.";
    case "updated":
      return "Invoice updated successfully.";
    default:
      return undefined;
  }
}

export function InvoiceDetail({
  invoice,
  success,
}: {
  invoice: InvoiceDetailRecord;
  success?: string;
}) {
  const billingAddress = formatAddress([
    invoice.customer.billingAddressLine1,
    invoice.customer.billingAddressLine2,
    invoice.customer.billingCity,
    invoice.customer.billingProvince,
    invoice.customer.billingPostalCode,
    invoice.customer.billingCountry,
  ]);

  const shippingAddress = invoice.customer.shippingSameAsBilling
    ? "Same as billing address"
    : formatAddress([
        invoice.customer.shippingAddressLine1,
        invoice.customer.shippingAddressLine2,
        invoice.customer.shippingCity,
        invoice.customer.shippingProvince,
        invoice.customer.shippingPostalCode,
        invoice.customer.shippingCountry,
      ]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <PageHeader
          eyebrow="Invoices"
          title={invoice.invoiceNumber}
          description="Invoice details remain company-scoped and ready for public sharing or future payment workflows."
          className="max-w-3xl"
        />
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/dashboard/invoices/${invoice.id}/edit`}
            className={buttonVariants({
              variant: "outline",
              className: "rounded-full px-6",
            })}
          >
            Edit
          </Link>
          <Link
            href={`/i/${invoice.publicId}`}
            className={buttonVariants({
              className: "rounded-full px-6",
            })}
          >
            View public invoice
          </Link>
          <Button
            type="button"
            variant="secondary"
            className="rounded-full px-6"
            disabled
          >
            Record payment
          </Button>
        </div>
      </div>

      <StatusBanner message={getSuccessMessage(success)} tone="success" />

      <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="space-y-6">
          <Card className="border-border/70 bg-card/90">
            <CardHeader>
              <CardTitle>Invoice overview</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  Status
                </p>
                <div className="mt-2">
                  <InvoiceStatusBadge status={invoice.status} />
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  Public link
                </p>
                <p className="mt-1 text-sm text-foreground">{invoice.publicId}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  Issue date
                </p>
                <p className="mt-1 text-sm text-foreground">{formatDate(invoice.issueDate)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  Due date
                </p>
                <p className="mt-1 text-sm text-foreground">{formatDate(invoice.dueDate)}</p>
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
                    {invoice.company.companyName || "Company details not set"}
                  </p>
                  <p>{invoice.company.email || "No company email"}</p>
                  <p>{invoice.company.phone || "No company phone"}</p>
                  <p>{invoice.company.website || "No company website"}</p>
                  <p>
                    {formatAddress([
                      invoice.company.addressLine1,
                      invoice.company.addressLine2,
                      invoice.company.city,
                      invoice.company.province,
                      invoice.company.postalCode,
                      invoice.company.country,
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
                    <p className="font-medium">{invoice.customer.name}</p>
                    <p>{invoice.customer.companyName || "No company name"}</p>
                    <p>{invoice.customer.email || "No customer email"}</p>
                    <p>{invoice.customer.phone || "No customer phone"}</p>
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
                  {invoice.items.map((item) => (
                    <tr key={item.id} className="border-b border-border/60 last:border-b-0">
                      <td className="px-6 py-4">
                        <div className="font-medium text-foreground">{item.name}</div>
                        <div className="text-muted-foreground">{item.description || "—"}</div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {item.quantity.toString()}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {formatCurrency(item.unitPrice.toString(), invoice.currency)}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {item.taxRate.toString()}%
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-foreground">
                        {formatCurrency(item.lineTotal.toString(), invoice.currency)}
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
                  {formatCurrency(invoice.subtotal.toString(), invoice.currency)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Tax total</span>
                <span className="font-medium text-foreground">
                  {formatCurrency(invoice.taxTotal.toString(), invoice.currency)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Discount</span>
                <span className="font-medium text-foreground">
                  {formatCurrency(invoice.discountTotal.toString(), invoice.currency)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Total</span>
                <span className="font-medium text-foreground">
                  {formatCurrency(invoice.total.toString(), invoice.currency)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Amount paid</span>
                <span className="font-medium text-foreground">
                  {formatCurrency(invoice.amountPaid.toString(), invoice.currency)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 border-t border-border/70 pt-3">
                <span className="font-medium text-foreground">Balance due</span>
                <span className="text-lg font-semibold text-foreground">
                  {formatCurrency(invoice.balanceDue.toString(), invoice.currency)}
                </span>
              </div>
            </CardContent>
          </Card>

          {invoice.estimate ? (
            <Card className="border-border/70 bg-card/90">
              <CardHeader>
                <CardTitle>Source estimate</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>
                  This invoice is linked to <span className="font-medium text-foreground">{invoice.estimate.estimateNumber}</span>.
                </p>
                <Link
                  href={`/dashboard/estimates/${invoice.estimate.id}`}
                  className={buttonVariants({
                    variant: "outline",
                    className: "rounded-full px-6",
                  })}
                >
                  View estimate
                </Link>
              </CardContent>
            </Card>
          ) : null}

          <Card className="border-border/70 bg-card/90">
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-6 text-foreground">
                {invoice.notes || "No notes added."}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/90">
            <CardHeader>
              <CardTitle>Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-6 text-foreground">
                {invoice.terms || "No terms added."}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/90">
            <CardHeader>
              <CardTitle>MVP limitations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>Online payment collection is intentionally excluded from this phase.</p>
              <p>Record payment, send, and duplicate actions are placeholders for later work.</p>
              <p>PDF download currently relies on the public print view.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
