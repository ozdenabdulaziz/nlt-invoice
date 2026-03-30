import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth/auth-options";

export async function getRequestCompanyContext() {
  const session = await getServerSession(authOptions);

  if (
    !session?.user?.id ||
    !session.user.activeCompanyId ||
    !session.user.membershipRole ||
    !session.user.hasCompletedOnboarding
  ) {
    return null;
  }

  return {
    userId: session.user.id,
    companyId: session.user.activeCompanyId,
    role: session.user.membershipRole,
    plan: session.user.plan,
  };
}
