import Link from "next/link";

import { FeaturePlaceholder } from "@/components/shared/feature-placeholder";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@nlt-invoice/ui";
import { buttonVariants } from "@nlt-invoice/ui";
import { Card, CardContent } from "@nlt-invoice/ui";

const highlights = [
  "One user equals one company. No teams, admin panel, or online payments in MVP.",
  "Customers, estimates, invoices, and public document links live inside one Next.js app.",
  "Canada-first defaults with English-only UX, CAD currency, and simple tax support.",
];

const workflow = [
  "Register and create your account.",
  "Complete company onboarding once.",
  "Create customers, estimates, and invoices from the dashboard.",
  "Share `/e/[publicId]` or `/i/[publicId]` public links with customers.",
];

export default function HomePage() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-16 px-4 pb-16 pt-6 sm:px-6 lg:px-8">
      <section className="grid gap-10 overflow-hidden rounded-[2.5rem] border border-border/70 bg-card/85 px-6 py-8 shadow-[0_40px_120px_-70px_rgba(15,23,42,0.65)] backdrop-blur md:px-10 md:py-12 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="space-y-8">
          <Badge variant="secondary" className="rounded-full px-4 py-1.5">
            Blueprint realigned
          </Badge>
          <PageHeader
            eyebrow="English-first invoicing"
            title="Fast invoicing software for Canadian small businesses."
            description="NLT Invoice keeps the MVP narrow: company profile, customers, estimates, invoices, public links, and subscription plans inside one clean SaaS workflow."
          />
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/register"
              className={buttonVariants({
                size: "lg",
                className: "rounded-full px-6",
              })}
            >
              Start free
            </Link>
            <Link
              href="/pricing"
              className={buttonVariants({
                variant: "outline",
                size: "lg",
                className: "rounded-full px-6",
              })}
            >
              View pricing
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {highlights.map((item) => (
              <div
                key={item}
                className="rounded-[1.75rem] border border-border/70 bg-background/80 px-4 py-4 text-sm leading-6 text-muted-foreground"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
        <Card className="border-border/70 bg-background/80 shadow-none">
          <CardContent className="space-y-6 p-6 md:p-8">
            <div className="space-y-2">
              <p className="font-mono text-xs uppercase tracking-[0.28em] text-primary/80">
                Core workflow
              </p>
              <h2 className="text-2xl font-semibold tracking-tight">
                Public documents without a split stack
              </h2>
            </div>
            <ol className="space-y-4">
              {workflow.map((item, index) => (
                <li
                  key={item}
                  className="flex gap-4 rounded-[1.5rem] border border-border/70 bg-card/80 px-4 py-4"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    {index + 1}
                  </span>
                  <span className="text-sm leading-6 text-muted-foreground">{item}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </section>

      <FeaturePlaceholder
        title="Single-app architecture from day one"
        description="Marketing pages, auth pages, the protected app shell, and public documents all live in one Next.js codebase. The old split between landing and SaaS app is intentionally removed."
        highlights={[
          "Route groups exist for marketing, auth, onboarding, dashboard, public documents, and API handlers.",
          "Auth.js, Prisma, Zod, React Hook Form, TanStack Query, Tailwind, and shadcn/ui are wired into one monorepo.",
          "The skeleton is ready for customer, estimate, invoice, and billing features in the next phases.",
        ]}
        badge="Blueprint-aligned"
      />
    </div>
  );
}
