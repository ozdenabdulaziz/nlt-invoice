import Stripe from "stripe";
import { revalidatePath } from "next/cache";

import { fromStripeAmountMinorUnits, getStripe } from "@/lib/stripe/server";
import { recordStripeCheckoutPaymentForInvoice } from "@/features/invoices/server/service";
import { syncStripeSubscription, linkStripeCustomerToCompany } from "@/features/billing/server/service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    console.error("[stripe/webhook] Missing stripe-signature header or STRIPE_WEBHOOK_SECRET.");
    return new Response("Webhook configuration missing.", { status: 400 });
  }

  // --- Signature verification ---
  // Return 400 on failure: tells Stripe the payload is invalid — do NOT retry.
  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    const payload = await request.text();
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[stripe/webhook] Signature verification failed:", message);
    return new Response("Invalid signature.", { status: 400 });
  }

  // --- Event processing ---
  // Return 500 on processing errors: tells Stripe to retry.
  // Do NOT mix signature errors with processing errors — they need different status codes.
  try {
    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded"
    ) {
      const session = event.data.object;

      if (session.payment_status === "paid") {
        const invoiceId = session.metadata?.invoiceId;

        if (!invoiceId) {
          // No invoiceId in metadata — unrecognized session, ignore safely.
          console.warn("[stripe/webhook] Received paid session without invoiceId metadata:", session.id);
          return new Response("ok");
        }

        console.info("[stripe/webhook] Recording payment:", {
          invoiceId,
          sessionId: session.id,
          eventId: event.id,
          eventType: event.type,
        });

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

        console.info("[stripe/webhook] Payment recorded successfully:", {
          invoiceId: invoice.id,
          publicId: invoice.publicId,
          sessionId: session.id,
        });

        revalidatePath("/dashboard");
        revalidatePath("/dashboard/invoices");
        revalidatePath(`/dashboard/invoices/${invoice.id}`);
        revalidatePath(`/i/${invoice.publicId}`);
      }

      if (session.mode === "subscription" && session.client_reference_id && typeof session.customer === "string") {
        await linkStripeCustomerToCompany(session.client_reference_id, session.customer);
      }
    } else if (
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
      await syncStripeSubscription(subscription.id, customerId, subscription.status);
      revalidatePath("/dashboard");
      revalidatePath("/dashboard/settings");
    }

    return new Response("ok");
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[stripe/webhook] Failed to process event:", {
      eventId: event.id,
      eventType: event.type,
      error: message,
    });
    // 500 → Stripe retries the event. Never return 400 for processing failures.
    return new Response("Processing error.", { status: 500 });
  }
}
