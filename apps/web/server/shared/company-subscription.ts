import { Plan, Prisma, SubscriptionStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma/client";

type DbClient = typeof prisma | Prisma.TransactionClient;

export async function ensureCompanySubscription(
  db: DbClient,
  companyId: string,
) {
  return db.subscription.upsert({
    where: {
      companyId,
    },
    update: {},
    create: {
      companyId,
      plan: Plan.FREE,
      status: SubscriptionStatus.ACTIVE,
    },
  });
}
