import { InvoiceStatus, Prisma } from "@prisma/client";

import { requireCompanyContext } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma/client";

type DbClient = typeof prisma | Prisma.TransactionClient;

export async function getDashboardMetricsForCompany(
  companyId: string,
  db: DbClient = prisma,
) {
  const [customerCount, invoiceCount, paidRevenueAggregate] = await Promise.all([
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
  ]);

  return {
    customerCount,
    invoiceCount,
    paidRevenue: Number(paidRevenueAggregate._sum.amountPaid ?? 0),
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
  };
}
