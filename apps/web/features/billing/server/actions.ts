"use server";

import { requireCompanyContext } from "@/lib/auth/session";
import { type ActionResult } from "@/types/actions";
import { getStripe } from "@/lib/stripe/server";
import { getAppUrl } from "@/lib/app-url";
import { redirect } from "next/navigation";

export async function createStripeCheckoutSessionAction(
  priceLookupKey: string = "pro_monthly",
): Promise<ActionResult<{ checkoutUrl: string }>> {
  const context = await requireCompanyContext();
  const stripe = getStripe();
  
  let checkoutUrl: string;

  try {
    const prices = await stripe.prices.list({
      lookup_keys: [priceLookupKey],
      expand: ["data.product"],
    });

    if (!prices.data.length) {
      throw new Error(`stripe:price-not-found`);
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: prices.data[0].id,
          quantity: 1,
        },
      ],
      mode: "subscription",
      customer_email: context.company.email || context.user.email,
      client_reference_id: context.company.id,
      success_url: `${getAppUrl()}/dashboard/settings?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${getAppUrl()}/dashboard/settings?canceled=true`,
    });

    if (!session.url) {
      throw new Error("Failed to create Stripe checkout session URL.");
    }
    
    checkoutUrl = session.url;
  } catch (err: any) {
    return {
      success: false,
      message: err.message || "Failed to create checkout session",
    };
  }
  
  redirect(checkoutUrl);
}

