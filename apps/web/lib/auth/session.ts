import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { MembershipRole } from "@prisma/client";

import { authOptions } from "@/lib/auth/auth-options";
import { hasCompletedOnboarding } from "@/lib/auth/company";
import { prisma } from "@/lib/prisma/client";

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

  const company = membership?.company ?? null;
  const subscription = company?.subscription ?? null;
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

export async function requireCompanyContext() {
  const context = await getCurrentUserContext();

  if (!context.hasCompletedOnboarding || !context.company || !context.subscription || !context.membership) {
    redirect("/onboarding");
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
