import { Plan, Prisma, type UsageMetricType } from "@prisma/client";

import { prisma } from "@/lib/prisma/client";

import {
  getLimitExceededMessage,
  getPlanConfig,
  getPlanLimit,
  getUsageLabel,
  type BillingSubject,
} from "@/features/billing/server/plans";

type BillingDbClient = typeof prisma | Prisma.TransactionClient;

export type BillingContext = {
  companyId: string;
  plan: Plan;
};

export type BillingAllowanceResult = {
  allowed: boolean;
  subject: BillingSubject;
  used: number;
  limit: number | null;
  remaining: number | null;
  message: string | null;
  periodKey: string;
};

export type BillingUsageSummaryItem = {
  subject: BillingSubject;
  label: string;
  used: number;
  limit: number | null;
  remaining: number | null;
  periodKey: string;
};

export type BillingUsageSummary = {
  plan: Plan;
  usage: BillingUsageSummaryItem[];
};

type UsageMetricDescriptor = {
  metricType: UsageMetricType;
  periodKey: string;
};

export class BillingLimitExceededError extends Error {
  constructor(
    public readonly subject: BillingSubject,
    public readonly plan: Plan,
    public readonly used: number,
    public readonly limit: number,
    public readonly periodKey: string,
  ) {
    super(getLimitExceededMessage(plan, subject));
    this.name = "BillingLimitExceededError";
  }
}

export function getCurrentUsagePeriodKey(date = new Date()) {
  const year = date.getUTCFullYear();
  const month = `${date.getUTCMonth() + 1}`.padStart(2, "0");

  return `${year}-${month}`;
}

function getUsageMetricDescriptor(
  subject: BillingSubject,
  date = new Date(),
): UsageMetricDescriptor {
  switch (subject) {
    case "customer":
      return {
        metricType: "CUSTOMERS_COUNT",
        periodKey: "all-time",
      };
    case "invoice":
      return {
        metricType: "INVOICES_THIS_MONTH",
        periodKey: getCurrentUsagePeriodKey(date),
      };
    case "estimate":
      return {
        metricType: "ESTIMATES_THIS_MONTH",
        periodKey: getCurrentUsagePeriodKey(date),
      };
  }
}

function getUsageWindow(date = new Date()) {
  const start = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1, 0, 0, 0, 0),
  );
  const end = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1, 0, 0, 0, 0),
  );

  return { start, end };
}

async function getActualUsageCount(
  db: BillingDbClient,
  companyId: string,
  subject: BillingSubject,
  date = new Date(),
) {
  switch (subject) {
    case "customer":
      return db.customer.count({
        where: {
          companyId,
        },
      });
    case "invoice": {
      const { start, end } = getUsageWindow(date);

      return db.invoice.count({
        where: {
          companyId,
          createdAt: {
            gte: start,
            lt: end,
          },
        },
      });
    }
    case "estimate": {
      const { start, end } = getUsageWindow(date);

      return db.estimate.count({
        where: {
          companyId,
          createdAt: {
            gte: start,
            lt: end,
          },
        },
      });
    }
  }
}

export async function resolveActiveCompanyPlan(
  companyId: string,
  db: BillingDbClient = prisma,
) {
  const subscription = await db.subscription.findUnique({
    where: {
      companyId,
    },
    select: {
      plan: true,
    },
  });

  return subscription?.plan ?? Plan.FREE;
}

export async function checkBillingAllowance(
  db: BillingDbClient,
  context: BillingContext,
  subject: BillingSubject,
  date = new Date(),
): Promise<BillingAllowanceResult> {
  const limit = getPlanLimit(context.plan, subject);
  const descriptor = getUsageMetricDescriptor(subject, date);
  const used = await getActualUsageCount(db, context.companyId, subject, date);

  if (limit === null) {
    return {
      allowed: true,
      subject,
      used,
      limit,
      remaining: null,
      message: null,
      periodKey: descriptor.periodKey,
    };
  }

  if (used >= limit) {
    return {
      allowed: false,
      subject,
      used,
      limit,
      remaining: 0,
      message: getLimitExceededMessage(context.plan, subject),
      periodKey: descriptor.periodKey,
    };
  }

  return {
    allowed: true,
    subject,
    used,
    limit,
    remaining: limit - used,
    message: null,
    periodKey: descriptor.periodKey,
  };
}

export async function assertBillingAllowance(
  db: BillingDbClient,
  context: BillingContext,
  subject: BillingSubject,
  date = new Date(),
) {
  const result = await checkBillingAllowance(db, context, subject, date);

  if (!result.allowed && result.limit !== null) {
    throw new BillingLimitExceededError(
      result.subject,
      context.plan,
      result.used,
      result.limit,
      result.periodKey,
    );
  }
}

export async function incrementUsageMetric(
  db: BillingDbClient,
  companyId: string,
  subject: BillingSubject,
  date = new Date(),
) {
  const descriptor = getUsageMetricDescriptor(subject, date);

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
  db: BillingDbClient,
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

export async function getBillingUsageSummaryForCompany(
  companyId: string,
  plan: Plan,
  db: BillingDbClient = prisma,
  date = new Date(),
): Promise<BillingUsageSummary> {
  const [customerCount, actualInvoiceCount, actualEstimateCount] = await Promise.all([
    getActualUsageCount(db, companyId, "customer", date),
    getActualUsageCount(db, companyId, "invoice", date),
    getActualUsageCount(db, companyId, "estimate", date),
  ]);
  const invoiceDescriptor = getUsageMetricDescriptor("invoice", date);
  const estimateDescriptor = getUsageMetricDescriptor("estimate", date);

  const usage: BillingUsageSummaryItem[] = [
    {
      subject: "customer",
      label: getUsageLabel("customer"),
      used: customerCount,
      limit: getPlanLimit(plan, "customer"),
      remaining:
        getPlanLimit(plan, "customer") === null
          ? null
          : Math.max(getPlanLimit(plan, "customer")! - customerCount, 0),
      periodKey: "all-time",
    },
    {
      subject: "invoice",
      label: getUsageLabel("invoice"),
      used: actualInvoiceCount,
      limit: getPlanLimit(plan, "invoice"),
      remaining:
        getPlanLimit(plan, "invoice") === null
          ? null
          : Math.max(
              getPlanLimit(plan, "invoice")! -
                actualInvoiceCount,
              0,
            ),
      periodKey: invoiceDescriptor.periodKey,
    },
    {
      subject: "estimate",
      label: getUsageLabel("estimate"),
      used: actualEstimateCount,
      limit: getPlanLimit(plan, "estimate"),
      remaining:
        getPlanLimit(plan, "estimate") === null
          ? null
          : Math.max(
              getPlanLimit(plan, "estimate")! -
                actualEstimateCount,
              0,
            ),
      periodKey: estimateDescriptor.periodKey,
    },
  ];

  return {
    plan,
    usage,
  };
}

export function getPlanUsageSummaryText(plan: Plan) {
  const config = getPlanConfig(plan);

  return `${config.name} plan allows ${config.limits.customer ?? "unlimited"} customers, ${
    config.limits.invoice ?? "unlimited"
  } invoices per month, and ${config.limits.estimate ?? "unlimited"} estimates per month.`;
}
