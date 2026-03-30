import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";
import { InvoiceStatus } from "@prisma/client";
import { buttonVariants, Card, CardContent, Input, Label } from "@nlt-invoice/ui";

import { InvoiceStatusBadge } from "@/features/invoices/components/invoice-status-badge";
import type { InvoiceListItem } from "@/features/invoices/server/queries";

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

export function InvoiceList({
  invoices,
  search,
}: {
  invoices: InvoiceListItem[];
  search?: string;
}) {
  const hasSearch = Boolean(search?.trim());

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <PageHeader
          eyebrow="Invoices"
          title="Manage invoices"
          description="Create, review, and share invoices while keeping totals and company-scoped numbering reliable."
          className="max-w-3xl"
        />
        <Link
          href="/dashboard/invoices/new"
          className={buttonVariants({
            size: "lg",
            className: "rounded-full px-6",
          })}
        >
          New invoice
        </Link>
      </div>

      <Card className="border-border/70 bg-card/90">
        <CardContent className="space-y-4 p-6">
          <form className="flex flex-col gap-4 lg:flex-row lg:items-end" method="get">
            <div className="flex-1 space-y-2">
              <Label htmlFor="invoice-search">Search invoices</Label>
              <Input
                id="invoice-search"
                name="search"
                placeholder="Search by invoice number or customer"
                defaultValue={search ?? ""}
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                className={buttonVariants({
                  className: "rounded-full px-6",
                })}
              >
                Search
              </button>
              {hasSearch ? (
                <Link
                  href="/dashboard/invoices"
                  className={buttonVariants({
                    variant: "outline",
                    className: "rounded-full px-6",
                  })}
                >
                  Clear
                </Link>
              ) : null}
            </div>
          </form>
          <p className="text-sm text-muted-foreground">
            {invoices.length} {invoices.length === 1 ? "invoice" : "invoices"} found
            {hasSearch ? ` for “${search?.trim()}”` : ""}.
          </p>
        </CardContent>
      </Card>

      {invoices.length ? (
        <Card className="border-border/70 bg-card/90">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-border/70 bg-background/70 text-muted-foreground">
                  <tr>
                    <th className="px-6 py-4 font-medium">Invoice number</th>
                    <th className="px-6 py-4 font-medium">Customer</th>
                    <th className="px-6 py-4 font-medium">Issue date</th>
                    <th className="px-6 py-4 font-medium">Due date</th>
                    <th className="px-6 py-4 font-medium">Total</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b border-border/60 last:border-b-0">
                      <td className="px-6 py-4">
                        <Link
                          href={`/dashboard/invoices/${invoice.id}`}
                          className="font-medium text-foreground transition hover:text-primary"
                        >
                          {invoice.invoiceNumber}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {invoice.customer.companyName
                          ? `${invoice.customer.name} · ${invoice.customer.companyName}`
                          : invoice.customer.name}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {formatDate(invoice.issueDate)}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {formatDate(invoice.dueDate)}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {formatCurrency(invoice.total.toString(), invoice.currency)}
                      </td>
                      <td className="px-6 py-4">
                        <InvoiceStatusBadge status={invoice.status as InvoiceStatus} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border/70 bg-card/90">
          <CardContent className="space-y-4 p-6">
            <p className="text-sm text-muted-foreground">
              {hasSearch
                ? `No invoices match “${search?.trim()}”.`
                : "No invoices yet. Create the first invoice to start billing customers."}
            </p>
            <Link
              href="/dashboard/invoices/new"
              className={buttonVariants({
                className: "rounded-full px-6",
              })}
            >
              Create invoice
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
