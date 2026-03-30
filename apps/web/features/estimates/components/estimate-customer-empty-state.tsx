import Link from "next/link";

import { buttonVariants, Card, CardContent } from "@nlt-invoice/ui";

export function EstimateCustomerEmptyState() {
  return (
    <Card className="border-border/70 bg-card/90">
      <CardContent className="space-y-4 p-6">
        <p className="text-sm leading-6 text-muted-foreground">
          You need at least one customer before creating an estimate.
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
