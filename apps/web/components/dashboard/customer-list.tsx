"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { Badge, Card, CardContent, CardHeader, CardTitle, buttonVariants } from "@nlt-invoice/ui";

type Customer = {
  id: string;
  name: string;
  companyName: string | null;
  email: string | null;
  type: "INDIVIDUAL" | "BUSINESS";
};

async function fetchCustomers() {
  const response = await fetch("/api/customers", {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to load customers.");
  }

  const body = (await response.json()) as { data: Customer[] };

  return body.data;
}

export function CustomerList() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["customers"],
    queryFn: fetchCustomers,
  });

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading customers...</div>;
  }

  if (isError) {
    return <div className="text-sm text-destructive">Customer list could not be loaded.</div>;
  }

  if (!data?.length) {
    return (
      <Card className="border-border/70 bg-card/85">
        <CardContent className="space-y-3 p-6 text-sm text-muted-foreground">
          <p>No customers yet.</p>
          <Link
            href="/dashboard/customers/new"
            className={buttonVariants({ className: "rounded-full" })}
          >
            Create first customer
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {data.map((customer) => (
        <Card key={customer.id} className="border-border/70 bg-card/85">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl">{customer.name}</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {customer.companyName || customer.email || "No secondary detail yet"}
              </p>
            </div>
            <Badge variant="secondary">{customer.type}</Badge>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
