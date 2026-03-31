import { NextResponse } from "next/server";

import { getAppUrl } from "@/lib/app-url";
import { getStripe, toStripeAmountMinorUnits } from "@/lib/stripe/server";
import {
  getInvoiceByPublicId,
  isInvoicePayable,
} from "@/features/invoices/server/service";

export const runtime = "nodejs";

function getCheckoutErrorMessage(error: unknown) {
  if (error instanceof Error) {
    if (error.message === "app-url:missing") {
      return "Server app URL is missing for Stripe Checkout.";
    }

    if (error.message === "stripe:missing-secret-key") {
      return "STRIPE_SECRET_KEY is missing on the server.";
    }

    if (error.message === "stripe:invalid-amount") {
      return "Invoice balance is invalid for Stripe Checkout.";
    }

    return error.message;
  }

  return "Unable to start checkout.";
}

function getErrorLogContext(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return {
    value: error,
  };
}

export async function POST(request: Request) {
  let publicId = "";
  let invoice:
    | Awaited<ReturnType<typeof getInvoiceByPublicId>>
    | null = null;

  try {
    const payload = (await request.json()) as {
      publicId?: string;
    };

    publicId = payload.publicId?.trim() ?? "";

    if (!publicId) {
      return NextResponse.json(
        {
          message: "Invoice not found.",
        },
        {
          status: 400,
        },
      );
    }

    invoice = await getInvoiceByPublicId(publicId);

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

    const envStatus = {
      stripeSecretKeyConfigured: Boolean(process.env.STRIPE_SECRET_KEY),
      stripePublishableKeyConfigured: Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY),
      nextPublicAppUrlConfigured: Boolean(process.env.NEXT_PUBLIC_APP_URL),
      authUrlConfigured: Boolean(process.env.AUTH_URL),
    };

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

    const appUrl = getAppUrl(request);
    const stripe = getStripe();
    const unitAmount = toStripeAmountMinorUnits(
      invoice.balanceDue.toString(),
      invoice.currency,
    );

    console.info("[stripe/checkout] creating session", {
      publicId,
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      amount: invoice.balanceDue.toString(),
      amountMinorUnits: unitAmount,
      currency: invoice.currency,
      customerEmailProvided: Boolean(invoice.customerEmail),
      appUrl,
      envStatus,
    });

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
            unit_amount: unitAmount,
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
      console.error("[stripe/checkout] session created without url", {
        publicId,
        invoiceId: invoice.id,
        sessionId: session.id,
      });

      return NextResponse.json(
        {
          message: "Stripe did not return a checkout URL.",
        },
        {
          status: 500,
        },
      );
    }

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error("[stripe/checkout] failed", {
      publicId,
      invoiceId: invoice?.id,
      invoiceNumber: invoice?.invoiceNumber,
      amount: invoice?.balanceDue?.toString(),
      currency: invoice?.currency,
      customerEmailProvided: Boolean(invoice?.customerEmail),
      envStatus: {
        stripeSecretKeyConfigured: Boolean(process.env.STRIPE_SECRET_KEY),
        stripePublishableKeyConfigured: Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY),
        nextPublicAppUrlConfigured: Boolean(process.env.NEXT_PUBLIC_APP_URL),
        authUrlConfigured: Boolean(process.env.AUTH_URL),
      },
      error: getErrorLogContext(error),
    });

    return NextResponse.json(
      {
        message: getCheckoutErrorMessage(error),
      },
      {
        status: 500,
      },
    );
  }
}
