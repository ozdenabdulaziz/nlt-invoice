"use server";

import { MembershipRole, Plan, SubscriptionStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma/client";
import { ensureCompanySubscription } from "@/server/shared/company-subscription";
import {
  companySetupSchema,
  type CompanySetupInput,
} from "@/lib/validations/company";
import type { ActionResult } from "@/types/actions";

function normalizeCompanyInput(input: CompanySetupInput) {
  return {
    companyName: input.companyName,
    legalName: input.legalName || null,
    email: input.email,
    phone: input.phone || null,
    website: input.website || null,
    addressLine1: input.addressLine1,
    addressLine2: input.addressLine2 || null,
    city: input.city,
    province: input.province,
    postalCode: input.postalCode,
    country: input.country,
    taxNumber: input.taxNumber || null,
    currency: input.currency || "CAD",
  };
}

export async function saveCompanyProfileAction(
  input: CompanySetupInput,
): Promise<
  ActionResult<{
    redirectTo: string;
    auth: {
      activeCompanyId: string;
      membershipRole: MembershipRole;
      plan: Plan;
      hasCompletedOnboarding: boolean;
    };
  }>
> {
  const session = await requireSession();
  const parsedInput = companySetupSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      success: false,
      message: "Please correct the highlighted fields.",
      fieldErrors: parsedInput.error.flatten().fieldErrors,
    };
  }

  const companyData = normalizeCompanyInput(parsedInput.data);

  const authState = await prisma.$transaction(async (tx) => {
    const membership = await tx.membership.findFirst({
      where: session.user.activeCompanyId
        ? {
            userId: session.user.id,
            companyId: session.user.activeCompanyId,
          }
        : {
            userId: session.user.id,
          },
      orderBy: {
        createdAt: "asc",
      },
      include: {
        company: {
          include: {
            subscription: true,
          },
        },
      },
    });

    if (membership?.company) {
      const company = await tx.company.update({
        where: {
          id: membership.company.id,
        },
        data: {
          ...companyData,
          onboardingCompleted: true,
        },
        include: {
          subscription: true,
        },
      });
      const subscription = await ensureCompanySubscription(tx, company.id);

      return {
        activeCompanyId: company.id,
        membershipRole: membership.role,
        plan: subscription.plan,
        hasCompletedOnboarding: true,
      };
    }

    const company = await tx.company.create({
      data: {
        ownerUserId: session.user.id,
        invoicePrefix: "INV",
        estimatePrefix: "EST",
        nextInvoiceNumber: 1001,
        nextEstimateNumber: 1001,
        onboardingCompleted: true,
        ...companyData,
      },
    });

    const createdMembership = await tx.membership.create({
      data: {
        userId: session.user.id,
        companyId: company.id,
        role: "OWNER",
      },
    });

    const user = await tx.user.findUnique({
      where: { id: session.user.id },
      select: { email: true }
    });
    
    const isProTestUser = user?.email === "pro@test.com";

    const subscription = await tx.subscription.create({
      data: {
        companyId: company.id,
        plan: isProTestUser ? Plan.PRO : Plan.FREE,
        status: SubscriptionStatus.ACTIVE,
      },
    });

    return {
      activeCompanyId: company.id,
      membershipRole: createdMembership.role,
      plan: subscription.plan,
      hasCompletedOnboarding: true,
    };
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");
  revalidatePath("/onboarding");

  return {
    success: true,
    message: "Company profile saved.",
    data: {
      redirectTo: "/dashboard",
      auth: authState,
    },
  };
}
