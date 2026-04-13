import Link from "next/link";
import {
  ArrowUpRight,
  BadgeCheck,
  CheckCircle2,
  CircleAlert,
  Clock3,
  ReceiptText,
} from "lucide-react";

import { LoginForm } from "@/components/forms/auth/login-form";
import { BrandMark } from "@/components/shared/brand-mark";

const previewStats = [
  {
    label: "Collected this month",
    value: "$24,860",
    detail: "+12.4%",
  },
  {
    label: "Pending invoices",
    value: "18",
    detail: "6 due this week",
  },
  {
    label: "On-time payments",
    value: "94%",
    detail: "Stable trend",
  },
];

const previewActivity = [
  {
    company: "Summit Design",
    amount: "$2,100",
    time: "1h ago",
    status: "Paid",
    tone: "paid" as const,
  },
  {
    company: "Northline Studio",
    amount: "$780",
    time: "4h ago",
    status: "Processing",
    tone: "processing" as const,
  },
  {
    company: "Atlas Build",
    amount: "$1,340",
    time: "Yesterday",
    status: "Overdue",
    tone: "overdue" as const,
  },
];

const productBullets = [
  "Send invoices in seconds",
  "Track payments easily",
  "Built for Canadian businesses",
];

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; reset?: string; verified?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const callbackUrl =
    typeof resolvedSearchParams.callbackUrl === "string"
      ? resolvedSearchParams.callbackUrl
      : "/dashboard";
  const resetSuccess = resolvedSearchParams.reset === "success";
  const verifiedSuccess = resolvedSearchParams.verified === "success";

  return (
    <div className="mx-auto flex min-h-[calc(100svh-9rem)] w-full max-w-[1200px] items-center py-6 sm:py-8">
      <div className="grid w-full grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:items-start lg:gap-10">
        <section className="space-y-6 lg:space-y-7">
          <div className="space-y-4">
            <BrandMark className="origin-left scale-110 sm:scale-[1.18]" />
            <div className="max-w-xl rounded-2xl border border-border/70 bg-card/72 px-5 py-4 shadow-[0_24px_64px_-46px_rgba(15,23,42,0.45)] backdrop-blur">
              <p className="text-sm font-medium text-foreground/80">
                Trusted by small businesses across Canada
              </p>
            </div>
          </div>

          <div className="max-w-xl">
            <LoginForm
              callbackUrl={callbackUrl}
              resetSuccess={resetSuccess}
              verifiedSuccess={verifiedSuccess}
            />
          </div>

          <p className="max-w-xl text-sm text-muted-foreground">
            Need an account?{" "}
            <Link href="/register" className="font-semibold text-primary underline-offset-4 hover:underline">
              Create one
            </Link>
            .
          </p>
        </section>

        <aside className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/92 p-5 shadow-[0_46px_120px_-72px_rgba(15,23,42,0.58)] backdrop-blur sm:p-6">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(140deg,hsl(var(--primary))/0.12_0%,transparent_45%,hsl(var(--primary))/0.08_100%)]" />
          <div className="pointer-events-none absolute -right-24 top-0 h-44 w-44 rounded-full bg-primary/12 blur-3xl" />
          <div className="relative space-y-5">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-primary/80">
                Product preview
              </p>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                Create invoices. Get paid faster.
              </h2>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                {productBullets.map((bullet) => (
                  <li key={bullet} className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 shrink-0 text-emerald-600" aria-hidden="true" />
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid gap-2.5 sm:grid-cols-3">
              {previewStats.map((item) => (
                <article key={item.label} className="rounded-xl border border-border/70 bg-background/90 p-3">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                    {item.label}
                  </p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">{item.value}</p>
                  <p className="mt-1 text-xs font-medium text-emerald-700">{item.detail}</p>
                </article>
              ))}
            </div>

            <div className="grid gap-3 md:grid-cols-[1.05fr_0.95fr]">
              <article className="rounded-2xl border border-border/70 bg-background/90 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">Invoice #INV-4082</p>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/12 px-2 py-1 text-[11px] font-medium text-emerald-700">
                    <BadgeCheck className="size-3" aria-hidden="true" />
                    Paid
                  </span>
                </div>
                <div className="space-y-2 rounded-xl border border-border/70 bg-card/80 p-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Client</span>
                    <span className="font-medium text-foreground">Prairie Studio</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Due date</span>
                    <span className="font-medium text-foreground">Apr 20, 2026</span>
                  </div>
                  <div className="h-px bg-border/70" />
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Website package</span>
                    <span className="font-medium text-foreground">$1,650</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Support plan</span>
                    <span className="font-medium text-foreground">$380</span>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between rounded-xl border border-border/70 bg-card px-3 py-2">
                  <span className="text-xs text-muted-foreground">Total received</span>
                  <span className="text-sm font-semibold text-foreground">$2,030</span>
                </div>
              </article>

              <article className="space-y-2.5 rounded-2xl border border-border/70 bg-background/90 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">Payment activity</p>
                  <ReceiptText className="size-4 text-primary/80" aria-hidden="true" />
                </div>
                {previewActivity.map((entry) => (
                  <div key={entry.company} className="rounded-xl border border-border/70 bg-card/90 px-3 py-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-foreground">{entry.company}</span>
                      <span className="font-semibold text-foreground">{entry.amount}</span>
                    </div>
                    <div className="mt-1.5 flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground">{entry.time}</span>
                      <span
                        className={
                          entry.tone === "paid"
                            ? "inline-flex items-center gap-1 rounded-full bg-emerald-500/12 px-2 py-0.5 text-emerald-700"
                            : entry.tone === "processing"
                              ? "inline-flex items-center gap-1 rounded-full bg-amber-500/12 px-2 py-0.5 text-amber-700"
                              : "inline-flex items-center gap-1 rounded-full bg-rose-500/12 px-2 py-0.5 text-rose-700"
                        }
                      >
                        {entry.tone === "paid" ? (
                          <ArrowUpRight className="size-3" aria-hidden="true" />
                        ) : entry.tone === "processing" ? (
                          <Clock3 className="size-3" aria-hidden="true" />
                        ) : (
                          <CircleAlert className="size-3" aria-hidden="true" />
                        )}
                        {entry.status}
                      </span>
                    </div>
                  </div>
                ))}
              </article>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
