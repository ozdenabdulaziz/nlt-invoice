import type { DefaultSession } from "next-auth";
import "next-auth";
import "next-auth/jwt";

type AppPlan = "FREE" | "PRO" | "BUSINESS";
type MembershipRole = "OWNER" | "ADMIN" | "MEMBER";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      activeCompanyId: string | null;
      membershipRole: MembershipRole | null;
      plan: AppPlan;
      hasCompletedOnboarding: boolean;
    } & NonNullable<DefaultSession["user"]>;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    activeCompanyId?: string | null;
    membershipRole?: MembershipRole | null;
    plan?: AppPlan;
    hasCompletedOnboarding?: boolean;
  }
}
