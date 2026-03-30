import Link from "next/link";

import { CustomerDeleteButton } from "@/features/customers/components/customer-delete-button";
import type { CustomerDetailRecord } from "@/features/customers/server/queries";
import { buttonVariants, Card, CardContent, CardHeader, CardTitle } from "@nlt-invoice/ui";

import { PageHeader } from "@/components/shared/page-header";
import { StatusBanner } from "@/components/shared/status-banner";

function formatAddress(parts: Array<string | null | undefined>) {
  const value = parts.filter(Boolean).join(", ");

  return value || "Not provided";
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

function getSuccessMessage(success?: string) {
  switch (success) {
    case "created":
      return "Customer created successfully.";
    case "updated":
      return "Customer updated successfully.";
    default:
      return undefined;
  }
}

export function CustomerDetail({
  customer,
  success,
}: {
  customer: CustomerDetailRecord;
  success?: string;
}) {
  const billingAddress = formatAddress([
    customer.billingAddressLine1,
    customer.billingAddressLine2,
    customer.billingCity,
    customer.billingProvince,
    customer.billingPostalCode,
    customer.billingCountry,
  ]);

  const shippingAddress = customer.shippingSameAsBilling
    ? "Same as billing address"
    : formatAddress([
        customer.shippingAddressLine1,
        customer.shippingAddressLine2,
        customer.shippingCity,
        customer.shippingProvince,
        customer.shippingPostalCode,
        customer.shippingCountry,
      ]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <PageHeader
          eyebrow="Customers"
          title={customer.name}
          description="Customer details stay company-scoped and ready for invoice and estimate creation."
          className="max-w-3xl"
        />
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/dashboard/customers/${customer.id}/edit`}
            className={buttonVariants({
              variant: "outline",
              className: "rounded-full px-6",
            })}
          >
            Edit
          </Link>
          <Link
            href={`/dashboard/invoices/new?customerId=${customer.id}`}
            className={buttonVariants({
              className: "rounded-full px-6",
            })}
          >
            Create invoice
          </Link>
          <Link
            href={`/dashboard/estimates/new?customerId=${customer.id}`}
            className={buttonVariants({
              variant: "secondary",
              className: "rounded-full px-6",
            })}
          >
            Create estimate
          </Link>
        </div>
      </div>

      <StatusBanner message={getSuccessMessage(success)} tone="success" />

      <div className="grid gap-6 lg:grid-cols-[1.15fr,0.85fr]">
        <div className="space-y-6">
          <Card className="border-border/70 bg-card/90">
            <CardHeader>
              <CardTitle>Basic information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  Type
                </p>
                <p className="mt-1 text-sm text-foreground">{customer.type}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  Company name
                </p>
                <p className="mt-1 text-sm text-foreground">
                  {customer.companyName || "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  Email
                </p>
                <p className="mt-1 text-sm text-foreground">
                  {customer.email || "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  Phone
                </p>
                <p className="mt-1 text-sm text-foreground">
                  {customer.phone || "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  Created
                </p>
                <p className="mt-1 text-sm text-foreground">
                  {formatDate(customer.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  Updated
                </p>
                <p className="mt-1 text-sm text-foreground">
                  {formatDate(customer.updatedAt)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/90">
            <CardHeader>
              <CardTitle>Addresses</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  Billing address
                </p>
                <p className="text-sm leading-6 text-foreground">{billingAddress}</p>
              </div>
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  Shipping address
                </p>
                <p className="text-sm leading-6 text-foreground">{shippingAddress}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/90">
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-6 text-foreground">
                {customer.notes || "No notes added yet."}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-border/70 bg-card/90">
            <CardHeader>
              <CardTitle>Document activity</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-2xl border border-border/70 bg-background/80 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  Invoices
                </p>
                <p className="mt-2 text-2xl font-semibold">{customer._count.invoices}</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background/80 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  Estimates
                </p>
                <p className="mt-2 text-2xl font-semibold">{customer._count.estimates}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/90">
            <CardHeader>
              <CardTitle>Danger zone</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm leading-6 text-muted-foreground">
                Customers with related invoices or estimates cannot be deleted.
              </p>
              <CustomerDeleteButton
                customerId={customer.id}
                customerName={customer.name}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
