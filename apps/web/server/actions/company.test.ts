/** @jest-environment node */

import { saveCompanyProfileAction } from "@/server/actions/company";

const mockRequireSession = jest.fn();
const mockRevalidatePath = jest.fn();
const mockTransaction = jest.fn();
const mockMembershipFindFirst = jest.fn();
const mockCompanyUpdate = jest.fn();
const mockSubscriptionUpsert = jest.fn();

jest.mock("next/cache", () => ({
  revalidatePath: (...args: unknown[]) => mockRevalidatePath(...args),
}));

jest.mock("@/lib/auth/session", () => ({
  requireSession: (...args: unknown[]) => mockRequireSession(...args),
}));

jest.mock("@/lib/prisma/client", () => ({
  prisma: {
    $transaction: (...args: unknown[]) => mockTransaction(...args),
  },
}));

describe("saveCompanyProfileAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireSession.mockResolvedValue({
      user: {
        id: "user_1",
        activeCompanyId: "company_1",
      },
    });
    mockTransaction.mockImplementation(async (callback: (tx: unknown) => Promise<unknown>) =>
      callback({
        membership: {
          findFirst: (...args: unknown[]) => mockMembershipFindFirst(...args),
          create: jest.fn(),
        },
        company: {
          update: (...args: unknown[]) => mockCompanyUpdate(...args),
          create: jest.fn(),
        },
        subscription: {
          upsert: (...args: unknown[]) => mockSubscriptionUpsert(...args),
          create: jest.fn(),
        },
      }),
    );
  });

  it("backfills a free subscription for existing companies that are missing one", async () => {
    mockMembershipFindFirst.mockResolvedValue({
      role: "OWNER",
      company: {
        id: "company_1",
        subscription: null,
      },
    });
    mockCompanyUpdate.mockResolvedValue({
      id: "company_1",
      subscription: null,
    });
    mockSubscriptionUpsert.mockResolvedValue({
      id: "subscription_1",
      companyId: "company_1",
      plan: "FREE",
      status: "ACTIVE",
    });

    const result = await saveCompanyProfileAction({
      companyName: "NLT Invoice",
      legalName: "",
      email: "billing@nltinvoice.com",
      phone: "",
      website: "",
      addressLine1: "123 Front Street West",
      addressLine2: "",
      city: "Toronto",
      province: "Ontario",
      postalCode: "M5J 2N8",
      country: "Canada",
      taxNumber: "",
      currency: "CAD",
    });

    expect(result.success).toBe(true);
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
    expect(result.data?.auth.plan).toBe("FREE");
  });
});
