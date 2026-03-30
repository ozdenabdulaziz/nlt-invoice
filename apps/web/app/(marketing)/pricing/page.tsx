import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@nlt-invoice/ui";
import { buttonVariants } from "@nlt-invoice/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@nlt-invoice/ui";

const pricingTiers = [
  {
    name: "Free",
    price: "$0",
    description: "Best for testing the workflow with a very small customer list.",
    features: [
      "1 user, 1 company",
      "Up to 5 customers",
      "Up to 10 invoices per month",
      "Up to 10 estimates per month",
      "Public links and print/PDF access",
    ],
    cta: "Start free",
    href: "/register",
  },
  {
    name: "Pro",
    price: "$29.99/mo",
    description: "For businesses that need unlimited invoicing without team features yet.",
    features: [
      "1 user, 1 company",
      "Unlimited customers",
      "Unlimited invoices",
      "Unlimited estimates",
      "Public links and print/PDF access",
    ],
    cta: "Create account",
    href: "/register",
  },
  {
    name: "Business",
    price: "Contact us",
    description: "Reserved for multi-user and more advanced needs after MVP.",
    features: [
      "No self-serve checkout in MVP",
      "Team workflows later",
      "Advanced billing needs later",
      "Contact sales CTA for now",
    ],
    cta: "Contact sales",
    href: "/support",
  },
];

export default function PricingPage() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="Simple pricing"
        title="Free to start, clean upgrade path later."
        description="Phase 1 keeps pricing logic narrow and transparent. Free plan limits are clear; Pro removes volume caps; Business remains a contact flow until multi-user needs land."
      />
      <div className="grid gap-6 lg:grid-cols-3">
        {pricingTiers.map((tier) => (
          <Card
            key={tier.name}
            className="border-border/70 bg-card/85 shadow-[0_28px_90px_-58px_rgba(15,23,42,0.55)] backdrop-blur"
          >
            <CardHeader className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-2xl">{tier.name}</CardTitle>
                {tier.name === "Pro" ? <Badge>Popular</Badge> : null}
              </div>
              <div>
                <p className="text-3xl font-semibold tracking-tight">{tier.price}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {tier.description}
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <ul className="space-y-3 text-sm leading-6 text-muted-foreground">
                {tier.features.map((feature) => (
                  <li key={feature} className="rounded-2xl border border-border/70 bg-background/75 px-4 py-3">
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href={tier.href}
                className={buttonVariants({
                  className: "w-full rounded-full",
                })}
              >
                {tier.cta}
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
