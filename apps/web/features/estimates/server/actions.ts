"use server";

import { revalidatePath } from "next/cache";

import { requireCompanyContext } from "@/lib/auth/session";
import { isLimitError } from "@/lib/limits";
import {
  convertEstimateToInvoiceForCompany,
  InvoiceNotFoundError,
  InvoiceSourceEstimateAlreadyConvertedError,
  InvoiceSourceEstimateNotConvertibleError,
  InvoiceSourceEstimateNotFoundError,
} from "@/features/invoices/server/service";
import { estimateSchema } from "@/lib/validations/estimate";
import {
  createEstimateForCompany,
  EstimateCustomerNotFoundError,
  EstimateNotFoundError,
  updateEstimateForCompany,
} from "@/features/estimates/server/service";
import type { ActionResult } from "@/types/actions";

type EstimateActionData = {
  redirectTo: string;
};

function getEstimateNotFoundResult(): ActionResult<EstimateActionData> {
  return {
    success: false,
    message: "Estimate not found.",
  };
}

function getCustomerNotFoundResult(): ActionResult<EstimateActionData> {
  return {
    success: false,
    message: "Selected customer could not be found for this company.",
  };
}

function getInvoiceLimitResult(): ActionResult<EstimateActionData> {
  return {
    success: false,
    message:
      "Free plan invoices are limited to 5 per month. Upgrade to Pro to create more invoices.",
  };
}

function getEstimateNotConvertibleResult(): ActionResult<EstimateActionData> {
  return {
    success: false,
    message: "Only sent, viewed, or accepted estimates can be converted into invoices.",
  };
}

export async function createEstimateAction(
  input: unknown,
): Promise<ActionResult<EstimateActionData>> {
  const context = await requireCompanyContext();
  const parsedInput = estimateSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      success: false,
      message: "Please correct the highlighted fields.",
      fieldErrors: parsedInput.error.flatten().fieldErrors,
    };
  }

  try {
    const estimate = await createEstimateForCompany(
      {
        companyId: context.company.id,
        plan: context.subscription.plan,
      },
      parsedInput.data,
    );

    revalidatePath("/dashboard/estimates");

    return {
      success: true,
      message: "Estimate created successfully.",
      data: {
        redirectTo: `/dashboard/estimates/${estimate.id}?success=created`,
      },
    };
  } catch (error) {
    if (isLimitError(error, "estimate")) {
      return {
        success: false,
        message:
          "Free plan estimates are limited to 3 per month. Upgrade to Pro to create more estimates.",
      };
    }

    if (error instanceof EstimateCustomerNotFoundError) {
      return getCustomerNotFoundResult();
    }

    if (error instanceof EstimateNotFoundError) {
      return getEstimateNotFoundResult();
    }

    throw error;
  }
}

export async function updateEstimateAction(
  estimateId: string,
  input: unknown,
): Promise<ActionResult<EstimateActionData>> {
  const context = await requireCompanyContext();
  const parsedInput = estimateSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      success: false,
      message: "Please correct the highlighted fields.",
      fieldErrors: parsedInput.error.flatten().fieldErrors,
    };
  }

  try {
    const estimate = await updateEstimateForCompany(
      estimateId,
      context.company.id,
      parsedInput.data,
    );

    revalidatePath("/dashboard/estimates");
    revalidatePath(`/dashboard/estimates/${estimateId}`);
    revalidatePath(`/dashboard/estimates/${estimateId}/edit`);
    revalidatePath(`/e/${estimate.publicId}`);

    return {
      success: true,
      message: "Estimate updated successfully.",
      data: {
        redirectTo: `/dashboard/estimates/${estimate.id}?success=updated`,
      },
    };
  } catch (error) {
    if (error instanceof EstimateCustomerNotFoundError) {
      return getCustomerNotFoundResult();
    }

    if (error instanceof EstimateNotFoundError) {
      return getEstimateNotFoundResult();
    }

    throw error;
  }
}

export async function convertEstimateToInvoiceAction(
  estimateId: string,
): Promise<ActionResult<EstimateActionData>> {
  const context = await requireCompanyContext();

  try {
    const invoice = await convertEstimateToInvoiceForCompany(
      {
        companyId: context.company.id,
        plan: context.subscription.plan,
      },
      estimateId,
    );

    revalidatePath("/dashboard/estimates");
    revalidatePath(`/dashboard/estimates/${estimateId}`);
    revalidatePath("/dashboard/invoices");
    revalidatePath(`/dashboard/invoices/${invoice.id}`);
    revalidatePath(`/i/${invoice.publicId}`);

    return {
      success: true,
      message: "Invoice created from estimate.",
      data: {
        redirectTo: `/dashboard/invoices/${invoice.id}?success=created`,
      },
    };
  } catch (error) {
    if (isLimitError(error, "invoice")) {
      return getInvoiceLimitResult();
    }

    if (error instanceof InvoiceSourceEstimateAlreadyConvertedError) {
      return {
        success: true,
        message: "This estimate is already linked to an invoice.",
        data: {
          redirectTo: `/dashboard/invoices/${error.invoiceId}`,
        },
      };
    }

    if (error instanceof InvoiceSourceEstimateNotConvertibleError) {
      return getEstimateNotConvertibleResult();
    }

    if (
      error instanceof InvoiceSourceEstimateNotFoundError ||
      error instanceof InvoiceNotFoundError
    ) {
      return getEstimateNotFoundResult();
    }

    throw error;
  }
}
