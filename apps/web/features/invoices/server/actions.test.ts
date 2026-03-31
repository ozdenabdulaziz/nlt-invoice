/** @jest-environment node */

import { recordInvoicePaymentAction } from "@/features/invoices/server/actions";
import { InvoiceNotFoundError, InvoicePaymentNotAllowedError } from "@/features/invoices/server/service";

const mockRequireCompanyContext = jest.fn();
const mockMarkInvoiceAsPaidForCompany = jest.fn();
const mockRevalidatePath = jest.fn();

jest.mock("next/cache", () => ({
  revalidatePath: (...args: unknown[]) => mockRevalidatePath(...args),
}));

jest.mock("@/lib/auth/session", () => ({
  requireCompanyContext: (...args: unknown[]) => mockRequireCompanyContext(...args),
}));

jest.mock("@/features/invoices/server/service", () => {
  class MockInvoiceNotFoundError extends Error {
    constructor() {
      super("invoice:not-found");
    }
  }

  class MockInvoicePaymentNotAllowedError extends Error {
    constructor(message: string) {
      super(message);
    }
  }

  return {
    createInvoiceForCompany: jest.fn(),
    updateInvoiceForCompany: jest.fn(),
    markInvoiceAsPaidForCompany: (...args: unknown[]) => mockMarkInvoiceAsPaidForCompany(...args),
    InvoiceCustomerNotFoundError: class InvoiceCustomerNotFoundError extends Error {},
    InvoiceNotFoundError: MockInvoiceNotFoundError,
    InvoicePaymentNotAllowedError: MockInvoicePaymentNotAllowedError,
  };
});

describe("recordInvoicePaymentAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireCompanyContext.mockResolvedValue({
      company: { id: "company_1" },
      subscription: { plan: "FREE" },
    });
  });

  it("marks an invoice as paid and revalidates dashboard views", async () => {
    mockMarkInvoiceAsPaidForCompany.mockResolvedValue({
      id: "invoice_1",
      publicId: "public_1",
    });

    const result = await recordInvoicePaymentAction("invoice_1", {
      paymentMethod: "Bank transfer",
      paymentNote: "Paid in full",
    });

    expect(result.success).toBe(true);
    expect(result.data?.redirectTo).toBe("/dashboard/invoices/invoice_1?success=paid");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard/invoices");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard/invoices/invoice_1");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/i/public_1");
  });

  it("returns a friendly error when the invoice cannot be found", async () => {
    mockMarkInvoiceAsPaidForCompany.mockRejectedValue(new InvoiceNotFoundError());

    const result = await recordInvoicePaymentAction("invoice_missing", {});

    expect(result.success).toBe(false);
    expect(result.message).toBe("Invoice not found.");
  });

  it("returns a friendly error when payment cannot be recorded", async () => {
    mockMarkInvoiceAsPaidForCompany.mockRejectedValue(
      new InvoicePaymentNotAllowedError("Void invoices cannot be marked as paid."),
    );

    const result = await recordInvoicePaymentAction("invoice_1", {});

    expect(result.success).toBe(false);
    expect(result.message).toBe("Void invoices cannot be marked as paid.");
  });
});
