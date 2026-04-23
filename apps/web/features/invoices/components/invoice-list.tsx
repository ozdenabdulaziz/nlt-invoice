import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";
import { InvoiceStatus } from "@prisma/client";
import { buttonVariants, Card, CardContent, Input, Label } from "@nlt-invoice/ui";

import { InvoiceStatusBadge } from "@/features/invoices/components/invoice-status-badge";
import type { InvoiceListItem } from "@/features/invoices/server/queries";
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeader,
  DataTableRow,
} from "@/components/shared/data-table";

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
        <DataTable>
          <DataTableHeader>
            <DataTableRow>
              <DataTableHead>Invoice number</DataTableHead>
              <DataTableHead>Customer</DataTableHead>
              <DataTableHead>Issue date</DataTableHead>
              <DataTableHead>Due date</DataTableHead>
              <DataTableHead>Total</DataTableHead>
              <DataTableHead>Status</DataTableHead>
            </DataTableRow>
          </DataTableHeader>
          <DataTableBody>
            {invoices.map((invoice) => (
              <DataTableRow key={invoice.id}>
                <DataTableCell>
                  <Link
                    href={`/dashboard/invoices/${invoice.id}`}
                    className="font-medium text-foreground transition hover:text-primary"
                  >
                    {invoice.invoiceNumber}
                  </Link>
                </DataTableCell>
                <DataTableCell className="text-muted-foreground">
                  {invoice.customer.companyName
                    ? `${invoice.customer.name} · ${invoice.customer.companyName}`
                    : invoice.customer.name}
                </DataTableCell>
                <DataTableCell className="text-muted-foreground">
                  {formatDate(invoice.issueDate)}
                </DataTableCell>
                <DataTableCell className="text-muted-foreground">
                  {formatDate(invoice.dueDate)}
                </DataTableCell>
                <DataTableCell className="font-medium text-foreground">
                  {formatCurrency(invoice.total.toString(), invoice.currency)}
                </DataTableCell>
                <DataTableCell>
                  <InvoiceStatusBadge status={invoice.status as InvoiceStatus} />
                </DataTableCell>
              </DataTableRow>
            ))}
          </DataTableBody>
        </DataTable>
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
