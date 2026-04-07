import Link from "next/link";

import { FeaturePlaceholder } from "@/components/shared/feature-placeholder";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@nlt-invoice/ui";
import { buttonVariants } from "@nlt-invoice/ui";
import { Card, CardContent } from "@nlt-invoice/ui";

const highlights = [
  {
    title: "Run your business solo",
    description: "No teams, no complexity — just you and your invoices.",
  },
  {
    title: "All your invoices in one place",
    description: "Manage customers, send estimates, and track invoices easily.",
  },
  {
    title: "Built for Canada",
    description: "CAD currency, simple taxes, and clean, professional invoices.",
  },
];

const workflow = [
  "Sign up and set up your business profile.",
  "Add your customers and create your first invoice.",
  "Send a secure link directly to your client.",
  "Track payment status and get paid faster.",
];

export default function HomePage() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-16 px-4 pb-16 pt-6 sm:px-6 lg:px-8">
      <section className="grid gap-10 overflow-hidden rounded-[2.5rem] border border-border/70 bg-card/85 px-6 py-8 shadow-[0_40px_120px_-70px_rgba(15,23,42,0.65)] backdrop-blur md:px-10 md:py-12 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="space-y-8">
          <Badge variant="secondary" className="rounded-full px-4 py-1.5">
            Built for Canadian businesses
          </Badge>
          <PageHeader
            title="Get paid faster with simple invoicing for Canadian businesses"
            description="Create invoices, send them to customers, and get paid — all in one simple tool."
          />
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/register"
                className={buttonVariants({
                  size: "lg",
                  className: "h-14 rounded-full shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-primary/25 px-8 text-base font-semibold",
                })}
              >
                Create your first invoice in 30 seconds
              </Link>
              <Link
                href="/pricing"
                className={buttonVariants({
                  variant: "outline",
                  size: "lg",
                  className: "h-12 rounded-full opacity-80 transition-opacity hover:opacity-100 sm:h-14 px-6",
                })}
              >
                See pricing
              </Link>
            </div>
            <div className="flex flex-col items-center justify-center gap-1.5 text-[13px] font-medium text-muted-foreground/80 sm:flex-row sm:justify-start sm:gap-2 sm:pl-3">
              <span>No credit card required</span>
              <span className="hidden sm:inline">&middot;</span>
              <span>Takes less than 1 minute</span>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {highlights.map((item) => (
              <div
                key={item.title}
                className="flex flex-col gap-1.5 rounded-[1.75rem] border border-border/70 bg-background/80 px-5 py-5"
              >
                <h3 className="font-medium text-foreground">{item.title}</h3>
                <p className="text-sm leading-6 text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
        <Card className="border-border/70 bg-background/80 shadow-none">
          <CardContent className="space-y-6 p-6 md:p-8">
            <div className="space-y-2">
              <p className="font-mono text-xs uppercase tracking-[0.28em] text-primary/80">
                How it works
              </p>
              <h2 className="text-2xl font-semibold tracking-tight">
                Send your first invoice in minutes
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
        title="Everything you need, nothing you don't"
        description="We've built a streamlined invoicing experience that strips away the bloat so you can focus on what matters most: running your business."
        highlights={[
          "Create and manage professional estimates and invoices effortlessly.",
          "Keep track of all your customers and their payment statuses in one place.",
          "Share secure, mobile-friendly invoice links directly with clients.",
        ]}
        badge="Simple & effective"
      />
    </div>
  );
}
