/** @jest-environment node */

const mockGetInvoiceByPublicId = jest.fn();
const mockIsInvoicePayable = jest.fn();
const mockCreateSession = jest.fn();
const mockToStripeAmountMinorUnits = jest.fn();

jest.mock("@/features/invoices/server/service", () => ({
  getInvoiceByPublicId: (...args: unknown[]) => mockGetInvoiceByPublicId(...args),
  isInvoicePayable: (...args: unknown[]) => mockIsInvoicePayable(...args),
}));

jest.mock("@/lib/stripe/server", () => ({
  getStripe: () => ({
    checkout: {
      sessions: {
        create: (...args: unknown[]) => mockCreateSession(...args),
      },
    },
  }),
  toStripeAmountMinorUnits: (...args: unknown[]) => mockToStripeAmountMinorUnits(...args),
}));

import { POST } from "@/app/api/stripe/checkout/route";

describe("POST /api/stripe/checkout", () => {
  let infoSpy: jest.SpiedFunction<typeof console.info>;
  let errorSpy: jest.SpiedFunction<typeof console.error>;

  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.NEXT_PUBLIC_APP_URL;
    delete process.env.AUTH_URL;

    infoSpy = jest.spyOn(console, "info").mockImplementation(() => undefined);
    errorSpy = jest.spyOn(console, "error").mockImplementation(() => undefined);

    mockGetInvoiceByPublicId.mockResolvedValue({
      id: "invoice_1",
      publicId: "public_1",
      invoiceNumber: "INV-001",
      status: "SENT",
      balanceDue: 150,
      currency: "CAD",
      customerEmail: "customer@example.com",
      customerName: "Acme Customer",
      customerCompanyName: "Acme Co",
    });
    mockIsInvoicePayable.mockReturnValue(true);
    mockToStripeAmountMinorUnits.mockReturnValue(15000);
  });

  afterEach(() => {
    infoSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it("creates a checkout session using the current request origin", async () => {
    mockCreateSession.mockResolvedValue({
      id: "cs_test_123",
      url: "https://checkout.stripe.com/c/pay/cs_test_123",
    });

    const request = new Request("https://preview.vercel.app/api/stripe/checkout", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        host: "preview.vercel.app",
        "x-forwarded-host": "billing.example.com",
        "x-forwarded-proto": "https",
      },
      body: JSON.stringify({
        publicId: "public_1",
      }),
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({
      sessionId: "cs_test_123",
      url: "https://checkout.stripe.com/c/pay/cs_test_123",
    });
    expect(mockCreateSession).toHaveBeenCalledWith(
      expect.objectContaining({
        cancel_url: "https://billing.example.com/i/public_1?payment=canceled",
        success_url: "https://billing.example.com/i/public_1?payment=success",
      }),
    );
  });

  it("returns the underlying checkout error message instead of masking it", async () => {
    mockCreateSession.mockRejectedValue(new Error("Invalid API Key provided"));

    const request = new Request("https://billing.example.com/api/stripe/checkout", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        publicId: "public_1",
      }),
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload).toEqual({
      message: "Invalid API Key provided",
    });
    expect(errorSpy).toHaveBeenCalled();
  });
});
