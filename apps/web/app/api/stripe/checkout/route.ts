import { NextResponse } from "next/server";

import { globalRateLimiter, getClientIp } from "@/lib/rate-limit";
import {
  getInvoiceForCheckout,
  isInvoicePayable,
} from "@/features/invoices/server/service";
import { getAppUrl } from "@/lib/app-url";
import { getStripe, toStripeAmountMinorUnits } from "@/lib/stripe/server";

export const runtime = "nodejs";

const CHECKOUT_RATE_LIMIT = 30; // 30 checkout sessions per IP per hour
const CHECKOUT_RATE_WINDOW = 60 * 60 * 1000;

export async function POST(request: Request) {
  const ip = await getClientIp();
  const rateLimitResult = await globalRateLimiter.check({
    id: `checkout_ip_${ip}`,
    limit: CHECKOUT_RATE_LIMIT,
    windowMs: CHECKOUT_RATE_WINDOW,
  });

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { message: "Too many checkout attempts. Please try again later." },
      { status: 429 },
    );
  }

  const payload = (await request.json()) as {
    publicId?: string;
  };
  const publicId = payload.publicId?.trim() ?? "";

  if (!publicId) {
    return NextResponse.json(
      { message: "Invoice not found." },
      { status: 400 },
    );
  }

  const invoice = await getInvoiceForCheckout(publicId);

  if (!invoice) {
    return NextResponse.json(
      { message: "Invoice not found." },
      { status: 404 },
    );
  }

  if (!isInvoicePayable(invoice.status, invoice.balanceDue)) {
    return NextResponse.json(
      {
        message:
          "This invoice is not eligible for online payment. It may have already been paid or voided.",
      },
      { status: 409 },
    );
  }

  const balanceDueNumber = Number(invoice.balanceDue.toString());
  const amountInMinorUnits = toStripeAmountMinorUnits(
    balanceDueNumber,
    invoice.currency,
  );

  const appUrl = getAppUrl(request);
  const returnUrl = `${appUrl}/i/${invoice.publicId}`;

  try {
    const stripe = getStripe();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: invoice.currency.toLowerCase(),
            unit_amount: amountInMinorUnits,
            product_data: {
              name: `Invoice ${invoice.invoiceNumber}`,
              description: invoice.companyName
                ? `Payment to ${invoice.companyName}`
                : undefined,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        publicId: invoice.publicId,
      },
      customer_email: invoice.customerEmail ?? undefined,
      success_url: `${returnUrl}?payment=success`,
      cancel_url: `${returnUrl}?payment=cancelled`,
    });

    if (!session.url) {
      return NextResponse.json(
        { message: "Failed to create checkout session." },
        { status: 500 },
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[stripe/checkout] Failed to create session:", error);

    return NextResponse.json(
      { message: "Payment processing is temporarily unavailable." },
      { status: 500 },
    );
  }
}
