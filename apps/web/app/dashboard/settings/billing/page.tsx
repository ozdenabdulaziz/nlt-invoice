import { requireCompanyContext } from "@/lib/auth/session";
import { getPlanConfig } from "@/lib/billing";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@nlt-invoice/ui";

export default async function BillingPage() {
  const context = await requireCompanyContext();
  const plan = getPlanConfig(context.subscription.plan);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Billing"
        title="Billing stays lightweight in MVP."
        description="Pricing, usage, and upgrade messaging are ready before self-serve Stripe checkout is activated."
      />
      <Card className="border-border/70 bg-card/85 shadow-[0_28px_90px_-58px_rgba(15,23,42,0.55)] backdrop-blur">
        <CardHeader>
          <CardTitle className="text-2xl">Current plan: {plan.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
          <p>{plan.description}</p>
          <p>
            Customers: {plan.limits.maxCustomers ?? "Unlimited"} • Invoices/month:{" "}
            {plan.limits.maxInvoicesPerMonth ?? "Unlimited"} • Estimates/month:{" "}
            {plan.limits.maxEstimatesPerMonth ?? "Unlimited"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
