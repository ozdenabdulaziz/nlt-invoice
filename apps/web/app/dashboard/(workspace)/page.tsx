import Link from "next/link";

import { InvoiceStatus } from "@prisma/client";
import {
  AlertTriangle,
  ArrowRight,
  CreditCard,
  FilePlus2,
  Mail,
  UserPlus,
} from "lucide-react";
import { Badge, Card, CardContent, buttonVariants } from "@nlt-invoice/ui";

import { getDashboardOverviewQuery } from "@/features/dashboard/server/queries";
import { cn } from "@/lib/utils";

function formatCurrency(
  value: number | string | { toString(): string },
  currency: string,
) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency,
  }).format(Number(value));
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

function getGreeting(date = new Date()) {
  const hour = date.getHours();

  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 18) {
    return "Good afternoon";
  }

  return "Good evening";
}

function getInvoiceStatusMeta(status: InvoiceStatus) {
  if (status === InvoiceStatus.PAID) {
    return {
      label: "Paid",
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    };
  }

  if (status === InvoiceStatus.OVERDUE) {
    return {
      label: "Overdue",
      className: "border-red-200 bg-red-50 text-red-700",
    };
  }

  if (status === InvoiceStatus.DRAFT || status === InvoiceStatus.VOID) {
    return {
      label: status === InvoiceStatus.DRAFT ? "Draft" : "Void",
      className: "border-slate-200 bg-slate-100 text-slate-700",
    };
  }

  return {
    label: "Pending",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  };
}

function canRecordPayment(status: InvoiceStatus) {
  return status !== InvoiceStatus.PAID && status !== InvoiceStatus.VOID;
}

type KpiCardTone = "neutral" | "warning" | "danger";

function KpiShortcutCard({
  title,
  value,
  hint,
  href,
  tone,
  displayMode = "amount",
}: {
  title: string;
  value: string;
  hint: string;
  href: string;
  tone: KpiCardTone;
  displayMode?: "amount" | "message";
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group block rounded-2xl border p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_30px_72px_-56px_rgba(15,23,42,0.6)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        tone === "warning" && "border-amber-200/80 bg-amber-50/45",
        tone === "danger" && "border-red-200/80 bg-red-50/45",
        tone === "neutral" && "border-border/70 bg-white/95",
      )}
    >
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p
          className={cn(
            "font-semibold tracking-tight text-foreground",
            displayMode === "amount" ? "text-3xl" : "text-2xl leading-8",
            tone === "danger" && "text-red-700",
            tone === "warning" && "text-amber-800",
          )}
        >
          {value}
        </p>
        <p className="text-sm leading-6 text-muted-foreground">{hint}</p>
      </div>
      <p className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-foreground/90 transition group-hover:text-foreground">
        Open invoices
        <ArrowRight className="h-4 w-4" />
      </p>
    </Link>
  );
}

const quickActions = [
  {
    href: "/dashboard/invoices/new",
    label: "Create Invoice",
    description: "Create and send invoices faster.",
    icon: FilePlus2,
    primary: true,
  },
  {
    href: "/dashboard/customers/new",
    label: "Add Customer",
    description: "Save client details for repeat invoices.",
    icon: UserPlus,
    primary: false,
  },
  {
    href: "/dashboard/invoices",
    label: "Record Payment",
    description: "Mark paid invoices and update balances.",
    icon: CreditCard,
    primary: false,
  },
  {
    href: "/dashboard/invoices",
    label: "Send Reminder",
    description: "Follow up on due invoices quickly.",
    icon: Mail,
    primary: false,
  },
] as const;

export default async function DashboardPage() {
  const overview = await getDashboardOverviewQuery();
  const hasInvoices = overview.recentInvoices.length > 0;
  const greetingTarget = overview.companyName || overview.userName;
  const hasAttention = overview.outstandingAmount > 0 || overview.overdueCount > 0;

  const paidRevenueValue =
    overview.paidRevenue > 0
      ? formatCurrency(overview.paidRevenue, overview.currency)
      : "No revenue yet";
  const paidRevenueHint =
    overview.paidRevenue > 0
      ? `${formatCurrency(overview.paidRevenue, overview.currency)} collected.`
      : "Create your first invoice to start tracking income.";

  const outstandingValue =
    overview.outstandingAmount > 0
      ? formatCurrency(overview.outstandingAmount, overview.currency)
      : "All caught up";
  const outstandingHint =
    overview.outstandingAmount > 0
      ? `${formatCurrency(overview.outstandingAmount, overview.currency)} waiting to be paid.`
      : "No unpaid invoices right now.";

  const overdueValue =
    overview.overdueAmount > 0
      ? formatCurrency(overview.overdueAmount, overview.currency)
      : "No overdue invoices";
  const overdueHint =
    overview.overdueAmount > 0
      ? `${formatCurrency(overview.overdueAmount, overview.currency)} past due.`
      : "No overdue invoices right now.";

  const thisMonthValue =
    overview.thisMonthAmount > 0
      ? formatCurrency(overview.thisMonthAmount, overview.currency)
      : "No invoices this month";
  const thisMonthHint =
    overview.thisMonthAmount > 0
      ? `${formatCurrency(overview.thisMonthAmount, overview.currency)} invoiced this month.`
      : "Create and send an invoice to get started.";

  return (
    <div className="space-y-8 pb-6">
      <section className="relative overflow-hidden rounded-3xl border border-border/70 bg-card px-6 py-6 shadow-[0_28px_82px_-66px_rgba(15,23,42,0.65)] md:px-7">
        <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-primary/5 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 left-20 h-40 w-40 rounded-full bg-primary/5 blur-2xl" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2.5">
            <p className="text-sm font-medium text-muted-foreground">Here&apos;s your business overview</p>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-[2.1rem]">
              {getGreeting()}, {greetingTarget}
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground md:text-[0.95rem]">
              See what&apos;s unpaid, send invoices faster, and stay on top of overdue payments.
            </p>
          </div>
          <Link
            href="/dashboard/invoices/new"
            className={buttonVariants({
              size: "lg",
              className:
                "rounded-full px-7 shadow-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
            })}
          >
            Create Invoice
          </Link>
        </div>
      </section>

      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">Quick Actions</h2>
          <p className="text-sm text-muted-foreground">Start work quickly without leaving your dashboard.</p>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = action.icon;

            return (
              <Link
                key={action.label}
                href={action.href}
                className={cn(
                  "group cursor-pointer rounded-2xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_30px_72px_-56px_rgba(15,23,42,0.62)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                  action.primary
                    ? "border-primary/35 bg-primary text-primary-foreground shadow-[0_24px_60px_-54px_rgba(27,46,93,0.85)] hover:bg-primary/95"
                    : "border-border/70 bg-white/95 text-foreground hover:border-primary/30",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <span
                    className={cn(
                      "inline-flex h-9 w-9 items-center justify-center rounded-xl",
                      action.primary
                        ? "bg-primary-foreground/15 text-primary-foreground"
                        : "bg-secondary text-secondary-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <ArrowRight
                    className={cn(
                      "h-4 w-4 transition",
                      action.primary
                        ? "text-primary-foreground/80 group-hover:text-primary-foreground"
                        : "text-muted-foreground group-hover:text-foreground",
                    )}
                  />
                </div>
                <div className="mt-4 space-y-1.5">
                  <p className="text-sm font-semibold">{action.label}</p>
                  <p
                    className={cn(
                      "text-xs leading-5",
                      action.primary ? "text-primary-foreground/85" : "text-muted-foreground",
                    )}
                  >
                    {action.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiShortcutCard
          title="Total Revenue"
          value={paidRevenueValue}
          hint={paidRevenueHint}
          href="/dashboard/invoices"
          tone="neutral"
          displayMode={overview.paidRevenue > 0 ? "amount" : "message"}
        />
        <KpiShortcutCard
          title="Outstanding"
          value={outstandingValue}
          hint={outstandingHint}
          href="/dashboard/invoices"
          tone={overview.outstandingAmount > 0 ? "warning" : "neutral"}
          displayMode={overview.outstandingAmount > 0 ? "amount" : "message"}
        />
        <KpiShortcutCard
          title="Overdue"
          value={overdueValue}
          hint={overdueHint}
          href="/dashboard/invoices"
          tone={overview.overdueAmount > 0 ? "danger" : "neutral"}
          displayMode={overview.overdueAmount > 0 ? "amount" : "message"}
        />
        <KpiShortcutCard
          title="This Month"
          value={thisMonthValue}
          hint={thisMonthHint}
          href="/dashboard/invoices"
          tone="neutral"
          displayMode={overview.thisMonthAmount > 0 ? "amount" : "message"}
        />
      </section>

      {hasAttention ? (
        <section>
          <Card className="border-amber-200/90 bg-amber-50 shadow-[0_26px_70px_-58px_rgba(120,53,15,0.5)]">
            <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-3">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                  <AlertTriangle className="h-5 w-5" />
                </span>
                <div className="space-y-1">
                  {overview.overdueCount > 0 ? (
                    <>
                      <p className="text-lg font-semibold tracking-tight text-foreground">
                        You have {overview.overdueCount} overdue{" "}
                        {overview.overdueCount === 1 ? "invoice" : "invoices"} totaling{" "}
                        {formatCurrency(overview.overdueAmount, overview.currency)}.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Follow up now to get paid sooner.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-lg font-semibold tracking-tight text-foreground">
                        You have {overview.outstandingCount} unpaid{" "}
                        {overview.outstandingCount === 1 ? "invoice" : "invoices"} totaling{" "}
                        {formatCurrency(overview.outstandingAmount, overview.currency)}.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Review due dates and send reminders before they become overdue.
                      </p>
                    </>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/dashboard/invoices"
                  className={buttonVariants({
                    className:
                      "rounded-full px-6 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                  })}
                >
                  {overview.overdueCount > 0 ? "View overdue invoices" : "Review unpaid invoices"}
                </Link>
                <Link
                  href="/dashboard/invoices"
                  className={buttonVariants({
                    variant: "outline",
                    className:
                      "rounded-full px-6 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                  })}
                >
                  {overview.overdueCount > 0 ? "Send reminders" : "Record payment"}
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      ) : null}

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold tracking-tight text-foreground">Recent Invoices</h2>
            <p className="text-sm text-muted-foreground">
              Review due dates, payment status, and next actions at a glance.
            </p>
          </div>
          <Link
            href="/dashboard/invoices"
            className={buttonVariants({
              variant: "outline",
              className:
                "rounded-full px-5 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
            })}
          >
            View all
          </Link>
        </div>

        {hasInvoices ? (
          <Card className="border-border/70 bg-white/95 shadow-[0_30px_72px_-60px_rgba(15,23,42,0.56)]">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-border/70 bg-muted/40 text-muted-foreground">
                    <tr>
                      <th className="px-6 py-4 font-medium">Client</th>
                      <th className="px-6 py-4 font-medium">Amount</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                      <th className="px-6 py-4 font-medium">Due Date</th>
                      <th className="px-6 py-4 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overview.recentInvoices.map((invoice) => {
                      const statusMeta = getInvoiceStatusMeta(invoice.status as InvoiceStatus);

                      return (
                        <tr
                          key={invoice.id}
                          className="border-b border-border/60 transition-colors last:border-b-0 hover:bg-muted/20"
                        >
                          <td className="px-6 py-4">
                            <p className="font-medium text-foreground">
                              {invoice.customer.companyName || invoice.customer.name}
                            </p>
                            {invoice.customer.companyName ? (
                              <p className="text-xs text-muted-foreground">{invoice.customer.name}</p>
                            ) : null}
                          </td>
                          <td className="px-6 py-4 font-medium text-foreground">
                            {formatCurrency(invoice.total.toString(), invoice.currency)}
                          </td>
                          <td className="px-6 py-4">
                            <Badge
                              variant="outline"
                              className={cn(
                                "rounded-full border px-2.5 py-1 text-xs font-semibold",
                                statusMeta.className,
                              )}
                            >
                              {statusMeta.label}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-muted-foreground">
                            {formatDate(invoice.dueDate)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="inline-flex items-center gap-2">
                              <Link
                                href={`/dashboard/invoices/${invoice.id}`}
                                className={buttonVariants({
                                  variant: "ghost",
                                  className:
                                    "rounded-full px-3 text-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                                })}
                              >
                                View
                              </Link>
                              {canRecordPayment(invoice.status as InvoiceStatus) ? (
                                <Link
                                  href={`/dashboard/invoices/${invoice.id}`}
                                  className={buttonVariants({
                                    variant: "outline",
                                    className:
                                      "rounded-full px-3 text-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                                  })}
                                >
                                  Record payment
                                </Link>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-border/70 bg-white/95 shadow-[0_30px_72px_-60px_rgba(15,23,42,0.56)]">
            <CardContent className="space-y-4 p-6">
              <p className="text-lg font-semibold tracking-tight text-foreground">No invoices yet</p>
              <p className="max-w-xl text-sm leading-6 text-muted-foreground">
                Create your first invoice in under a minute to start tracking due dates and payments.
              </p>
              <Link
                href="/dashboard/invoices/new"
                className={buttonVariants({
                  className:
                    "rounded-full px-6 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                })}
              >
                Create your first invoice
              </Link>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
