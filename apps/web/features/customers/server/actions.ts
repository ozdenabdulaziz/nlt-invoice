"use server";

import { revalidatePath } from "next/cache";

import { BillingLimitExceededError } from "@/features/billing/server/service";
import { requireCompanyContext } from "@/lib/auth/session";
import {
  createCustomerForCompany,
  CustomerDeleteBlockedError,
  CustomerNotFoundError,
  deleteCustomerForCompany,
  updateCustomerForCompany,
} from "@/features/customers/server/service";
import { customerSchema } from "@/lib/validations/customer";
import type { ActionResult } from "@/types/actions";

type CustomerActionData = {
  redirectTo: string;
};

function getCustomerNotFoundResult(): ActionResult<CustomerActionData> {
  return {
    success: false,
    message: "Customer not found.",
  };
}

export async function createCustomerAction(
  input: unknown,
): Promise<ActionResult<CustomerActionData>> {
  const context = await requireCompanyContext();
  const parsedInput = customerSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      success: false,
      message: "Please correct the highlighted fields.",
      fieldErrors: parsedInput.error.flatten().fieldErrors,
    };
  }

  try {
    const customer = await createCustomerForCompany(
      {
        companyId: context.company.id,
        plan: context.subscription.plan,
      },
      parsedInput.data,
    );

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/customers");

    return {
      success: true,
      message: "Customer created successfully.",
      data: {
        redirectTo: `/dashboard/customers/${customer.id}?success=created`,
      },
    };
  } catch (error) {
    if (error instanceof BillingLimitExceededError) {
      return {
        success: false,
        message: error.message,
      };
    }

    if (error instanceof CustomerNotFoundError) {
      return getCustomerNotFoundResult();
    }

    throw error;
  }
}

export async function updateCustomerAction(
  customerId: string,
  input: unknown,
): Promise<ActionResult<CustomerActionData>> {
  const context = await requireCompanyContext();
  const parsedInput = customerSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      success: false,
      message: "Please correct the highlighted fields.",
      fieldErrors: parsedInput.error.flatten().fieldErrors,
    };
  }

  try {
    await updateCustomerForCompany(
      customerId,
      context.company.id,
      parsedInput.data,
    );
  } catch (error) {
    if (error instanceof CustomerNotFoundError) {
      return getCustomerNotFoundResult();
    }

    throw error;
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/customers");
  revalidatePath(`/dashboard/customers/${customerId}`);
  revalidatePath(`/dashboard/customers/${customerId}/edit`);

  return {
    success: true,
    message: "Customer updated successfully.",
    data: {
      redirectTo: `/dashboard/customers/${customerId}?success=updated`,
    },
  };
}

export async function deleteCustomerAction(
  customerId: string,
): Promise<ActionResult<CustomerActionData>> {
  const context = await requireCompanyContext();

  try {
    await deleteCustomerForCompany(customerId, context.company.id);
  } catch (error) {
    if (error instanceof CustomerNotFoundError) {
      return getCustomerNotFoundResult();
    }

    if (error instanceof CustomerDeleteBlockedError) {
      return {
        success: false,
        message:
          "This customer cannot be deleted because it already has related invoices or estimates.",
      };
    }

    throw error;
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/customers");
  revalidatePath(`/dashboard/customers/${customerId}`);

  return {
    success: true,
    message: "Customer deleted successfully.",
    data: {
      redirectTo: "/dashboard/customers?success=deleted",
    },
  };
}
