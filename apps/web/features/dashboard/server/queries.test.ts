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
  it("reads dashboard totals and recent invoices with company scope", async () => {
    const now = new Date();
    const recentInvoice = {
      id: "invoice_1",
      invoiceNumber: "INV-1001",
      dueDate: now,
      status: InvoiceStatus.SENT,
      total: "250.00",
      currency: "CAD",
      customer: {
        name: "Maple Studio",
        companyName: null,
      },
    };

    const db = {
      customer: {
        count: jest.fn().mockResolvedValue(3),
      },
      invoice: {
        count: jest
          .fn()
          .mockResolvedValueOnce(5)
          .mockResolvedValueOnce(3)
          .mockResolvedValueOnce(1),
        aggregate: jest
          .fn()
          .mockResolvedValueOnce({
            _sum: {
              amountPaid: "2450.00",
            },
          })
          .mockResolvedValueOnce({
            _sum: {
              balanceDue: "880.00",
            },
          })
          .mockResolvedValueOnce({
            _sum: {
              balanceDue: "350.00",
            },
          })
          .mockResolvedValueOnce({
            _sum: {
              total: "1300.00",
            },
          }),
        findMany: jest.fn().mockResolvedValue([recentInvoice]),
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
    expect(db.invoice.aggregate).toHaveBeenNthCalledWith(1, {
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
    expect(db.invoice.aggregate).toHaveBeenNthCalledWith(2, {
      _sum: {
        balanceDue: true,
      },
      where: {
        companyId: "company_1",
        status: {
          in: [
            InvoiceStatus.SENT,
            InvoiceStatus.VIEWED,
            InvoiceStatus.PARTIAL,
            InvoiceStatus.OVERDUE,
          ],
        },
      },
    });
    expect(db.invoice.aggregate).toHaveBeenNthCalledWith(3, {
      _sum: {
        balanceDue: true,
      },
      where: {
        companyId: "company_1",
        status: InvoiceStatus.OVERDUE,
      },
    });
    expect(db.invoice.count).toHaveBeenNthCalledWith(2, {
      where: {
        companyId: "company_1",
        status: {
          in: [
            InvoiceStatus.SENT,
            InvoiceStatus.VIEWED,
            InvoiceStatus.PARTIAL,
            InvoiceStatus.OVERDUE,
          ],
        },
      },
    });
    expect(db.invoice.count).toHaveBeenNthCalledWith(3, {
      where: {
        companyId: "company_1",
        status: InvoiceStatus.OVERDUE,
      },
    });
    expect(db.invoice.aggregate).toHaveBeenNthCalledWith(
      4,
      expect.objectContaining({
        _sum: {
          total: true,
        },
        where: expect.objectContaining({
          companyId: "company_1",
          status: {
            in: [
              InvoiceStatus.SENT,
              InvoiceStatus.VIEWED,
              InvoiceStatus.PARTIAL,
              InvoiceStatus.PAID,
              InvoiceStatus.OVERDUE,
            ],
          },
          issueDate: expect.objectContaining({
            gte: expect.any(Date),
          }),
        }),
      }),
    );
    expect(db.invoice.findMany).toHaveBeenCalledWith({
      select: {
        id: true,
        invoiceNumber: true,
        dueDate: true,
        status: true,
        total: true,
        currency: true,
        customer: {
          select: {
            name: true,
            companyName: true,
          },
        },
      },
      where: {
        companyId: "company_1",
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 6,
    });
    expect(result).toEqual({
      customerCount: 3,
      invoiceCount: 5,
      paidRevenue: 2450,
      outstandingAmount: 880,
      outstandingCount: 3,
      overdueAmount: 350,
      overdueCount: 1,
      thisMonthAmount: 1300,
      recentInvoices: [recentInvoice],
    });
  });

  it("falls back to zero revenue when no paid invoices exist", async () => {
    const db = {
      customer: {
        count: jest.fn().mockResolvedValue(0),
      },
      invoice: {
        count: jest.fn().mockResolvedValue(0),
        aggregate: jest
          .fn()
          .mockResolvedValueOnce({
            _sum: {
              amountPaid: null,
            },
          })
          .mockResolvedValueOnce({
            _sum: {
              balanceDue: null,
            },
          })
          .mockResolvedValueOnce({
            _sum: {
              balanceDue: null,
            },
          })
          .mockResolvedValueOnce({
            _sum: {
              total: null,
            },
          }),
        findMany: jest.fn().mockResolvedValue([]),
      },
    };

    const result = await getDashboardMetricsForCompany("company_2", db as never);

    expect(result.paidRevenue).toBe(0);
    expect(result.outstandingAmount).toBe(0);
    expect(result.outstandingCount).toBe(0);
    expect(result.overdueAmount).toBe(0);
    expect(result.thisMonthAmount).toBe(0);
    expect(result.recentInvoices).toEqual([]);
  });
});
