import type { ImageAsset } from "@/lib/catalog";

/*
 * Cart domain types and constants. Safe to import anywhere; reads and writes
 * live in `@/db/queries/cart`.
 */

/** httpOnly cookie holding a guest cart's id. */
export const CART_COOKIE = "cart_id";
export const CART_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

/** Orders at or above this subtotal ship free (matches the copy on product pages). */
export const FREE_SHIPPING_THRESHOLD_CENTS = 7500;

/** Most of one product a single cart may hold, regardless of stock. */
export const MAX_LINE_QUANTITY = 10;

export type CartLine = {
  slug: string;
  name: string;
  size: string;
  image?: ImageAsset;
  unitPriceCents: number;
  quantity: number;
  /** Units in stock right now; a line may exceed it if stock dropped after adding. */
  available: number;
  lineTotalCents: number;
};

export type Cart = {
  /** Null until the visitor adds something. */
  id: string | null;
  lines: CartLine[];
  /** Total units across lines. */
  count: number;
  subtotalCents: number;
};

export const emptyCart: Cart = { id: null, lines: [], count: 0, subtotalCents: 0 };

/** Countries Stripe Checkout will ship to. ISO 3166-1 alpha-2. */
export const SHIPPING_COUNTRIES = ["US", "TW"] as const;

/** Offered at checkout; standard is free at FREE_SHIPPING_THRESHOLD_CENTS. */
export const SHIPPING_METHODS = {
  standard: { name: "Standard", amountCents: 800, businessDays: [5, 8] },
  express: { name: "Express", amountCents: 2000, businessDays: [1, 3] },
} as const;

export type CartActionResult = { ok: true; count: number } | { ok: false; error: string };
