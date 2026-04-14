import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma/client";
import type { ItemInput } from "@/lib/validations/item";

const itemListArgs = Prisma.validator<Prisma.ItemDefaultArgs>()({
  select: {
    id: true,
    name: true,
    description: true,
    defaultRate: true,
    unitType: true,
    defaultTaxRate: true,
    createdAt: true,
    updatedAt: true,
  },
});

const savedItemOptionArgs = Prisma.validator<Prisma.ItemDefaultArgs>()({
  select: {
    id: true,
    name: true,
    description: true,
    defaultRate: true,
    unitType: true,
    defaultTaxRate: true,
    updatedAt: true,
  },
});

type ItemDatabaseClient = Prisma.TransactionClient | typeof prisma;

export type ItemRecord = Prisma.ItemGetPayload<typeof itemListArgs>;
export type SavedItemRecord = Prisma.ItemGetPayload<typeof savedItemOptionArgs>;

export class ItemNotFoundError extends Error {
  constructor() {
    super("item:not-found");
  }
}

function normalizeItemInput(input: ItemInput) {
  return {
    name: input.name,
    description: input.description || null,
    defaultRate: input.defaultRate,
    unitType: input.unitType,
    defaultTaxRate: input.defaultTaxRate,
  };
}

export async function listItemsForCompany(companyId: string) {
  return prisma.item.findMany({
    ...itemListArgs,
    where: {
      companyId,
    },
    take: 200,
    orderBy: [
      {
        updatedAt: "desc",
      },
      {
        name: "asc",
      },
    ],
  });
}

export async function listSavedItemsForCompany(companyId: string) {
  return prisma.item.findMany({
    ...savedItemOptionArgs,
    where: {
      companyId,
    },
    take: 200,
    orderBy: [
      {
        name: "asc",
      },
      {
        updatedAt: "desc",
      },
    ],
  });
}

export async function createItemForCompany(companyId: string, input: ItemInput) {
  return prisma.item.create({
    data: {
      companyId,
      ...normalizeItemInput(input),
    },
    select: {
      id: true,
    },
  });
}

export async function updateItemForCompany(
  itemId: string,
  companyId: string,
  input: ItemInput,
) {
  const existingItem = await prisma.item.findFirst({
    where: {
      id: itemId,
      companyId,
    },
    select: {
      id: true,
    },
  });

  if (!existingItem) {
    throw new ItemNotFoundError();
  }

  return prisma.item.update({
    where: {
      id: existingItem.id,
    },
    data: normalizeItemInput(input),
    select: {
      id: true,
    },
  });
}

export async function deleteItemForCompany(itemId: string, companyId: string) {
  const existingItem = await prisma.item.findFirst({
    where: {
      id: itemId,
      companyId,
    },
    select: {
      id: true,
    },
  });

  if (!existingItem) {
    throw new ItemNotFoundError();
  }

  await prisma.item.delete({
    where: {
      id: existingItem.id,
    },
  });
}

export async function listValidSavedItemIdsForCompany(
  db: ItemDatabaseClient,
  companyId: string,
  itemIds: string[],
) {
  if (!itemIds.length) {
    return new Set<string>();
  }

  const records = await db.item.findMany({
    where: {
      companyId,
      id: {
        in: itemIds,
      },
    },
    select: {
      id: true,
    },
  });

  return new Set(records.map((record) => record.id));
}
