import { revalidateTag } from "next/cache";
import type Stripe from "stripe";
import { failCheckout, fulfillCheckout } from "@/db/queries/orders";
import { env } from "@/lib/env";
import { stripe } from "@/lib/stripe";

/*
 * Stripe webhook. Subscribe to checkout.session.completed,
 * checkout.session.async_payment_succeeded and
 * checkout.session.async_payment_failed. A non-2xx response makes Stripe
 * retry, which the fulfillment code tolerates.
 */
export async function POST(request: Request) {
  const secret = env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set; rejecting webhook");
    return new Response("Webhook not configured", { status: 500 });
  }

  // The signature covers the raw body, so read it as text before parsing.
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) return new Response("Missing signature", { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        // Re-fetch rather than trust the event body: events can arrive out
        // of order, and this returns the session's current state.
        const session = await stripe.checkout.sessions.retrieve(event.data.object.id, {
          expand: ["shipping_cost.shipping_rate"],
        });
        if (await fulfillCheckout(session)) revalidateTag("catalog", { expire: 0 });
        break;
      }
      case "checkout.session.async_payment_failed": {
        const session = await stripe.checkout.sessions.retrieve(event.data.object.id);
        await failCheckout(session);
        break;
      }
    }
  } catch (error) {
    console.error(`Stripe webhook ${event.type} (${event.id}) failed`, error);
    return new Response("Fulfillment failed", { status: 500 });
  }

  return new Response(null, { status: 200 });
}
