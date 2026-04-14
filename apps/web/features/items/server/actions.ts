"use server";

import { revalidatePath } from "next/cache";

import { requireCompanyContext } from "@/lib/auth/session";
import { itemSchema } from "@/lib/validations/item";
import {
  createItemForCompany,
  deleteItemForCompany,
  ItemNotFoundError,
  updateItemForCompany,
} from "@/features/items/server/service";
import type { ActionResult } from "@/types/actions";

type ItemActionData = {
  itemId?: string;
};

function getItemNotFoundResult(): ActionResult<ItemActionData> {
  return {
    success: false,
    message: "Item not found.",
  };
}

function revalidateItemPaths() {
  revalidatePath("/dashboard/items");
  revalidatePath("/dashboard/invoices/new");
  revalidatePath("/dashboard/estimates/new");
}

export async function createItemAction(
  input: unknown,
): Promise<ActionResult<ItemActionData>> {
  const context = await requireCompanyContext();
  const parsedInput = itemSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      success: false,
      message: "Please correct the highlighted fields.",
      fieldErrors: parsedInput.error.flatten().fieldErrors,
    };
  }

  const item = await createItemForCompany(context.company.id, parsedInput.data);
  revalidateItemPaths();

  return {
    success: true,
    message: "Item created successfully.",
    data: {
      itemId: item.id,
    },
  };
}

export async function updateItemAction(
  itemId: string,
  input: unknown,
): Promise<ActionResult<ItemActionData>> {
  const context = await requireCompanyContext();
  const parsedInput = itemSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      success: false,
      message: "Please correct the highlighted fields.",
      fieldErrors: parsedInput.error.flatten().fieldErrors,
    };
  }

  try {
    const item = await updateItemForCompany(itemId, context.company.id, parsedInput.data);
    revalidateItemPaths();

    return {
      success: true,
      message: "Item updated successfully.",
      data: {
        itemId: item.id,
      },
    };
  } catch (error) {
    if (error instanceof ItemNotFoundError) {
      return getItemNotFoundResult();
    }

    throw error;
  }
}

export async function deleteItemAction(
  itemId: string,
): Promise<ActionResult<ItemActionData>> {
  const context = await requireCompanyContext();

  try {
    await deleteItemForCompany(itemId, context.company.id);
    revalidateItemPaths();

    return {
      success: true,
      message: "Item deleted successfully.",
    };
  } catch (error) {
    if (error instanceof ItemNotFoundError) {
      return getItemNotFoundResult();
    }

    throw error;
  }
}
