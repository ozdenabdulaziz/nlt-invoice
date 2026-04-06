import Link from "next/link";
import { Plan } from "@prisma/client";
import { UpgradeButton } from "./upgrade-button";

import { PageHeader } from "@/components/shared/page-header";
import { formatLimitValue } from "@/features/billing/server/plans";
import type { getBillingOverviewQuery } from "@/features/billing/server/queries";
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  buttonVariants,
} from "@nlt-invoice/ui";

type BillingOverviewProps = {
  overview: Awaited<ReturnType<typeof getBillingOverviewQuery>>;
};

function getPriceLabel(monthlyPriceCad: number | null) {
  if (monthlyPriceCad === null) {
    return "Contact us";
  }

  if (monthlyPriceCad === 0) {
    return "$0";
  }

  return `$${monthlyPriceCad.toFixed(2)}/mo`;
}

export function BillingOverview({ overview }: BillingOverviewProps) {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Billing"
        title="Your subscription plan and usage."
        description="Manage your active plan and track current usage limits."
      />

      <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <Card className="border-border/70 bg-card/85 shadow-[0_28px_90px_-58px_rgba(15,23,42,0.55)] backdrop-blur">
          <CardHeader className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardDescription>Current plan</CardDescription>
                <CardTitle className="text-2xl">
                  {overview.currentPlan.name}
                </CardTitle>
              </div>
              <Badge variant="secondary">{overview.companyName}</Badge>
            </div>
            <p className="text-sm leading-6 text-muted-foreground">
              {overview.currentPlan.description}
            </p>
            <p className="text-sm leading-6 text-muted-foreground">
              {overview.planSummary}
            </p>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            {overview.usageSummary.usage.map((item) => (
              <div
                key={item.subject}
                className="rounded-2xl border border-border/70 bg-background/75 p-4"
              >
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  {item.label}
                </p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
                  {item.used}
                  <span className="ml-1 text-base font-medium text-muted-foreground">
                    / {formatLimitValue(item.limit)}
                  </span>
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {item.periodKey === "all-time"
                    ? "Tracked across the company lifetime."
                    : `Tracked for period ${item.periodKey}.`}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/85 shadow-[0_28px_90px_-58px_rgba(15,23,42,0.55)] backdrop-blur">
          <CardHeader>
            <CardDescription>Next step</CardDescription>
            <CardTitle className="text-2xl">
              {overview.plan === Plan.FREE
                ? "Upgrade to Pro to unlock unlimited usage."
                : "Looking to scale further?"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-6 text-muted-foreground">
            <p>
              {overview.plan === Plan.FREE
                ? "Upgrading to Pro removes all limits on customer, estimate, and invoice creation."
                : "For Enterprise volumes, contact our sales team to discuss custom solutions."}
            </p>
            <div className="flex flex-wrap gap-3">
              {overview.plan === Plan.FREE ? <UpgradeButton /> : null}
              <Link
                href="/support"
                className={buttonVariants({
                  variant: "outline",
                  className: "rounded-full",
                })}
              >
                Contact sales
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {overview.planOptions.map((planOption) => (
          <Card
            key={planOption.plan}
            className="border-border/70 bg-card/85 shadow-[0_28px_90px_-58px_rgba(15,23,42,0.55)] backdrop-blur"
          >
            <CardHeader className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <CardTitle>{planOption.name}</CardTitle>
                {planOption.plan === overview.plan ? (
                  <Badge variant="secondary">Current</Badge>
                ) : null}
              </div>
              <p className="text-2xl font-semibold tracking-tight text-foreground">
                {getPriceLabel(planOption.monthlyPriceCad)}
              </p>
              <CardDescription>{planOption.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm leading-6 text-muted-foreground">
              <p>Customers: {formatLimitValue(planOption.limits.customer)}</p>
              <p>Invoices/month: {formatLimitValue(planOption.limits.invoice)}</p>
              <p>Estimates/month: {formatLimitValue(planOption.limits.estimate)}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
