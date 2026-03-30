import Link from "next/link";

import { buttonVariants, Card, CardContent, CardHeader, CardTitle } from "@nlt-invoice/ui";

export function InvoiceCustomerEmptyState() {
  return (
    <Card className="border-border/70 bg-card/90">
      <CardHeader>
        <CardTitle>Add a customer first</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-muted-foreground">
        <p>
          Invoices must belong to an existing customer. Create a customer before
          building the first invoice.
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
  );
}
