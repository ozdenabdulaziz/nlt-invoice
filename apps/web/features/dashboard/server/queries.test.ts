/** @jest-environment node */

import { InvoiceStatus } from "@prisma/client";

jest.mock("@/lib/auth/session", () => ({
  requireCompanyContext: jest.fn(),
}));

jest.mock("@/lib/prisma/client", () => ({
  prisma: {},
}));

let getDashboardMetricsForCompany: typeof import("@/features/dashboard/server/queries").getDashboardMetricsForCompany;

beforeAll(async () => {
  ({ getDashboardMetricsForCompany } = await import("@/features/dashboard/server/queries"));
});

describe("getDashboardMetricsForCompany", () => {
  it("reads customer count, invoice count, and paid revenue with company scope", async () => {
    const db = {
      customer: {
        count: jest.fn().mockResolvedValue(3),
      },
      invoice: {
        count: jest.fn().mockResolvedValue(5),
        aggregate: jest.fn().mockResolvedValue({
          _sum: {
            amountPaid: "2450.00",
          },
        }),
      },
    };

    const result = await getDashboardMetricsForCompany("company_1", db as never);

    expect(db.customer.count).toHaveBeenCalledWith({
      where: {
        companyId: "company_1",
      },
    });
    expect(db.invoice.count).toHaveBeenCalledWith({
      where: {
        companyId: "company_1",
      },
    });
    expect(db.invoice.aggregate).toHaveBeenCalledWith({
      _sum: {
        amountPaid: true,
      },
      where: {
        companyId: "company_1",
        status: {
          in: [InvoiceStatus.PAID, InvoiceStatus.PARTIAL],
        },
      },
    });
    expect(result).toEqual({
      customerCount: 3,
      invoiceCount: 5,
      paidRevenue: 2450,
    });
  });

  it("falls back to zero revenue when no paid invoices exist", async () => {
    const db = {
      customer: {
        count: jest.fn().mockResolvedValue(0),
      },
      invoice: {
        count: jest.fn().mockResolvedValue(0),
        aggregate: jest.fn().mockResolvedValue({
          _sum: {
            amountPaid: null,
          },
        }),
      },
    };

    const result = await getDashboardMetricsForCompany("company_2", db as never);

    expect(result.paidRevenue).toBe(0);
  });
});
