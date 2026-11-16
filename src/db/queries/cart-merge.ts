import "server-only";
import { and, eq, inArray, isNull } from "drizzle-orm";
import { db } from "@/db";
import { cartItems, carts, inventory } from "@/db/schema";
import { MAX_LINE_QUANTITY } from "@/lib/cart";

/*
 * Kept apart from `./cart` because `@/lib/auth` calls it from its sign-in
 * hook, and `./cart` imports `@/lib/auth` for sessions.
 */

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Move a guest cart's lines into the user's cart (creating it if needed),
 * summing quantities and capping them at stock, then delete the guest cart.
 * Ignores ids that aren't a guest cart, so a forged cookie can't pull in
 * another user's cart.
 */
export async function mergeGuestCart(guestCartId: string, userId: string): Promise<void> {
  if (!UUID.test(guestCartId)) return;

  const guest = await db.query.carts.findFirst({
    where: and(eq(carts.id, guestCartId), isNull(carts.userId)),
    with: { items: true },
  });
  if (!guest) return;

  if (guest.items.length === 0) {
    await db.delete(carts).where(eq(carts.id, guest.id));
    return;
  }

  const userCart = await db.query.carts.findFirst({
    where: eq(carts.userId, userId),
    with: { items: true },
  });

  // No cart yet: adopt the guest cart as the user's.
  if (!userCart) {
    await db.update(carts).set({ userId }).where(eq(carts.id, guest.id));
    return;
  }

  const stockRows = await db
    .select({ productId: inventory.productId, quantity: inventory.quantity })
    .from(inventory)
    .where(
      inArray(
        inventory.productId,
        guest.items.map((i) => i.productId),
      ),
    );
  const stock = new Map(stockRows.map((r) => [r.productId, r.quantity]));
  const existing = new Map(userCart.items.map((i) => [i.productId, i.quantity]));

  const upserts = guest.items.flatMap((item) => {
    const quantity = Math.min(
      (existing.get(item.productId) ?? 0) + item.quantity,
      stock.get(item.productId) ?? 0,
      MAX_LINE_QUANTITY,
    );
    if (quantity <= 0) return [];
    return [
      db
        .insert(cartItems)
        .values({ cartId: userCart.id, productId: item.productId, quantity })
        .onConflictDoUpdate({
          target: [cartItems.cartId, cartItems.productId],
          set: { quantity, updatedAt: new Date() },
        }),
    ];
  });

  // neon-http has no interactive transactions; batch() runs these in one.
  await db.batch([db.delete(carts).where(eq(carts.id, guest.id)), ...upserts]);
}
