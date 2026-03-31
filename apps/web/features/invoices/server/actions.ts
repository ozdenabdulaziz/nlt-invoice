"use server";

import { revalidatePath } from "next/cache";

import { BillingLimitExceededError } from "@/features/billing/server/service";
import { requireCompanyContext } from "@/lib/auth/session";
import { invoicePaymentSchema, invoiceSchema } from "@/lib/validations/invoice";
import {
  createInvoiceForCompany,
  InvoiceCustomerNotFoundError,
  InvoiceNotFoundError,
  InvoicePaymentNotAllowedError,
  markInvoiceAsPaidForCompany,
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

function getInvoicePaymentNotAllowedResult(
  message: string,
): ActionResult<InvoiceActionData> {
  return {
    success: false,
    message,
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

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/invoices");

    return {
      success: true,
      message: "Invoice created successfully.",
      data: {
        redirectTo: `/dashboard/invoices/${invoice.id}?success=created`,
      },
    };
  } catch (error) {
    if (
      error instanceof BillingLimitExceededError &&
      error.subject === "invoice"
    ) {
      return {
        success: false,
        message: error.message,
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

    revalidatePath("/dashboard");
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

export async function recordInvoicePaymentAction(
  invoiceId: string,
  input: unknown,
): Promise<ActionResult<InvoiceActionData>> {
  const context = await requireCompanyContext();
  const parsedInput = invoicePaymentSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      success: false,
      message: "Please correct the highlighted fields.",
      fieldErrors: parsedInput.error.flatten().fieldErrors,
    };
  }

  try {
    const invoice = await markInvoiceAsPaidForCompany(
      invoiceId,
      context.company.id,
      parsedInput.data,
    );

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/invoices");
    revalidatePath(`/dashboard/invoices/${invoiceId}`);
    revalidatePath(`/dashboard/invoices/${invoiceId}/edit`);
    revalidatePath(`/i/${invoice.publicId}`);

    return {
      success: true,
      message: "Payment recorded successfully.",
      data: {
        redirectTo: `/dashboard/invoices/${invoice.id}?success=paid`,
      },
    };
  } catch (error) {
    if (error instanceof InvoiceNotFoundError) {
      return getInvoiceNotFoundResult();
    }

    if (error instanceof InvoicePaymentNotAllowedError) {
      return getInvoicePaymentNotAllowedResult(error.message);
    }

    throw error;
  }
}
