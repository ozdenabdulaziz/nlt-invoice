import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { MembershipRole } from "@prisma/client";

import { authOptions } from "@/lib/auth/auth-options";
import { hasCompletedOnboarding } from "@/lib/auth/company";
import { prisma } from "@/lib/prisma/client";
import { ensureCompanySubscription } from "@/server/shared/company-subscription";

type UserContext = Awaited<ReturnType<typeof getCurrentUserContext>>;

export async function getCurrentSession() {
  return getServerSession(authOptions);
}

export async function requireSession() {
  const session = await getCurrentSession();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return session;
}

export async function getCurrentUserContext() {
  const session = await requireSession();

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      image: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  const membership = await prisma.membership.findFirst({
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

  let company = membership?.company ?? null;
  let subscription = company?.subscription ?? null;

  if (company && !subscription) {
    subscription = await ensureCompanySubscription(prisma, company.id);
    company = {
      ...company,
      subscription,
    };
  }

  const onboardingComplete = hasCompletedOnboarding(company);

  return {
    session,
    user,
    membership: membership
      ? {
          ...membership,
          role: membership.role as MembershipRole,
        }
      : null,
    company,
    subscription,
    hasCompletedOnboarding: onboardingComplete,
  };
}

export async function requireOnboarding() {
  const context = await getCurrentUserContext();

  if (context.hasCompletedOnboarding) {
    redirect("/dashboard");
  }

  return context;
}

type RequireCompanyContextOptions = {
  allowUnverified?: boolean;
};

export async function requireCompanyContext(
  options: RequireCompanyContextOptions = {},
) {
  const context = await getCurrentUserContext();

  if (!context.hasCompletedOnboarding || !context.company || !context.subscription || !context.membership) {
    redirect("/onboarding");
  }

  if (!options.allowUnverified && !context.user.emailVerified) {
    redirect("/dashboard/verify-email");
  }

  return {
    ...context,
    company: context.company,
    subscription: context.subscription,
    membership: context.membership,
    hasCompletedOnboarding: true as const,
  } satisfies UserContext & {
    company: NonNullable<UserContext["company"]>;
    subscription: NonNullable<UserContext["subscription"]>;
    membership: NonNullable<UserContext["membership"]>;
    hasCompletedOnboarding: true;
  };
}
