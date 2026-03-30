import { NextResponse } from "next/server";

import { apiError, apiValidationError } from "@/lib/api";
import { getRequestCompanyContext } from "@/lib/permissions";
import {
  CustomerDeleteBlockedError,
  CustomerNotFoundError,
  deleteCustomerForCompany,
  getCustomerByIdForCompany,
  mergeCustomerInput,
  updateCustomerForCompany,
} from "@/features/customers/server/service";
import { customerSchema, customerUpdateSchema } from "@/lib/validations/customer";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const context = await getRequestCompanyContext();

  if (!context) {
    return apiError("Unauthorized.", 401);
  }

  const { id } = await params;
  const customer = await getCustomerByIdForCompany(id, context.companyId);

  if (!customer) {
    return apiError("Customer not found.", 404);
  }

  return NextResponse.json({ data: customer });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const context = await getRequestCompanyContext();

  if (!context) {
    return apiError("Unauthorized.", 401);
  }

  const { id } = await params;
  const payload = await request.json().catch(() => null);
  const parsed = customerUpdateSchema.safeParse(payload);

  if (!parsed.success) {
    return apiValidationError(parsed.error);
  }

  const existingCustomer = await getCustomerByIdForCompany(id, context.companyId);

  if (!existingCustomer) {
    return apiError("Customer not found.", 404);
  }

  const fullCustomerInput = customerSchema.safeParse(
    mergeCustomerInput(existingCustomer, parsed.data),
  );

  if (!fullCustomerInput.success) {
    return apiValidationError(fullCustomerInput.error);
  }

  try {
    const customer = await updateCustomerForCompany(
      id,
      context.companyId,
      fullCustomerInput.data,
    );

    return NextResponse.json({ data: customer });
  } catch (error) {
    if (error instanceof CustomerNotFoundError) {
      return apiError("Customer not found.", 404);
    }

    throw error;
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const context = await getRequestCompanyContext();

  if (!context) {
    return apiError("Unauthorized.", 401);
  }

  const { id } = await params;

  try {
    await deleteCustomerForCompany(id, context.companyId);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof CustomerNotFoundError) {
      return apiError("Customer not found.", 404);
    }

    if (error instanceof CustomerDeleteBlockedError) {
      return apiError(
        "This customer cannot be deleted because it already has related invoices or estimates.",
        409,
      );
    }

    throw error;
  }
}
