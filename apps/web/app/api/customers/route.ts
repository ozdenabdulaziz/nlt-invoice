import { NextResponse } from "next/server";

import { apiError, apiValidationError } from "@/lib/api";
import { assertPlanLimitAvailable, incrementUsageMetric, isLimitError } from "@/lib/limits";
import { getRequestCompanyContext } from "@/lib/permissions";
import { prisma } from "@/lib/prisma/client";
import { customerSchema, type CustomerInput } from "@/lib/validations/customer";

function normalizeCustomerData(input: CustomerInput) {
  return {
    type: input.type,
    name: input.name,
    companyName: input.companyName || null,
    email: input.email || null,
    phone: input.phone || null,
    billingAddressLine1: input.billingAddressLine1 || null,
    billingAddressLine2: input.billingAddressLine2 || null,
    billingCity: input.billingCity || null,
    billingProvince: input.billingProvince || null,
    billingPostalCode: input.billingPostalCode || null,
    billingCountry: input.billingCountry || "Canada",
    shippingSameAsBilling: input.shippingSameAsBilling ?? true,
    shippingAddressLine1: input.shippingAddressLine1 || null,
    shippingAddressLine2: input.shippingAddressLine2 || null,
    shippingCity: input.shippingCity || null,
    shippingProvince: input.shippingProvince || null,
    shippingPostalCode: input.shippingPostalCode || null,
    shippingCountry: input.shippingCountry || "Canada",
    notes: input.notes || null,
  };
}

export async function GET() {
  const context = await getRequestCompanyContext();

  if (!context) {
    return apiError("Unauthorized.", 401);
  }

  const customers = await prisma.customer.findMany({
    where: {
      companyId: context.companyId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

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
    const customer = await prisma.$transaction(async (tx) => {
      await assertPlanLimitAvailable(tx, context.companyId, context.plan, "customer");

      const createdCustomer = await tx.customer.create({
        data: {
          companyId: context.companyId,
          ...normalizeCustomerData(parsed.data),
        },
      });

      await incrementUsageMetric(tx, context.companyId, "customer");

      return createdCustomer;
    });

    return NextResponse.json({ data: customer }, { status: 201 });
  } catch (error) {
    if (isLimitError(error, "customer")) {
      return apiError("Free plan customer limit reached. Upgrade to Pro to add more customers.", 403);
    }

    throw error;
  }
}
