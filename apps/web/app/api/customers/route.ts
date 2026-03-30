import { NextResponse } from "next/server";

import { apiError, apiValidationError } from "@/lib/api";
import { isLimitError } from "@/lib/limits";
import { getRequestCompanyContext } from "@/lib/permissions";
import { customerSchema } from "@/lib/validations/customer";
import {
  createCustomerForCompany,
  listCustomerRecordsForCompany,
} from "@/features/customers/server/service";

export async function GET() {
  const context = await getRequestCompanyContext();

  if (!context) {
    return apiError("Unauthorized.", 401);
  }

  const customers = await listCustomerRecordsForCompany(context.companyId);

  return NextResponse.json({ data: customers });
}

export async function POST(request: Request) {
  const context = await getRequestCompanyContext();

  if (!context) {
    return apiError("Unauthorized.", 401);
  }

  const payload = await request.json().catch(() => null);
  const parsed = customerSchema.safeParse(payload);

  if (!parsed.success) {
    return apiValidationError(parsed.error);
  }

  try {
    const customer = await createCustomerForCompany(
      {
        companyId: context.companyId,
        plan: context.plan,
      },
      parsed.data,
    );

    return NextResponse.json({ data: customer }, { status: 201 });
  } catch (error) {
    if (isLimitError(error, "customer")) {
      return apiError("Free plan customer limit reached. Upgrade to Pro to add more customers.", 403);
    }

    throw error;
  }
}
