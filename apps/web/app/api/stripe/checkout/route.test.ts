/** @jest-environment node */

const mockGetInvoiceByPublicId = jest.fn();
const infoSpy = jest.spyOn(console, "info").mockImplementation(() => undefined);

jest.mock("@/features/invoices/server/service", () => ({
  getInvoiceByPublicId: (...args: unknown[]) => mockGetInvoiceByPublicId(...args),
}));

import { POST } from "@/app/api/stripe/checkout/route";

describe("POST /api/stripe/checkout", () => {
  beforeEach(() => {
    jest.clearAllMocks();

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
  });

  afterAll(() => {
    infoSpy.mockRestore();
  });

  it("returns a disabled message for invoice checkout requests", async () => {
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

    expect(response.status).toBe(409);
    expect(payload).toEqual({
      message:
        "Online invoice payments are disabled. Please contact the sender for bank transfer or e-transfer instructions.",
    });
    expect(infoSpy).toHaveBeenCalled();
  });

  it("returns not found when the invoice does not exist", async () => {
    mockGetInvoiceByPublicId.mockResolvedValue(null);

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

    expect(response.status).toBe(404);
    expect(payload).toEqual({
      message: "Invoice not found.",
    });
  });
});
