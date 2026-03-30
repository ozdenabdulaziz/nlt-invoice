import { PrismaAdapter } from "@auth/prisma-adapter";
import { MembershipRole, Plan } from "@prisma/client";
import bcrypt from "bcryptjs";
import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";

import { prisma } from "@/lib/prisma/client";
import { loginSchema } from "@/lib/validations/auth";
import { hasCompletedOnboarding } from "@/lib/auth/company";

async function loadAuthClaims(userId: string) {
  const membership = await prisma.membership.findFirst({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "asc",
    },
    select: {
      companyId: true,
      role: true,
      company: {
        select: {
          onboardingCompleted: true,
          subscription: {
            select: {
              plan: true,
            },
          },
        },
      },
    },
  });

  return {
    activeCompanyId: membership?.companyId ?? null,
    membershipRole: membership?.role ?? null,
    plan: membership?.company.subscription?.plan ?? Plan.FREE,
    hasCompletedOnboarding: hasCompletedOnboarding(membership?.company),
  };
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    // TODO: Revisit database sessions once dashboard gating no longer depends on
    // lightweight token claims inside middleware. JWT keeps MVP auth simple and
    // avoids adding synchronous database reads to every protected edge check.
    strategy: "jwt",
  },
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      async authorize(rawCredentials) {
        const parsedCredentials = loginSchema.safeParse(rawCredentials);

        if (!parsedCredentials.success) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: parsedCredentials.data.email,
          },
        });

        if (!user) {
          return null;
        }

        const passwordMatches = await bcrypt.compare(
          parsedCredentials.data.password,
          user.passwordHash,
        );

        if (!passwordMatches) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      const userId = user?.id ?? token.userId;

      if (!userId) {
        return token;
      }

      token.userId = userId;

      if (trigger === "update" && session) {
        if ("activeCompanyId" in session) {
          token.activeCompanyId =
            typeof session.activeCompanyId === "string"
              ? session.activeCompanyId
              : null;
        }

        if ("membershipRole" in session) {
          token.membershipRole =
            (session.membershipRole as MembershipRole | null | undefined) ?? null;
        }

        if ("plan" in session) {
          token.plan = (session.plan as Plan | undefined) ?? token.plan ?? Plan.FREE;
        }

        if ("hasCompletedOnboarding" in session) {
          token.hasCompletedOnboarding = Boolean(session.hasCompletedOnboarding);
        }

        return token;
      }

      const needsClaimRefresh =
        Boolean(user) ||
        token.activeCompanyId === undefined ||
        token.membershipRole === undefined ||
        token.plan === undefined ||
        token.hasCompletedOnboarding === undefined;

      if (!needsClaimRefresh) {
        return token;
      }

      const claims = await loadAuthClaims(userId);

      token.activeCompanyId = claims.activeCompanyId;
      token.membershipRole = claims.membershipRole;
      token.plan = claims.plan;
      token.hasCompletedOnboarding = claims.hasCompletedOnboarding;

      return token;
    },
    async session({ session, token }) {
      if (!session.user || !token.userId) {
        return session;
      }

      session.user.id = token.userId;
      session.user.activeCompanyId = token.activeCompanyId ?? null;
      session.user.membershipRole =
        (token.membershipRole as MembershipRole | null | undefined) ?? null;
      session.user.plan = token.plan ?? Plan.FREE;
      session.user.hasCompletedOnboarding = Boolean(token.hasCompletedOnboarding);
      return session;
    },
  },
};
