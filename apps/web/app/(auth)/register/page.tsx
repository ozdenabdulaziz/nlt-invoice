import Link from "next/link";
import {
  BadgeCheck,
  CircleAlert,
  CircleDashed,
  CircleDollarSign,
  CreditCard,
  ReceiptText,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

import { RegisterForm } from "@/components/forms/auth/register-form";
import { BrandMark } from "@/components/shared/brand-mark";

const trustBadges = [
  {
    label: "No credit card required",
    Icon: CreditCard,
  },
  {
    label: "Secure authentication",
    Icon: ShieldCheck,
  },
  {
    label: "Professional invoicing",
    Icon: BadgeCheck,
  },
];

const dashboardStats = [
  {
    label: "Collected this month",
    value: "$18,420",
    delta: "+14.8%",
    Icon: TrendingUp,
  },
  {
    label: "Open invoices",
    value: "24",
    delta: "7 due this week",
    Icon: ReceiptText,
  },
  {
    label: "Paid rate",
    value: "92%",
    delta: "On-time payments",
    Icon: BadgeCheck,
  },
];

const paymentActivity = [
  {
    company: "Pine Studio",
    amount: "$2,400",
    time: "2h ago",
    status: "Paid",
    tone: "paid" as const,
  },
  {
    company: "Northline Co.",
    amount: "$780",
    time: "5h ago",
    status: "Processing",
    tone: "processing" as const,
  },
  {
    company: "Summit Works",
    amount: "$1,150",
    time: "Yesterday",
    status: "Overdue",
    tone: "overdue" as const,
  },
];

export default function RegisterPage() {
  return (
    <div className="mx-auto grid w-full max-w-[1140px] grid-cols-1 gap-6 lg:grid-cols-2 lg:items-stretch lg:gap-8">
      <section className="flex h-full flex-col rounded-[1.65rem] border border-border/70 bg-card/95 p-4 shadow-[0_40px_100px_-64px_rgba(15,23,42,0.52)] sm:p-5">
        <div className="mb-4">
          <BrandMark />
        </div>
        <div className="flex-1 space-y-4">
          <RegisterForm />
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2.5">
              {trustBadges.map(({ label, Icon }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/85 px-3 py-1.5 text-xs text-muted-foreground"
                >
                  <Icon className="size-3.5 shrink-0 text-primary/80" aria-hidden="true" />
                  {label}
                </span>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Already using NLT Invoice?{" "}
              <Link
                href="/login"
                className="font-semibold text-primary underline-offset-4 hover:underline"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </section>
      <aside className="relative h-full overflow-hidden rounded-[1.65rem] border border-border/70 bg-card p-4 shadow-[0_40px_100px_-64px_rgba(15,23,42,0.52)] sm:p-5">
        <div className="relative space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/85">
                Product preview
              </p>
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                Billing workspace
              </h2>
              <p className="text-sm text-muted-foreground">
                Real-time visibility into invoices, payment activity, and cash flow.
              </p>
            </div>
            <span className="rounded-full border border-emerald-200/70 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700">
              Live sync
            </span>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-3">
            {dashboardStats.map(({ label, value, delta, Icon }) => (
              <div
                key={label}
                className="rounded-xl border border-border/70 bg-background/85 p-2.5"
              >
                <div className="mb-1.5 flex items-center justify-between">
                  <Icon className="size-4 text-primary/80" aria-hidden="true" />
                  <span className="text-[11px] font-medium text-emerald-700">{delta}</span>
                </div>
                <p className="text-lg font-semibold tracking-tight text-foreground">{value}</p>
                <p className="mt-1 text-[11px] leading-4 text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-3 xl:grid-cols-[1.06fr,0.94fr]">
            <article className="rounded-2xl border border-border/70 bg-background/85 p-3.5">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">Invoice #INV-4021</p>
                <span className="rounded-full border border-emerald-200/70 bg-emerald-500/10 px-2 py-1 text-[11px] font-medium text-emerald-700">
                  Paid
                </span>
              </div>
              <dl className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg border border-border/70 bg-card/85 p-2.5">
                  <dt className="text-muted-foreground">Client</dt>
                  <dd className="mt-0.5 font-medium text-foreground">Northline Studio</dd>
                </div>
                <div className="rounded-lg border border-border/70 bg-card/85 p-2.5">
                  <dt className="text-muted-foreground">Due date</dt>
                  <dd className="mt-0.5 font-medium text-foreground">Apr 18, 2026</dd>
                </div>
              </dl>
              <div className="mt-2.5 space-y-2 rounded-lg border border-border/70 bg-card/85 p-2.5">
                {[
                  ["Website redesign", "$1,600"],
                  ["Hosting + support", "$480"],
                ].map(([item, amount]) => (
                  <div key={item} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{item}</span>
                    <span className="font-medium text-foreground">{amount}</span>
                  </div>
                ))}
              </div>
              <div className="mt-2.5 flex items-center justify-between rounded-lg border border-border/70 bg-card p-2.5">
                <span className="text-xs text-muted-foreground">Total paid</span>
                <span className="text-sm font-semibold text-foreground">$2,080</span>
              </div>
            </article>

            <article className="space-y-2.5 rounded-2xl border border-border/70 bg-background/85 p-3.5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">Payment activity</p>
                <CircleDollarSign className="size-4 text-primary/80" aria-hidden="true" />
              </div>
              {paymentActivity.map(({ company, amount, time, status, tone }) => (
                <div
                  key={company}
                  className="rounded-lg border border-border/70 bg-card/90 px-2.5 py-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground">{company}</span>
                    <span className="font-semibold text-foreground">{amount}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">{time}</span>
                    <span
                      className={
                        tone === "paid"
                          ? "inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-emerald-700"
                          : tone === "processing"
                            ? "inline-flex items-center gap-1 rounded-full bg-amber-500/12 px-2 py-0.5 text-amber-700"
                            : "inline-flex items-center gap-1 rounded-full bg-rose-500/12 px-2 py-0.5 text-rose-700"
                      }
                    >
                      {tone === "paid" ? (
                        <BadgeCheck className="size-3" aria-hidden="true" />
                      ) : tone === "processing" ? (
                        <CircleDashed className="size-3" aria-hidden="true" />
                      ) : (
                        <CircleAlert className="size-3" aria-hidden="true" />
                      )}
                      {status}
                    </span>
                  </div>
                </div>
              ))}
            </article>
          </div>
        </div>
      </aside>
    </div>
  );
}
