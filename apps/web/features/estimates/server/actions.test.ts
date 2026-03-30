/** @jest-environment node */

import { convertEstimateToInvoiceAction } from "@/features/estimates/server/actions";
import {
  InvoiceSourceEstimateAlreadyConvertedError,
  InvoiceSourceEstimateNotConvertibleError,
} from "@/features/invoices/server/service";

const mockRequireCompanyContext = jest.fn();
const mockConvertEstimateToInvoiceForCompany = jest.fn();
const mockRevalidatePath = jest.fn();

jest.mock("next/cache", () => ({
  revalidatePath: (...args: unknown[]) => mockRevalidatePath(...args),
}));

jest.mock("@/lib/auth/session", () => ({
  requireCompanyContext: (...args: unknown[]) => mockRequireCompanyContext(...args),
}));

jest.mock("@/features/invoices/server/service", () => {
  class MockInvoiceSourceEstimateAlreadyConvertedError extends Error {
    constructor(
      public readonly invoiceId: string,
      public readonly invoiceNumber: string,
    ) {
      super("invoice:source-estimate-already-converted");
    }
  }

  class MockInvoiceSourceEstimateNotConvertibleError extends Error {
    constructor() {
      super("invoice:source-estimate-not-convertible");
    }
  }

  return {
    convertEstimateToInvoiceForCompany: (...args: unknown[]) =>
      mockConvertEstimateToInvoiceForCompany(...args),
    InvoiceNotFoundError: class InvoiceNotFoundError extends Error {},
    InvoiceSourceEstimateNotFoundError: class InvoiceSourceEstimateNotFoundError extends Error {},
    InvoiceSourceEstimateAlreadyConvertedError:
      MockInvoiceSourceEstimateAlreadyConvertedError,
    InvoiceSourceEstimateNotConvertibleError:
      MockInvoiceSourceEstimateNotConvertibleError,
  };
});

describe("convertEstimateToInvoiceAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireCompanyContext.mockResolvedValue({
      company: { id: "company_1" },
      subscription: { plan: "FREE" },
    });
  });

  it("redirects to the existing invoice when the estimate is already converted", async () => {
    mockConvertEstimateToInvoiceForCompany.mockRejectedValue(
      new InvoiceSourceEstimateAlreadyConvertedError("invoice_1", "INV-1001"),
    );

    const result = await convertEstimateToInvoiceAction("estimate_1");

    expect(result.success).toBe(true);
    expect(result.data?.redirectTo).toBe("/dashboard/invoices/invoice_1");
  });

  it("returns a friendly error when the estimate cannot be converted", async () => {
    mockConvertEstimateToInvoiceForCompany.mockRejectedValue(
      new InvoiceSourceEstimateNotConvertibleError(),
    );

    const result = await convertEstimateToInvoiceAction("estimate_1");

    expect(result.success).toBe(false);
    expect(result.message).toContain("sent, viewed, or accepted");
  });

  it("returns a retry message for concurrent conversion conflicts", async () => {
    mockConvertEstimateToInvoiceForCompany.mockRejectedValue({
      code: "P2034",
    });

    const result = await convertEstimateToInvoiceAction("estimate_1");

    expect(result.success).toBe(false);
    expect(result.message).toContain("Please try again");
  });
});
