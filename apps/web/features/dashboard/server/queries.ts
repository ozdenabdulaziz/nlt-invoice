import { InvoiceStatus, Prisma } from "@prisma/client";

import { requireCompanyContext } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma/client";

type DbClient = typeof prisma | Prisma.TransactionClient;

const OUTSTANDING_STATUSES = [
  InvoiceStatus.SENT,
  InvoiceStatus.VIEWED,
  InvoiceStatus.PARTIAL,
  InvoiceStatus.OVERDUE,
];

const ACTIVE_INVOICE_STATUSES = [
  InvoiceStatus.SENT,
  InvoiceStatus.VIEWED,
  InvoiceStatus.PARTIAL,
  InvoiceStatus.PAID,
  InvoiceStatus.OVERDUE,
];

const recentInvoiceArgs = Prisma.validator<Prisma.InvoiceDefaultArgs>()({
  select: {
    id: true,
    invoiceNumber: true,
    dueDate: true,
    status: true,
    total: true,
    currency: true,
    customer: {
      select: {
        name: true,
        companyName: true,
      },
    },
  },
});

export type DashboardRecentInvoice = Prisma.InvoiceGetPayload<
  typeof recentInvoiceArgs
>;

export async function getDashboardMetricsForCompany(
  companyId: string,
  db: DbClient = prisma,
) {
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    customerCount,
    invoiceCount,
    paidRevenueAggregate,
    outstandingAggregate,
    outstandingCount,
    overdueAggregate,
    overdueCount,
    thisMonthAggregate,
    recentInvoices,
  ] = await Promise.all([
    db.customer.count({
      where: {
        companyId,
      },
    }),
    db.invoice.count({
      where: {
        companyId,
      },
    }),
    db.invoice.aggregate({
      _sum: {
        amountPaid: true,
      },
      where: {
        companyId,
        status: {
          in: [InvoiceStatus.PAID, InvoiceStatus.PARTIAL],
        },
      },
    }),
    db.invoice.aggregate({
      _sum: {
        balanceDue: true,
      },
      where: {
        companyId,
        status: {
          in: OUTSTANDING_STATUSES,
        },
      },
    }),
    db.invoice.count({
      where: {
        companyId,
        status: {
          in: OUTSTANDING_STATUSES,
        },
      },
    }),
    db.invoice.aggregate({
      _sum: {
        balanceDue: true,
      },
      where: {
        companyId,
        status: InvoiceStatus.OVERDUE,
      },
    }),
    db.invoice.count({
      where: {
        companyId,
        status: InvoiceStatus.OVERDUE,
      },
    }),
    db.invoice.aggregate({
      _sum: {
        total: true,
      },
      where: {
        companyId,
        status: {
          in: ACTIVE_INVOICE_STATUSES,
        },
        issueDate: {
          gte: thisMonthStart,
        },
      },
    }),
    db.invoice.findMany({
      ...recentInvoiceArgs,
      where: {
        companyId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 6,
    }),
  ]);

  return {
    customerCount,
    invoiceCount,
    paidRevenue: Number(paidRevenueAggregate._sum.amountPaid ?? 0),
    outstandingAmount: Number(outstandingAggregate._sum.balanceDue ?? 0),
    outstandingCount,
    overdueAmount: Number(overdueAggregate._sum.balanceDue ?? 0),
    overdueCount,
    thisMonthAmount: Number(thisMonthAggregate._sum.total ?? 0),
    recentInvoices,
  };
}

export async function getDashboardOverviewQuery() {
  const context = await requireCompanyContext();
  const metrics = await getDashboardMetricsForCompany(context.company.id);

  return {
    ...metrics,
    currency: context.company.currency,
    plan: context.subscription.plan,
    userName: context.user.name,
    companyName: context.company.companyName,
  };
}
