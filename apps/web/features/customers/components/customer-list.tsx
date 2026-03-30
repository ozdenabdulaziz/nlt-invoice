import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";
import { StatusBanner } from "@/components/shared/status-banner";
import type { CustomerListItem } from "@/features/customers/server/queries";
import { buttonVariants, Card, CardContent, Input, Label } from "@nlt-invoice/ui";

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
        <Card className="border-border/70 bg-card/90">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-border/70 bg-background/70 text-muted-foreground">
                  <tr>
                    <th className="px-6 py-4 font-medium">Name</th>
                    <th className="px-6 py-4 font-medium">Company name</th>
                    <th className="px-6 py-4 font-medium">Email</th>
                    <th className="px-6 py-4 font-medium">Phone</th>
                    <th className="px-6 py-4 font-medium">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.id} className="border-b border-border/60 last:border-b-0">
                      <td className="px-6 py-4">
                        <Link
                          href={`/dashboard/customers/${customer.id}`}
                          className="font-medium text-foreground transition hover:text-primary"
                        >
                          {customer.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {customer.companyName || "—"}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {customer.email || "—"}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {customer.phone || "—"}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {formatDate(customer.createdAt)}
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
