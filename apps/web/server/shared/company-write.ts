import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma/client";

type DbClient = typeof prisma | Prisma.TransactionClient;

export async function lockCompanyForWrite(db: DbClient, companyId: string) {
  await db.$queryRaw<Array<{ id: string }>>(
    Prisma.sql`SELECT "id" FROM "companies" WHERE "id" = ${companyId} FOR UPDATE`,
  );
}
