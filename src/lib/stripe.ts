import "server-only";
import Stripe from "stripe";
import { env } from "@/lib/env";

/**
 * Server-side Stripe client. The SDK pins its own API version
 * (2026-09-30.endive for stripe@23), so upgrading the package is how the
 * API version moves.
 */
export const stripe = new Stripe(env.STRIPE_SECRET_KEY);

/**
 * Tags Checkout Sessions from this integration in the Dashboard. Stripe asks
 * for a label ending in 8 random letters; keep it stable so sessions group.
 */
export const CHECKOUT_INTEGRATION_ID = "atelier_bag_checkout_qmvhtrzk";
