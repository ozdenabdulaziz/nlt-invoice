import { NextResponse } from "next/server";

import { getAppUrl } from "@/lib/app-url";
import { getStripe, toStripeAmountMinorUnits } from "@/lib/stripe/server";
import {
  getInvoiceByPublicId,
  isInvoicePayable,
} from "@/features/invoices/server/service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { publicId } = (await request.json()) as {
      publicId?: string;
    };

    if (!publicId?.trim()) {
      return NextResponse.json(
        {
          message: "Invoice not found.",
        },
        {
          status: 400,
        },
      );
    }

    const invoice = await getInvoiceByPublicId(publicId.trim());

    if (!invoice) {
      return NextResponse.json(
        {
          message: "Invoice not found.",
        },
        {
          status: 404,
        },
      );
    }

    if (!isInvoicePayable(invoice.status, invoice.balanceDue)) {
      return NextResponse.json(
        {
          message: "This invoice is not available for online payment.",
        },
        {
          status: 409,
        },
      );
    }

    const appUrl = getAppUrl();
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: invoice.customerEmail ?? undefined,
      success_url: `${appUrl}/i/${invoice.publicId}?payment=success`,
      cancel_url: `${appUrl}/i/${invoice.publicId}?payment=canceled`,
      metadata: {
        invoiceId: invoice.id,
        invoicePublicId: invoice.publicId,
        invoiceNumber: invoice.invoiceNumber,
      },
      payment_intent_data: {
        metadata: {
          invoiceId: invoice.id,
          invoicePublicId: invoice.publicId,
          invoiceNumber: invoice.invoiceNumber,
        },
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: invoice.currency.toLowerCase(),
            unit_amount: toStripeAmountMinorUnits(
              invoice.balanceDue.toString(),
              invoice.currency,
            ),
            product_data: {
              name: `Invoice ${invoice.invoiceNumber}`,
              description: invoice.customerCompanyName
                ? `${invoice.customerName} · ${invoice.customerCompanyName}`
                : invoice.customerName ?? "Invoice payment",
            },
          },
        },
      ],
    });

    if (!session.url) {
      return NextResponse.json(
        {
          message: "Unable to start checkout.",
        },
        {
          status: 500,
        },
      );
    }

    return NextResponse.json({
      url: session.url,
    });
  } catch (error) {
    const message =
      error instanceof Error &&
      (error.message === "app-url:missing" ||
        error.message === "stripe:missing-secret-key")
        ? "Stripe checkout is not configured yet."
        : "Unable to start checkout.";

    return NextResponse.json(
      {
        message,
      },
      {
        status: 500,
      },
    );
  }
}
