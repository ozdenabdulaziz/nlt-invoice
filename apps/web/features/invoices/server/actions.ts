"use server";

import { revalidatePath } from "next/cache";

import { requireCompanyContext } from "@/lib/auth/session";
import { isLimitError } from "@/lib/limits";
import { invoiceSchema } from "@/lib/validations/invoice";
import {
  createInvoiceForCompany,
  InvoiceCustomerNotFoundError,
  InvoiceNotFoundError,
  updateInvoiceForCompany,
} from "@/features/invoices/server/service";
import type { ActionResult } from "@/types/actions";

type InvoiceActionData = {
  redirectTo: string;
};

function getInvoiceNotFoundResult(): ActionResult<InvoiceActionData> {
  return {
    success: false,
    message: "Invoice not found.",
  };
}

function getCustomerNotFoundResult(): ActionResult<InvoiceActionData> {
  return {
    success: false,
    message: "Selected customer could not be found for this company.",
  };
}

export async function createInvoiceAction(
  input: unknown,
): Promise<ActionResult<InvoiceActionData>> {
  const context = await requireCompanyContext();
  const parsedInput = invoiceSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      success: false,
      message: "Please correct the highlighted fields.",
      fieldErrors: parsedInput.error.flatten().fieldErrors,
    };
  }

  try {
    const invoice = await createInvoiceForCompany(
      {
        companyId: context.company.id,
        plan: context.subscription.plan,
      },
      parsedInput.data,
    );

    revalidatePath("/dashboard/invoices");

    return {
      success: true,
      message: "Invoice created successfully.",
      data: {
        redirectTo: `/dashboard/invoices/${invoice.id}?success=created`,
      },
    };
  } catch (error) {
    if (isLimitError(error, "invoice")) {
      return {
        success: false,
        message:
          "Free plan invoices are limited to 5 per month. Upgrade to Pro to create more invoices.",
      };
    }

    if (error instanceof InvoiceCustomerNotFoundError) {
      return getCustomerNotFoundResult();
    }

    if (error instanceof InvoiceNotFoundError) {
      return getInvoiceNotFoundResult();
    }

    throw error;
  }
}

export async function updateInvoiceAction(
  invoiceId: string,
  input: unknown,
): Promise<ActionResult<InvoiceActionData>> {
  const context = await requireCompanyContext();
  const parsedInput = invoiceSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      success: false,
      message: "Please correct the highlighted fields.",
      fieldErrors: parsedInput.error.flatten().fieldErrors,
    };
  }

  try {
    const invoice = await updateInvoiceForCompany(
      invoiceId,
      context.company.id,
      parsedInput.data,
    );

    revalidatePath("/dashboard/invoices");
    revalidatePath(`/dashboard/invoices/${invoiceId}`);
    revalidatePath(`/dashboard/invoices/${invoiceId}/edit`);
    revalidatePath(`/i/${invoice.publicId}`);

    return {
      success: true,
      message: "Invoice updated successfully.",
      data: {
        redirectTo: `/dashboard/invoices/${invoice.id}?success=updated`,
      },
    };
  } catch (error) {
    if (error instanceof InvoiceCustomerNotFoundError) {
      return getCustomerNotFoundResult();
    }

    if (error instanceof InvoiceNotFoundError) {
      return getInvoiceNotFoundResult();
    }

    throw error;
  }
}
