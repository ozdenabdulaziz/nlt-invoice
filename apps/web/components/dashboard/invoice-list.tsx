"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { Badge, Card, CardContent, CardHeader, CardTitle, buttonVariants } from "@nlt-invoice/ui";

type Invoice = {
  id: string;
  invoiceNumber: string;
  status: string;
  total: string;
  customer: {
    name: string;
  };
};

async function fetchInvoices() {
  const response = await fetch("/api/invoices", {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to load invoices.");
  }

  const body = (await response.json()) as { data: Invoice[] };

  return body.data;
}

export function InvoiceList() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["invoices"],
    queryFn: fetchInvoices,
  });

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading invoices...</div>;
  }

  if (isError) {
    return <div className="text-sm text-destructive">Invoice list could not be loaded.</div>;
  }

  if (!data?.length) {
    return (
      <Card className="border-border/70 bg-card/85">
        <CardContent className="space-y-3 p-6 text-sm text-muted-foreground">
          <p>No invoices yet.</p>
          <Link
            href="/dashboard/invoices/new"
            className={buttonVariants({ className: "rounded-full" })}
          >
            Create first invoice
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {data.map((invoice) => (
        <Card key={invoice.id} className="border-border/70 bg-card/85">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl">{invoice.invoiceNumber}</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">{invoice.customer.name}</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary">{invoice.status}</Badge>
              <span className="text-sm font-medium text-foreground">{invoice.total}</span>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
