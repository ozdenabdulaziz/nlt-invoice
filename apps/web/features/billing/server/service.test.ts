/** @jest-environment node */

import { Plan } from "@prisma/client";

import {
  BillingLimitExceededError,
  assertBillingAllowance,
  checkBillingAllowance,
  getBillingUsageSummaryForCompany,
  getCurrentUsagePeriodKey,
} from "@/features/billing/server/service";

describe("billing service", () => {
  it("builds monthly usage keys in UTC", () => {
    const periodKey = getCurrentUsagePeriodKey(
      new Date(Date.UTC(2026, 2, 30, 23, 59, 59)),
    );

    expect(periodKey).toBe("2026-03");
  });

  it("blocks Free plan invoice creation when usage reaches the limit", async () => {
    const db = {
      invoice: {
        count: jest.fn().mockResolvedValue(10),
      },
    } as never;

    const result = await checkBillingAllowance(
      db,
      {
        companyId: "company_1",
        plan: Plan.FREE,
      },
      "invoice",
      new Date(Date.UTC(2026, 2, 30)),
    );

    expect(result.allowed).toBe(false);
    expect(result.limit).toBe(10);
    expect(result.message).toContain("Upgrade to Pro");
  });

  it("throws a typed error when a limited action is denied", async () => {
    const db = {
      customer: {
        count: jest.fn().mockResolvedValue(5),
      },
    } as never;

    await expect(
      assertBillingAllowance(
        db,
        {
          companyId: "company_1",
          plan: Plan.FREE,
        },
        "customer",
      ),
    ).rejects.toBeInstanceOf(BillingLimitExceededError);
  });

  it("builds a usage summary from live company-scoped counts", async () => {
    const db = {
      customer: {
        count: jest.fn().mockResolvedValue(4),
      },
      invoice: {
        count: jest.fn().mockResolvedValue(2),
      },
      estimate: {
        count: jest.fn().mockResolvedValue(1),
      },
    } as never;

    const result = await getBillingUsageSummaryForCompany(
      "company_1",
      Plan.FREE,
      db,
      new Date(Date.UTC(2026, 2, 30)),
    );

    expect(result.usage.find((item) => item.subject === "customer")?.used).toBe(4);
    expect(result.usage.find((item) => item.subject === "invoice")?.used).toBe(2);
    expect(result.usage.find((item) => item.subject === "estimate")?.used).toBe(1);
  });
});
