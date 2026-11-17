"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type Stripe from "stripe";
import { getCart } from "@/db/queries/cart";
import { auth } from "@/lib/auth";
import {
  FREE_SHIPPING_THRESHOLD_CENTS,
  SHIPPING_COUNTRIES,
  SHIPPING_METHODS,
} from "@/lib/cart";
import { env } from "@/lib/env";
import { CHECKOUT_INTEGRATION_ID, stripe } from "@/lib/stripe";

export type CheckoutState = { error: string } | null;

function shippingOptions(subtotalCents: number): Stripe.Checkout.SessionCreateParams.ShippingOption[] {
  const freeStandard = subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS;
  return Object.values(SHIPPING_METHODS).map((m) => ({
    shipping_rate_data: {
      type: "fixed_amount",
      display_name: m === SHIPPING_METHODS.standard && freeStandard ? `${m.name} (free)` : m.name,
      fixed_amount: {
        amount: m === SHIPPING_METHODS.standard && freeStandard ? 0 : m.amountCents,
        currency: "usd",
      },
      delivery_estimate: {
        minimum: { unit: "business_day", value: m.businessDays[0] },
        maximum: { unit: "business_day", value: m.businessDays[1] },
      },
    },
  }));
}

/**
 * Create a Stripe Checkout Session from the visitor's cart and redirect to
 * it. Prices come from the database, never the browser. Orders are created
 * by the webhook, not here and not on the success page.
 */
export async function startCheckout(): Promise<CheckoutState> {
  const [cart, session] = await Promise.all([
    getCart(),
    auth.api.getSession({ headers: await headers() }),
  ]);

  if (!cart.id || cart.lines.length === 0) return { error: "Your bag is empty." };
  const short = cart.lines.find((l) => l.quantity > l.available);
  if (short) {
    return {
      error:
        short.available === 0
          ? `${short.name} has sold out. Remove it to continue.`
          : `Only ${short.available} of ${short.name} left. Lower the quantity to continue.`,
    };
  }

  let url: string | null;
  try {
    const checkout = await stripe.checkout.sessions.create({
      mode: "payment",
      // No payment_method_types: Stripe picks eligible methods dynamically.
      line_items: cart.lines.map((line) => ({
        quantity: line.quantity,
        price_data: {
          currency: "usd",
          unit_amount: line.unitPriceCents,
          product_data: {
            name: line.name,
            description: line.size,
            images: line.image ? [line.image.src] : undefined,
            metadata: { slug: line.slug },
          },
        },
      })),
      shipping_address_collection: { allowed_countries: [...SHIPPING_COUNTRIES] },
      shipping_options: shippingOptions(cart.subtotalCents),
      customer_email: session?.user.email,
      client_reference_id: cart.id,
      metadata: { cartId: cart.id, userId: session?.user.id ?? "" },
      success_url: `${env.BETTER_AUTH_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.BETTER_AUTH_URL}/cart`,
      integration_identifier: CHECKOUT_INTEGRATION_ID,
    });
    url = checkout.url;
  } catch (e) {
    console.error("Stripe checkout session failed", e);
    return { error: "We couldn't start checkout. Please try again in a moment." };
  }

  if (!url) return { error: "We couldn't start checkout. Please try again in a moment." };
  // Outside the try: redirect() works by throwing.
  redirect(url);
}
