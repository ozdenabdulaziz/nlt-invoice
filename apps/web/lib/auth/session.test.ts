/** @jest-environment node */

import { getCurrentUserContext } from "@/lib/auth/session";

const mockGetServerSession = jest.fn();
const mockRedirect = jest.fn();
const mockUserFindUnique = jest.fn();
const mockMembershipFindFirst = jest.fn();
const mockSubscriptionUpsert = jest.fn();

jest.mock("@/lib/auth/auth-options", () => ({
  authOptions: {},
}));

jest.mock("next-auth", () => ({
  getServerSession: (...args: unknown[]) => mockGetServerSession(...args),
}));

jest.mock("next/navigation", () => ({
  redirect: (...args: unknown[]) => mockRedirect(...args),
}));

jest.mock("@/lib/prisma/client", () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => mockUserFindUnique(...args),
    },
    membership: {
      findFirst: (...args: unknown[]) => mockMembershipFindFirst(...args),
    },
    subscription: {
      upsert: (...args: unknown[]) => mockSubscriptionUpsert(...args),
    },
  },
}));

describe("getCurrentUserContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetServerSession.mockResolvedValue({
      user: {
        id: "user_1",
        activeCompanyId: "company_1",
      },
    });
    mockUserFindUnique.mockResolvedValue({
      id: "user_1",
      email: "owner@nltinvoice.com",
      name: "Owner",
    });
  });

  it("backfills a default subscription when an onboarded company is missing one", async () => {
    mockMembershipFindFirst.mockResolvedValue({
      id: "membership_1",
      userId: "user_1",
      companyId: "company_1",
      role: "OWNER",
      company: {
        id: "company_1",
        onboardingCompleted: true,
        subscription: null,
      },
    });
    mockSubscriptionUpsert.mockResolvedValue({
      id: "subscription_1",
      companyId: "company_1",
      plan: "FREE",
      status: "ACTIVE",
    });

    const context = await getCurrentUserContext();

    expect(mockSubscriptionUpsert).toHaveBeenCalledWith({
      where: {
        companyId: "company_1",
      },
      update: {},
      create: {
        companyId: "company_1",
        plan: "FREE",
        status: "ACTIVE",
      },
    });
    expect(context.subscription?.plan).toBe("FREE");
    expect(context.company?.id).toBe("company_1");
    expect(context.hasCompletedOnboarding).toBe(true);
  });

  it("reuses the existing subscription when the company already has one", async () => {
    mockMembershipFindFirst.mockResolvedValue({
      id: "membership_1",
      userId: "user_1",
      companyId: "company_1",
      role: "OWNER",
      company: {
        id: "company_1",
        onboardingCompleted: true,
        subscription: {
          id: "subscription_1",
          companyId: "company_1",
          plan: "PRO",
          status: "ACTIVE",
        },
      },
    });

    const context = await getCurrentUserContext();

    expect(mockSubscriptionUpsert).not.toHaveBeenCalled();
    expect(context.subscription?.plan).toBe("PRO");
  });
});
