/** @jest-environment node */

import { requireCompanyContext } from "@/lib/auth/session";

const mockRedirect = jest.fn((url: string) => {
  throw new Error(`REDIRECT:${url}`);
});
const mockGetServerSession = jest.fn();
const mockUserFindUnique = jest.fn();
const mockMembershipFindFirst = jest.fn();
const mockEnsureCompanySubscription = jest.fn();

jest.mock("next/navigation", () => ({
  redirect: (url: string) => mockRedirect(url),
}));

jest.mock("next-auth", () => ({
  getServerSession: (...args: unknown[]) => mockGetServerSession(...args),
}));

jest.mock("@/lib/prisma/client", () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => mockUserFindUnique(...args),
    },
    membership: {
      findFirst: (...args: unknown[]) => mockMembershipFindFirst(...args),
    },
  },
}));

jest.mock("@/server/shared/company-subscription", () => ({
  ensureCompanySubscription: (...args: unknown[]) =>
    mockEnsureCompanySubscription(...args),
}));

describe("requireCompanyContext email verification guard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetServerSession.mockResolvedValue({
      user: {
        id: "user_1",
        activeCompanyId: "company_1",
      },
    });
    mockMembershipFindFirst.mockResolvedValue({
      id: "membership_1",
      role: "OWNER",
      company: {
        id: "company_1",
        companyName: "NLT Invoice",
        onboardingCompleted: true,
        subscription: {
          id: "sub_1",
          plan: "FREE",
          status: "ACTIVE",
        },
      },
    });
    mockEnsureCompanySubscription.mockResolvedValue({
      id: "sub_fallback",
      plan: "FREE",
      status: "ACTIVE",
    });
  });

  it("redirects unverified users to /dashboard/verify-email by default", async () => {
    mockUserFindUnique.mockResolvedValue({
      id: "user_1",
      name: "Owner",
      email: "owner@nltinvoice.com",
      emailVerified: null,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(requireCompanyContext()).rejects.toThrow(
      "REDIRECT:/dashboard/verify-email",
    );
  });

  it("allows unverified users when allowUnverified=true", async () => {
    mockUserFindUnique.mockResolvedValue({
      id: "user_1",
      name: "Owner",
      email: "owner@nltinvoice.com",
      emailVerified: null,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const context = await requireCompanyContext({ allowUnverified: true });

    expect(context.user.emailVerified).toBeNull();
    expect(context.company.id).toBe("company_1");
  });

  it("backfills a company subscription when it is missing", async () => {
    mockUserFindUnique.mockResolvedValue({
      id: "user_1",
      name: "Owner",
      email: "owner@nltinvoice.com",
      emailVerified: new Date(),
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    mockMembershipFindFirst.mockResolvedValue({
      id: "membership_1",
      role: "OWNER",
      company: {
        id: "company_1",
        companyName: "NLT Invoice",
        onboardingCompleted: true,
        subscription: null,
      },
    });

    const context = await requireCompanyContext();

    expect(mockEnsureCompanySubscription).toHaveBeenCalledWith(
      expect.anything(),
      "company_1",
    );
    expect(context.subscription.id).toBe("sub_fallback");
  });

  it("reuses existing company subscription when available", async () => {
    mockUserFindUnique.mockResolvedValue({
      id: "user_1",
      name: "Owner",
      email: "owner@nltinvoice.com",
      emailVerified: new Date(),
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    mockMembershipFindFirst.mockResolvedValue({
      id: "membership_1",
      role: "OWNER",
      company: {
        id: "company_1",
        companyName: "NLT Invoice",
        onboardingCompleted: true,
        subscription: {
          id: "sub_existing",
          plan: "PRO",
          status: "ACTIVE",
        },
      },
    });

    const context = await requireCompanyContext();

    expect(mockEnsureCompanySubscription).not.toHaveBeenCalled();
    expect(context.subscription.plan).toBe("PRO");
  });
});
