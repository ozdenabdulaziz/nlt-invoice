import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";
import { EstimateStatus } from "@prisma/client";
import {
  buttonVariants,
  Card,
  CardContent,
  Input,
  Label,
} from "@nlt-invoice/ui";

import { EstimateStatusBadge } from "@/features/estimates/components/estimate-status-badge";
import type { EstimateListItem } from "@/features/estimates/server/queries";

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

export function EstimateList({
  estimates,
  search,
}: {
  estimates: EstimateListItem[];
  search?: string;
}) {
  const hasSearch = Boolean(search?.trim());

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <PageHeader
          eyebrow="Estimates"
          title="Manage estimates"
          description="Create, review, and share estimate documents before converting approved work into invoices."
          className="max-w-3xl"
        />
        <Link
          href="/dashboard/estimates/new"
          className={buttonVariants({
            size: "lg",
            className: "rounded-full px-6",
          })}
        >
          New estimate
        </Link>
      </div>

      <Card className="border-border/70 bg-card/90">
        <CardContent className="space-y-4 p-6">
          <form className="flex flex-col gap-4 lg:flex-row lg:items-end" method="get">
            <div className="flex-1 space-y-2">
              <Label htmlFor="estimate-search">Search estimates</Label>
              <Input
                id="estimate-search"
                name="search"
                placeholder="Search by estimate number or customer"
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
                  href="/dashboard/estimates"
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
            {estimates.length} {estimates.length === 1 ? "estimate" : "estimates"} found
            {hasSearch ? ` for “${search?.trim()}”` : ""}.
          </p>
        </CardContent>
      </Card>

      {estimates.length ? (
        <Card className="border-border/70 bg-card/90">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-border/70 bg-background/70 text-muted-foreground">
                  <tr>
                    <th className="px-6 py-4 font-medium">Estimate number</th>
                    <th className="px-6 py-4 font-medium">Customer</th>
                    <th className="px-6 py-4 font-medium">Issue date</th>
                    <th className="px-6 py-4 font-medium">Expiry date</th>
                    <th className="px-6 py-4 font-medium">Total</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {estimates.map((estimate) => (
                    <tr key={estimate.id} className="border-b border-border/60 last:border-b-0">
                      <td className="px-6 py-4">
                        <Link
                          href={`/dashboard/estimates/${estimate.id}`}
                          className="font-medium text-foreground transition hover:text-primary"
                        >
                          {estimate.estimateNumber}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {estimate.customer.companyName
                          ? `${estimate.customer.name} · ${estimate.customer.companyName}`
                          : estimate.customer.name}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {formatDate(estimate.issueDate)}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {formatDate(estimate.expiryDate)}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {formatCurrency(estimate.total.toString(), estimate.currency)}
                      </td>
                      <td className="px-6 py-4">
                        <EstimateStatusBadge status={estimate.status as EstimateStatus} />
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
                ? `No estimates match “${search?.trim()}”.`
                : "No estimates yet. Create the first estimate to start sharing work with customers."}
            </p>
            <Link
              href="/dashboard/estimates/new"
              className={buttonVariants({
                className: "rounded-full px-6",
              })}
            >
              Create estimate
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
