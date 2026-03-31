import type { ReactNode } from "react";
import Link from "next/link";

import { Card, CardContent } from "@nlt-invoice/ui";

import { DocumentActions } from "@/components/documents/document-actions";
import { BrandMark } from "@/components/shared/brand-mark";
import { StatusBanner } from "@/components/shared/status-banner";

type PublicDocumentShellProps = {
  kind: "invoice" | "estimate";
  publicId: string;
  documentNumber: string;
  status: string;
  issueDate: Date;
  secondaryDateLabel: string;
  secondaryDate: Date;
  currency: string;
  subtotal: string;
  taxTotal: string;
  discountTotal: string;
  total: string;
  amountPaid?: string | null;
  balanceDue?: string | null;
  notes?: string | null;
  terms?: string | null;
  company: {
    companyName: string | null;
    email: string | null;
    phone: string | null;
    website: string | null;
    addressLine1: string | null;
    addressLine2: string | null;
    city: string | null;
    province: string | null;
    postalCode: string | null;
    country: string | null;
    taxNumber: string | null;
  };
  customer: {
    name: string;
    companyName: string | null;
    email: string | null;
    phone: string | null;
    billingAddressLine1: string | null;
    billingAddressLine2: string | null;
    billingCity: string | null;
    billingProvince: string | null;
    billingPostalCode: string | null;
    billingCountry: string | null;
    shippingSameAsBilling: boolean;
    shippingAddressLine1: string | null;
    shippingAddressLine2: string | null;
    shippingCity: string | null;
    shippingProvince: string | null;
    shippingPostalCode: string | null;
    shippingCountry: string | null;
  };
  items: Array<{
    id: string;
    name: string;
    description: string | null;
    quantity: string;
    unitPrice: string;
    taxRate: string;
    lineTotal: string;
  }>;
  statusMessage?: {
    message: string;
    tone?: "error" | "success";
  };
  paymentAction?: ReactNode;
};

function formatCurrency(value: string, currency: string) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency,
  }).format(Number(value));
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(value);
}

function formatAddress(parts: Array<string | null | undefined>) {
  return parts.filter(Boolean).join(", ");
}

export function PublicDocumentShell({
  kind,
  publicId,
  documentNumber,
  status,
  issueDate,
  secondaryDateLabel,
  secondaryDate,
  currency,
  subtotal,
  taxTotal,
  discountTotal,
  total,
  amountPaid,
  balanceDue,
  notes,
  terms,
  company,
  customer,
  items,
  statusMessage,
  paymentAction,
}: PublicDocumentShellProps) {
  const title = kind === "invoice" ? "Invoice" : "Estimate";
  const billingAddress = formatAddress([
    customer.billingAddressLine1,
    customer.billingAddressLine2,
    customer.billingCity,
    customer.billingProvince,
    customer.billingPostalCode,
    customer.billingCountry,
  ]);
  const shippingAddress = customer.shippingSameAsBilling
    ? billingAddress
    : formatAddress([
        customer.shippingAddressLine1,
        customer.shippingAddressLine2,
        customer.shippingCity,
        customer.shippingProvince,
        customer.shippingPostalCode,
        customer.shippingCountry,
      ]);

  return (
    <div className="document-print-shell invoice-container mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <div className="document-print-topbar flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <BrandMark />
        <DocumentActions />
      </div>

      <Card className="document-print-card border-border/70 bg-card/90 shadow-[0_40px_100px_-60px_rgba(15,23,42,0.55)] backdrop-blur">
        <CardContent className="document-print-content space-y-10 p-8 md:p-10">
          {statusMessage?.message ? (
            <StatusBanner
              message={statusMessage.message}
              tone={statusMessage.tone}
            />
          ) : null}

          <div className="document-print-header document-print-no-break flex flex-col gap-6 border-b border-border/70 pb-8 md:flex-row md:items-start md:justify-between">
            <div className="space-y-3">
              <p className="font-mono text-xs uppercase tracking-[0.28em] text-primary/80">
                Public {title.toLowerCase()}
              </p>
              <div>
                <h1 className="text-4xl font-semibold tracking-tight">{title}</h1>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Route:{" "}
                  <code className="rounded bg-background px-2 py-1">
                    {kind === "invoice" ? `/i/${publicId}` : `/e/${publicId}`}
                  </code>
                </p>
              </div>
            </div>
            <div className="document-print-no-break rounded-3xl border border-border/70 bg-background/80 px-5 py-4 text-sm text-muted-foreground">
              <div>{documentNumber}</div>
              <div className="mt-2 font-mono text-base text-foreground">{status}</div>
              {paymentAction ? <div className="mt-4">{paymentAction}</div> : null}
            </div>
          </div>

          <div className="document-print-meta-grid grid gap-6 md:grid-cols-[1fr,1fr,0.9fr]">
            <div className="document-print-no-break space-y-2">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                From
              </p>
              <div className="space-y-1 text-sm leading-6 text-muted-foreground">
                <p className="font-semibold text-foreground">{company.companyName || "NLT Invoice"}</p>
                <p>{company.email}</p>
                <p>{company.phone}</p>
                <p>{company.website}</p>
                <p>
                  {formatAddress([
                    company.addressLine1,
                    company.addressLine2,
                    company.city,
                    company.province,
                    company.postalCode,
                    company.country,
                  ])}
                </p>
                <p>{company.taxNumber ? `Tax number: ${company.taxNumber}` : null}</p>
              </div>
            </div>
            <div className="document-print-meta-grid grid gap-6 sm:grid-cols-2">
              <div className="document-print-no-break space-y-2">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Bill to
                </p>
                <div className="space-y-1 text-sm leading-6 text-muted-foreground">
                  <p className="font-semibold text-foreground">{customer.name}</p>
                  <p>{customer.companyName}</p>
                  <p>{customer.email}</p>
                  <p>{customer.phone}</p>
                  <p>{billingAddress}</p>
                </div>
              </div>
              <div className="document-print-no-break space-y-2">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Ship to
                </p>
                <div className="space-y-1 text-sm leading-6 text-muted-foreground">
                  <p className="font-semibold text-foreground">{customer.name}</p>
                  <p>{customer.companyName}</p>
                  <p>{customer.shippingSameAsBilling ? "Same as billing" : null}</p>
                  <p>{shippingAddress}</p>
                </div>
              </div>
            </div>
            <div className="document-print-no-break rounded-[2rem] border border-border/70 bg-background/80 p-5 text-sm leading-6 text-muted-foreground">
              <div className="flex items-center justify-between gap-4">
                <span>Issue date</span>
                <span className="font-medium text-foreground">{formatDate(issueDate)}</span>
              </div>
              <div className="mt-3 flex items-center justify-between gap-4">
                <span>{secondaryDateLabel}</span>
                <span className="font-medium text-foreground">{formatDate(secondaryDate)}</span>
              </div>
              <div className="mt-3 flex items-center justify-between gap-4">
                <span>Status</span>
                <span className="font-medium text-foreground">{status}</span>
              </div>
            </div>
          </div>

          <div className="document-print-table-wrap rounded-[2rem] border border-border/70">
            <table className="document-print-table w-full text-left text-sm">
              <thead className="bg-background/80 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Item</th>
                  <th className="px-4 py-3 font-medium">Qty</th>
                  <th className="px-4 py-3 font-medium">Unit</th>
                  <th className="px-4 py-3 font-medium">Tax</th>
                  <th className="px-4 py-3 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-t border-border/70 align-top">
                    <td className="px-4 py-4">
                      <div className="font-medium text-foreground">{item.name}</div>
                      <div className="text-muted-foreground">{item.description}</div>
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">{item.quantity}</td>
                    <td className="px-4 py-4 text-muted-foreground">
                      {formatCurrency(item.unitPrice, currency)}
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">{item.taxRate}%</td>
                    <td className="px-4 py-4 text-right font-medium text-foreground">
                      {formatCurrency(item.lineTotal, currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="document-print-summary-grid grid gap-6 md:grid-cols-[1fr,0.9fr]">
            <div className="space-y-4">
              {notes ? (
                <div className="document-print-no-break rounded-[2rem] border border-border/70 bg-background/80 p-5">
                  <h2 className="text-lg font-semibold">Notes</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{notes}</p>
                </div>
              ) : null}
              {terms ? (
                <div className="document-print-no-break rounded-[2rem] border border-border/70 bg-background/80 p-5">
                  <h2 className="text-lg font-semibold">Terms</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{terms}</p>
                </div>
              ) : null}
            </div>

            <div className="document-print-summary document-print-no-break rounded-[2rem] border border-border/70 bg-background/80 p-5 text-sm leading-6 text-muted-foreground">
              <div className="flex items-center justify-between gap-4">
                <span>Subtotal</span>
                <span className="font-medium text-foreground">{formatCurrency(subtotal, currency)}</span>
              </div>
              <div className="mt-3 flex items-center justify-between gap-4">
                <span>Discount</span>
                <span className="font-medium text-foreground">{formatCurrency(discountTotal, currency)}</span>
              </div>
              <div className="mt-3 flex items-center justify-between gap-4">
                <span>Tax</span>
                <span className="font-medium text-foreground">{formatCurrency(taxTotal, currency)}</span>
              </div>
              <div className="mt-3 flex items-center justify-between gap-4 text-base">
                <span className="font-semibold text-foreground">Total</span>
                <span className="font-semibold text-foreground">{formatCurrency(total, currency)}</span>
              </div>
              {amountPaid ? (
                <div className="mt-3 flex items-center justify-between gap-4">
                  <span>Amount paid</span>
                  <span className="font-medium text-foreground">{formatCurrency(amountPaid, currency)}</span>
                </div>
              ) : null}
              {balanceDue ? (
                <div className="mt-3 flex items-center justify-between gap-4">
                  <span>Balance due</span>
                  <span className="font-medium text-foreground">{formatCurrency(balanceDue, currency)}</span>
                </div>
              ) : null}
            </div>
          </div>

          <div className="document-print-footer border-t border-border/70 pt-6 text-sm text-muted-foreground">
            Looking for the app experience instead?{" "}
            <Link href="/register" className="font-medium text-primary underline-offset-4 hover:underline">
              Create an account
            </Link>
            .
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
