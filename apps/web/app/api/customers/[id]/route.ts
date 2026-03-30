import { NextResponse } from "next/server";

import { apiError, apiValidationError } from "@/lib/api";
import { decrementCustomerMetric } from "@/lib/limits";
import { getRequestCompanyContext } from "@/lib/permissions";
import { prisma } from "@/lib/prisma/client";
import { customerUpdateSchema } from "@/lib/validations/customer";

function normalizeCustomerPatch(input: Record<string, unknown>) {
  const updates: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(input)) {
    if (typeof value === "string") {
      updates[key] = value || null;
      continue;
    }

    updates[key] = value;
  }

  if (updates.billingCountry === null) {
    updates.billingCountry = "Canada";
  }

  if (updates.shippingCountry === null) {
    updates.shippingCountry = "Canada";
  }

  return updates;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const context = await getRequestCompanyContext();

  if (!context) {
    return apiError("Unauthorized.", 401);
  }

  const { id } = await params;

  const customer = await prisma.customer.findFirst({
    where: {
      id,
      companyId: context.companyId,
    },
  });

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

  const existingCustomer = await prisma.customer.findFirst({
    where: {
      id,
      companyId: context.companyId,
    },
    select: {
      id: true,
    },
  });

  if (!existingCustomer) {
    return apiError("Customer not found.", 404);
  }

  const customer = await prisma.customer.update({
    where: {
      id,
    },
    data: normalizeCustomerPatch(parsed.data),
  });

  return NextResponse.json({ data: customer });
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

  const existingCustomer = await prisma.customer.findFirst({
    where: {
      id,
      companyId: context.companyId,
    },
    select: {
      id: true,
    },
  });

  if (!existingCustomer) {
    return apiError("Customer not found.", 404);
  }

  await prisma.$transaction(async (tx) => {
    await tx.customer.delete({
      where: {
        id,
      },
    });

    await decrementCustomerMetric(tx, context.companyId);
  });

  return NextResponse.json({ success: true });
}
