"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { Badge, Card, CardContent, CardHeader, CardTitle, buttonVariants } from "@nlt-invoice/ui";

type Estimate = {
  id: string;
  estimateNumber: string;
  status: string;
  total: string;
  customer: {
    name: string;
  };
};

async function fetchEstimates() {
  const response = await fetch("/api/estimates", {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to load estimates.");
  }

  const body = (await response.json()) as { data: Estimate[] };

  return body.data;
}

export function EstimateList() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["estimates"],
    queryFn: fetchEstimates,
  });

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading estimates...</div>;
  }

  if (isError) {
    return <div className="text-sm text-destructive">Estimate list could not be loaded.</div>;
  }

  if (!data?.length) {
    return (
      <Card className="border-border/70 bg-card/85">
        <CardContent className="space-y-3 p-6 text-sm text-muted-foreground">
          <p>No estimates yet.</p>
          <Link
            href="/dashboard/estimates/new"
            className={buttonVariants({ className: "rounded-full" })}
          >
            Create first estimate
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {data.map((estimate) => (
        <Card key={estimate.id} className="border-border/70 bg-card/85">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl">{estimate.estimateNumber}</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">{estimate.customer.name}</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary">{estimate.status}</Badge>
              <span className="text-sm font-medium text-foreground">{estimate.total}</span>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
