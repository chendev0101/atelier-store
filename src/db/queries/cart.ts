import "server-only";
import { and, asc, eq, isNull } from "drizzle-orm";
import { cookies, headers } from "next/headers";
import { connection } from "next/server";
import { db } from "@/db";
import { cartItems, carts, products } from "@/db/schema";
import { auth } from "@/lib/auth";
import {
  type Cart,
  CART_COOKIE,
  CART_COOKIE_MAX_AGE,
  type CartLine,
  emptyCart,
  MAX_LINE_QUANTITY,
} from "@/lib/cart";
import { env } from "@/lib/env";

/*
 * Cart reads and writes for the current request. Not cached: every cart
 * belongs to one visitor. Signed-in users' carts are keyed by user id;
 * guests' by the `cart_id` cookie. Writes set that cookie, so they may only
 * run inside Server Actions or Route Handlers.
 */

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function currentOwner() {
  // Session checks read the clock (expiry), and a cart is per request, so
  // keep this out of every prerender, including runtime prefetches where
  // headers() and cookies() already resolve.
  await connection();
  const [session, cookieStore] = await Promise.all([
    auth.api.getSession({ headers: await headers() }),
    cookies(),
  ]);
  const guestId = cookieStore.get(CART_COOKIE)?.value;
  return {
    userId: session?.user.id ?? null,
    guestCartId: guestId && UUID.test(guestId) ? guestId : null,
  };
}

/** The current visitor's cart id, if they have one. */
async function findCartId(): Promise<string | null> {
  const { userId, guestCartId } = await currentOwner();
  if (userId) {
    const row = await db.query.carts.findFirst({
      columns: { id: true },
      where: eq(carts.userId, userId),
    });
    return row?.id ?? null;
  }
  if (!guestCartId) return null;
  const row = await db.query.carts.findFirst({
    columns: { id: true },
    where: and(eq(carts.id, guestCartId), isNull(carts.userId)),
  });
  return row?.id ?? null;
}

/** The current visitor's cart id, creating the cart (and guest cookie) if needed. */
async function ensureCartId(): Promise<string> {
  const existing = await findCartId();
  if (existing) return existing;

  const { userId } = await currentOwner();
  if (userId) {
    // Another request may have created it meanwhile; the unique index decides.
    await db.insert(carts).values({ userId }).onConflictDoNothing();
    const row = await db.query.carts.findFirst({
      columns: { id: true },
      where: eq(carts.userId, userId),
    });
    if (!row) throw new Error("Could not create cart");
    return row.id;
  }

  const [row] = await db.insert(carts).values({}).returning({ id: carts.id });
  (await cookies()).set(CART_COOKIE, row.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    path: "/",
    maxAge: CART_COOKIE_MAX_AGE,
  });
  return row.id;
}

/** The current visitor's cart with product details and totals. */
export async function getCart(): Promise<Cart> {
  const cartId = await findCartId();
  if (!cartId) return emptyCart;

  const rows = await db.query.cartItems.findMany({
    where: eq(cartItems.cartId, cartId),
    with: { product: { with: { inventory: { columns: { quantity: true } } } } },
    orderBy: [asc(cartItems.createdAt)],
  });

  const lines: CartLine[] = rows.map(({ product, quantity }) => ({
    slug: product.slug,
    name: product.name,
    size: product.size,
    image: product.images[0],
    unitPriceCents: product.priceCents,
    quantity,
    available: product.inventory?.quantity ?? 0,
    lineTotalCents: product.priceCents * quantity,
  }));

  return {
    lines,
    count: lines.reduce((n, l) => n + l.quantity, 0),
    subtotalCents: lines.reduce((n, l) => n + l.lineTotalCents, 0),
  };
}

/** Units in the current visitor's cart, for the header. */
export async function getCartCount(): Promise<number> {
  return (await getCart()).count;
}

export class CartError extends Error {}

/**
 * Set a product's quantity in the cart (`mode: "set"`) or add to it
 * (`mode: "add"`). Quantities are capped at stock and MAX_LINE_QUANTITY;
 * zero removes the line. Returns the cart's new unit count.
 */
export async function changeCartItem(
  slug: string,
  quantity: number,
  mode: "add" | "set",
): Promise<number> {
  const product = await db.query.products.findFirst({
    columns: { id: true, name: true },
    where: eq(products.slug, slug),
    with: { inventory: { columns: { quantity: true } } },
  });
  if (!product) throw new CartError("That product is no longer available.");
  const stock = product.inventory?.quantity ?? 0;

  if (mode === "set" && quantity <= 0) {
    const cartId = await findCartId();
    if (cartId) {
      await db
        .delete(cartItems)
        .where(and(eq(cartItems.cartId, cartId), eq(cartItems.productId, product.id)));
    }
    return getCartCount();
  }

  if (stock <= 0) throw new CartError(`${product.name} is sold out.`);

  const cartId = await ensureCartId();
  const current = await db.query.cartItems.findFirst({
    columns: { quantity: true },
    where: and(eq(cartItems.cartId, cartId), eq(cartItems.productId, product.id)),
  });
  const wanted = mode === "add" ? (current?.quantity ?? 0) + quantity : quantity;
  const limit = Math.min(stock, MAX_LINE_QUANTITY);
  if (mode === "add" && (current?.quantity ?? 0) >= limit) {
    throw new CartError(
      stock <= MAX_LINE_QUANTITY
        ? `Only ${stock} left, and they're all in your bag.`
        : `You can add up to ${MAX_LINE_QUANTITY} of this item.`,
    );
  }
  const next = Math.min(wanted, limit);

  await db
    .insert(cartItems)
    .values({ cartId, productId: product.id, quantity: next })
    .onConflictDoUpdate({
      target: [cartItems.cartId, cartItems.productId],
      set: { quantity: next, updatedAt: new Date() },
    });
  return getCartCount();
}
