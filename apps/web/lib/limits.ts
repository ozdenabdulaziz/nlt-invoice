import type { Plan, Prisma, UsageMetricType } from "@prisma/client";

import { getPlanConfig } from "@/lib/billing";

export type LimitSubject = "customer" | "invoice" | "estimate";

export function getCurrentUsagePeriodKey(date = new Date()) {
  const year = date.getUTCFullYear();
  const month = `${date.getUTCMonth() + 1}`.padStart(2, "0");

  return `${year}-${month}`;
}

export function getUsageMetricDescriptor(subject: LimitSubject) {
  switch (subject) {
    case "customer":
      return {
        metricType: "CUSTOMERS_COUNT" as UsageMetricType,
        periodKey: "all-time",
      };
    case "invoice":
      return {
        metricType: "INVOICES_THIS_MONTH" as UsageMetricType,
        periodKey: getCurrentUsagePeriodKey(),
      };
    case "estimate":
      return {
        metricType: "ESTIMATES_THIS_MONTH" as UsageMetricType,
        periodKey: getCurrentUsagePeriodKey(),
      };
  }
}

export function getPlanLimit(plan: Plan, subject: LimitSubject) {
  const limits = getPlanConfig(plan).limits;

  switch (subject) {
    case "customer":
      return limits.maxCustomers;
    case "invoice":
      return limits.maxInvoicesPerMonth;
    case "estimate":
      return limits.maxEstimatesPerMonth;
  }
}

export async function assertPlanLimitAvailable(
  db: Prisma.TransactionClient,
  companyId: string,
  plan: Plan,
  subject: LimitSubject,
) {
  const limit = getPlanLimit(plan, subject);

  if (limit === null) {
    return;
  }

  const descriptor = getUsageMetricDescriptor(subject);

  const metric = await db.usageMetric.findUnique({
    where: {
      companyId_metricType_periodKey: {
        companyId,
        metricType: descriptor.metricType,
        periodKey: descriptor.periodKey,
      },
    },
    select: {
      value: true,
    },
  });

  if ((metric?.value ?? 0) >= limit) {
    throw new Error(`limit:${subject}`);
  }
}

export async function incrementUsageMetric(
  db: Prisma.TransactionClient,
  companyId: string,
  subject: LimitSubject,
) {
  const descriptor = getUsageMetricDescriptor(subject);

  await db.usageMetric.upsert({
    where: {
      companyId_metricType_periodKey: {
        companyId,
        metricType: descriptor.metricType,
        periodKey: descriptor.periodKey,
      },
    },
    create: {
      companyId,
      metricType: descriptor.metricType,
      periodKey: descriptor.periodKey,
      value: 1,
    },
    update: {
      value: {
        increment: 1,
      },
    },
  });
}

export async function decrementCustomerMetric(
  db: Prisma.TransactionClient,
  companyId: string,
) {
  const descriptor = getUsageMetricDescriptor("customer");

  await db.usageMetric.updateMany({
    where: {
      companyId,
      metricType: descriptor.metricType,
      periodKey: descriptor.periodKey,
      value: {
        gt: 0,
      },
    },
    data: {
      value: {
        decrement: 1,
      },
    },
  });
}

export function isLimitError(error: unknown, subject?: LimitSubject) {
  if (!(error instanceof Error) || !error.message.startsWith("limit:")) {
    return false;
  }

  return subject ? error.message === `limit:${subject}` : true;
}
