import { revalidatePath } from "next/cache";

import { fromStripeAmountMinorUnits, getStripe } from "@/lib/stripe/server";
import { recordStripeCheckoutPaymentForInvoice } from "@/features/invoices/server/service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return new Response("Webhook configuration missing.", { status: 400 });
  }

  try {
    const stripe = getStripe();
    const payload = await request.text();
    const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);

    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded"
    ) {
      const session = event.data.object;

      if (session.payment_status === "paid") {
        const invoiceId = session.metadata?.invoiceId;

        if (invoiceId) {
          const invoice = await recordStripeCheckoutPaymentForInvoice(invoiceId, {
            checkoutSessionId: session.id,
            paymentIntentId:
              typeof session.payment_intent === "string"
                ? session.payment_intent
                : session.payment_intent?.id,
            amountPaid:
              typeof session.amount_total === "number"
                ? fromStripeAmountMinorUnits(
                    session.amount_total,
                    session.currency ?? "cad",
                  )
                : undefined,
          });

          revalidatePath("/dashboard");
          revalidatePath("/dashboard/invoices");
          revalidatePath(`/dashboard/invoices/${invoice.id}`);
          revalidatePath(`/i/${invoice.publicId}`);
        }
      }
    }

    return new Response("ok");
  } catch {
    return new Response("Invalid signature.", { status: 400 });
  }
}
