/** @jest-environment node */

const mockGetInvoiceForCheckout = jest.fn();
const mockGetStripe = jest.fn();
const errorSpy = jest.spyOn(console, "error").mockImplementation(() => undefined);

jest.mock("@/features/invoices/server/service", () => ({
  getInvoiceForCheckout: (...args: unknown[]) => mockGetInvoiceForCheckout(...args),
  isInvoicePayable: jest.requireActual("@/features/invoices/server/service").isInvoicePayable,
}));

jest.mock("@/lib/stripe/server", () => ({
  getStripe: () => mockGetStripe(),
  toStripeAmountMinorUnits: jest.requireActual("@/lib/stripe/server").toStripeAmountMinorUnits,
}));

import { POST } from "@/app/api/stripe/checkout/route";

function makeInvoice(overrides: Record<string, unknown> = {}) {
  return {
    id: "invoice_1",
    companyId: "company_1",
    publicId: "public_1",
    invoiceNumber: "INV-001",
    status: "SENT",
    balanceDue: { toString: () => "150.00" },
    currency: "CAD",
    customerEmail: "customer@example.com",
    customerName: "Acme Customer",
    companyName: "Acme Co",
    ...overrides,
  };
}

describe("POST /api/stripe/checkout", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetInvoiceForCheckout.mockResolvedValue(makeInvoice());
  });

  afterAll(() => {
    errorSpy.mockRestore();
  });

  it("returns not found when publicId is empty", async () => {
    const request = new Request("https://billing.example.com/api/stripe/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ publicId: "" }),
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.message).toBe("Invoice not found.");
  });

  it("returns not found when the invoice does not exist", async () => {
    mockGetInvoiceForCheckout.mockResolvedValue(null);

    const request = new Request("https://billing.example.com/api/stripe/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ publicId: "nonexistent" }),
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(404);
    expect(payload.message).toBe("Invoice not found.");
  });

  it("returns 409 when the invoice is not payable (VOID)", async () => {
    mockGetInvoiceForCheckout.mockResolvedValue(
      makeInvoice({ status: "VOID" }),
    );

    const request = new Request("https://billing.example.com/api/stripe/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ publicId: "public_1" }),
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(409);
    expect(payload.message).toContain("not eligible");
  });

  it("returns 409 when balance due is zero", async () => {
    mockGetInvoiceForCheckout.mockResolvedValue(
      makeInvoice({
        status: "PAID",
        balanceDue: { toString: () => "0" },
      }),
    );

    const request = new Request("https://billing.example.com/api/stripe/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ publicId: "public_1" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(409);
  });

  it("creates a checkout session and returns the URL", async () => {
    const mockCreate = jest.fn().mockResolvedValue({
      url: "https://checkout.stripe.com/pay/test_session",
    });

    mockGetStripe.mockReturnValue({
      checkout: {
        sessions: {
          create: mockCreate,
        },
      },
    });

    const request = new Request("https://billing.example.com/api/stripe/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ publicId: "public_1" }),
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.url).toBe("https://checkout.stripe.com/pay/test_session");

    expect(mockCreate).toHaveBeenCalledTimes(1);
    const sessionArgs = mockCreate.mock.calls[0][0];
    expect(sessionArgs.mode).toBe("payment");
    expect(sessionArgs.metadata.invoiceId).toBe("invoice_1");
    expect(sessionArgs.customer_email).toBe("customer@example.com");
    expect(sessionArgs.line_items[0].price_data.unit_amount).toBe(15000);
    expect(sessionArgs.line_items[0].price_data.currency).toBe("cad");
  });

  it("returns 500 when stripe throws", async () => {
    mockGetStripe.mockReturnValue({
      checkout: {
        sessions: {
          create: jest.fn().mockRejectedValue(new Error("Stripe error")),
        },
      },
    });

    const request = new Request("https://billing.example.com/api/stripe/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ publicId: "public_1" }),
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload.message).toContain("temporarily unavailable");
  });
});
