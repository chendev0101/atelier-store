"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { CartError, changeCartItem } from "@/db/queries/cart";
import { type CartActionResult, MAX_LINE_QUANTITY } from "@/lib/cart";

const slug = z.string().min(1).max(200);
const quantity = z.number().int().min(0).max(MAX_LINE_QUANTITY);

async function run(fn: () => Promise<number>): Promise<CartActionResult> {
  try {
    const count = await fn();
    // Re-render the current page, including the header's cart count.
    refresh();
    return { ok: true, count };
  } catch (e) {
    if (e instanceof CartError) return { ok: false, error: e.message };
    console.error("Cart action failed", e);
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}

export async function addToCart(productSlug: string): Promise<CartActionResult> {
  const parsed = slug.safeParse(productSlug);
  if (!parsed.success) return { ok: false, error: "Unknown product." };
  return run(() => changeCartItem(parsed.data, 1, "add"));
}

export async function updateCartItem(
  productSlug: string,
  newQuantity: number,
): Promise<CartActionResult> {
  const parsed = z.object({ slug, quantity }).safeParse({ slug: productSlug, quantity: newQuantity });
  if (!parsed.success) return { ok: false, error: "Invalid quantity." };
  return run(() => changeCartItem(parsed.data.slug, parsed.data.quantity, "set"));
}
