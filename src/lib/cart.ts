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
  lines: CartLine[];
  /** Total units across lines. */
  count: number;
  subtotalCents: number;
};

export const emptyCart: Cart = { lines: [], count: 0, subtotalCents: 0 };

export type CartActionResult = { ok: true; count: number } | { ok: false; error: string };
