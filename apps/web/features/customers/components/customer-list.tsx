import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";
import { StatusBanner } from "@/components/shared/status-banner";
import type { CustomerListItem } from "@/features/customers/server/queries";
import { buttonVariants, Card, CardContent, Input, Label } from "@nlt-invoice/ui";
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

function getSuccessMessage(success?: string) {
  switch (success) {
    case "deleted":
      return "Customer deleted successfully.";
    default:
      return undefined;
  }
}

export function CustomerList({
  customers,
  search,
  success,
}: {
  customers: CustomerListItem[];
  search?: string;
  success?: string;
}) {
  const hasSearch = Boolean(search?.trim());

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <PageHeader
          eyebrow="Customers"
          title="Manage customers"
          description="Create, search, and maintain customer records before turning them into invoices and estimates."
          className="max-w-3xl"
        />
        <Link
          href="/dashboard/customers/new"
          className={buttonVariants({
            size: "lg",
            className: "rounded-full px-6",
          })}
        >
          New customer
        </Link>
      </div>

      <StatusBanner message={getSuccessMessage(success)} tone="success" />

      <Card className="border-border/70 bg-card/90">
        <CardContent className="space-y-4 p-6">
          <form className="flex flex-col gap-4 lg:flex-row lg:items-end" method="get">
            <div className="flex-1 space-y-2">
              <Label htmlFor="customer-search">Search customers</Label>
              <Input
                id="customer-search"
                name="search"
                placeholder="Search by name, company, or email"
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
                  href="/dashboard/customers"
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
            {customers.length} {customers.length === 1 ? "customer" : "customers"} found
            {hasSearch ? ` for “${search?.trim()}”` : ""}.
          </p>
        </CardContent>
      </Card>

      {customers.length ? (
        <DataTable>
          <DataTableHeader>
            <DataTableRow>
              <DataTableHead>Name</DataTableHead>
              <DataTableHead>Company name</DataTableHead>
              <DataTableHead>Email</DataTableHead>
              <DataTableHead>Phone</DataTableHead>
              <DataTableHead>Created</DataTableHead>
            </DataTableRow>
          </DataTableHeader>
          <DataTableBody>
            {customers.map((customer) => (
              <DataTableRow key={customer.id}>
                <DataTableCell>
                  <Link
                    href={`/dashboard/customers/${customer.id}`}
                    className="font-medium text-foreground transition hover:text-primary"
                  >
                    {customer.name}
                  </Link>
                </DataTableCell>
                <DataTableCell className="text-muted-foreground">
                  {customer.companyName || "—"}
                </DataTableCell>
                <DataTableCell className="text-muted-foreground">
                  {customer.email || "—"}
                </DataTableCell>
                <DataTableCell className="text-muted-foreground">
                  {customer.phone || "—"}
                </DataTableCell>
                <DataTableCell className="text-muted-foreground">
                  {formatDate(customer.createdAt)}
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
                ? `No customers match “${search?.trim()}”.`
                : "No customers yet. Create the first customer to start drafting invoices and estimates."}
            </p>
            <Link
              href="/dashboard/customers/new"
              className={buttonVariants({
                className: "rounded-full px-6",
              })}
            >
              Create customer
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
