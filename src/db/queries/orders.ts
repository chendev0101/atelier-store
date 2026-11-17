import "server-only";
import { and, desc, eq, inArray, lte, sql } from "drizzle-orm";
import type Stripe from "stripe";
import { db } from "@/db";
import {
  cartItems,
  type OrderStatus,
  orderItems,
  orders,
  products,
  type ShippingAddress,
} from "@/db/schema";
import { stripe } from "@/lib/stripe";

/*
 * Order fulfillment for Stripe Checkout. Everything here is idempotent:
 * Stripe retries webhooks and may deliver events more than once or out of
 * order, so each step checks what has already happened.
 */

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Cart edits this long after checkout started are kept when the cart is cleared. */
const CLOCK_SLACK_MS = 60_000;

export type CheckoutLine = {
  slug: string;
  name: string;
  size: string;
  unitPriceCents: number;
  quantity: number;
  lineTotalCents: number;
};

/** A Checkout Session's line items, mapped back to catalogue slugs. */
export async function getCheckoutLines(sessionId: string): Promise<CheckoutLine[]> {
  const items = await stripe.checkout.sessions.listLineItems(sessionId, {
    limit: 100,
    expand: ["data.price.product"],
  });
  return items.data.map((item) => {
    const product = item.price?.product;
    const details = product && typeof product === "object" && !product.deleted ? product : null;
    const quantity = item.quantity ?? 1;
    return {
      slug: details?.metadata.slug ?? "",
      name: details?.name ?? item.description ?? "Item",
      size: details?.description ?? "",
      unitPriceCents: item.price?.unit_amount ?? Math.round(item.amount_subtotal / quantity),
      quantity,
      lineTotalCents: item.amount_subtotal,
    };
  });
}

function shippingAddress(session: Stripe.Checkout.Session): ShippingAddress | null {
  const address = session.collected_information?.shipping_details?.address;
  if (!address?.line1 || !address.city || !address.postal_code || !address.country) return null;
  return {
    line1: address.line1,
    line2: address.line2 || null,
    city: address.city,
    state: address.state || null,
    postalCode: address.postal_code,
    country: address.country,
  };
}

async function findOrder(sessionId: string) {
  return db.query.orders.findFirst({
    columns: { id: true, status: true },
    where: eq(orders.stripeCheckoutSessionId, sessionId),
  });
}

/** Create the order for a completed session, or return the existing one. */
async function ensureOrder(session: Stripe.Checkout.Session, status: OrderStatus) {
  const existing = await findOrder(session.id);
  if (existing) return existing;

  const lines = await getCheckoutLines(session.id);
  const slugs = lines.map((l) => l.slug).filter(Boolean);
  const productRows = slugs.length
    ? await db.query.products.findMany({
        columns: { id: true, slug: true },
        where: inArray(products.slug, slugs),
      })
    : [];
  const productIds = new Map(productRows.map((p) => [p.slug, p.id]));

  const shippingRate = session.shipping_cost?.shipping_rate;
  const shippingMethod =
    shippingRate && typeof shippingRate === "object"
      ? shippingRate.display_name
      : shippingRate
        ? (await stripe.shippingRates.retrieve(shippingRate)).display_name
        : null;
  const userId = session.metadata?.userId || null;
  const id = crypto.randomUUID();

  try {
    // neon-http has no interactive transactions; batch() runs atomically.
    await db.batch([
      db.insert(orders).values({
        id,
        stripeCheckoutSessionId: session.id,
        stripePaymentIntentId:
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : (session.payment_intent?.id ?? null),
        userId,
        email: session.customer_details?.email ?? "",
        status,
        currency: session.currency ?? "usd",
        subtotalCents: session.amount_subtotal ?? 0,
        shippingCents: session.shipping_cost?.amount_total ?? 0,
        totalCents: session.amount_total ?? 0,
        shippingMethod,
        shippingName: session.collected_information?.shipping_details?.name ?? null,
        shippingAddress: shippingAddress(session),
        paidAt: status === "paid" ? new Date() : null,
      }),
      db.insert(orderItems).values(
        lines.map((l) => ({
          orderId: id,
          productId: productIds.get(l.slug) ?? null,
          productSlug: l.slug,
          productName: l.name,
          productSize: l.size,
          unitPriceCents: l.unitPriceCents,
          quantity: l.quantity,
        })),
      ),
    ]);
    return { id, status };
  } catch (error) {
    // A concurrent delivery of the same event may have won the unique key.
    const winner = await findOrder(session.id);
    if (winner) return winner;
    throw error;
  }
}

/**
 * Mark the order paid and take its stock, at most once. A single statement,
 * so a concurrent retry blocks on the order row and then finds nothing to do.
 * Stock never goes below zero; an oversold line is logged for follow-up.
 */
async function markPaidAndDeductStock(orderId: string): Promise<boolean> {
  const result = await db.execute<{ slug: string; short: boolean }>(sql`
    with claimed as (
      update orders
      set status = 'paid', paid_at = coalesce(paid_at, now()),
          stock_deducted_at = now(), updated_at = now()
      where id = ${orderId} and stock_deducted_at is null
      returning id
    ), wanted as (
      select product_id, sum(quantity)::int as qty
      from order_items
      where order_id in (select id from claimed) and product_id is not null
      group by product_id
    )
    update inventory as i
    set quantity = greatest(i.quantity - w.qty, 0), updated_at = now()
    from wanted as w
    join inventory as before on before.product_id = w.product_id
    join products as p on p.id = w.product_id
    where i.product_id = w.product_id
    returning p.slug as slug, before.quantity < w.qty as short
  `);
  for (const row of result.rows) {
    if (row.short) console.warn(`Order ${orderId} oversold ${row.slug}; stock clamped at 0`);
  }
  return result.rows.length > 0;
}

/**
 * Empty the cart this checkout came from, keeping anything added or changed
 * after checkout started (the customer may have kept shopping).
 */
export async function clearCheckedOutCart(session: Stripe.Checkout.Session): Promise<number> {
  const cartId = session.metadata?.cartId;
  if (session.status !== "complete" || !cartId || !UUID.test(cartId)) return 0;
  const startedAt = new Date(session.created * 1000 + CLOCK_SLACK_MS);
  const removed = await db
    .delete(cartItems)
    .where(and(eq(cartItems.cartId, cartId), lte(cartItems.updatedAt, startedAt)))
    .returning({ productId: cartItems.productId });
  return removed.length;
}

/** The order recorded for a Checkout Session, once the webhook has run. */
export async function getOrderForCheckout(sessionId: string) {
  return db.query.orders.findFirst({
    columns: { id: true, createdAt: true },
    where: eq(orders.stripeCheckoutSessionId, sessionId),
  });
}

/**
 * Record a completed Checkout Session: create the order, clear the cart
 * and, once paid, take stock. Returns whether stock changed, so the caller
 * can refresh the catalogue cache.
 */
export async function fulfillCheckout(session: Stripe.Checkout.Session): Promise<boolean> {
  if (session.status !== "complete") return false;
  const paid = session.payment_status !== "unpaid";
  const order = await ensureOrder(session, paid ? "paid" : "pending");
  await clearCheckedOutCart(session);
  return paid ? markPaidAndDeductStock(order.id) : false;
}

/** An async payment (e.g. bank debit) failed after checkout completed. */
export async function failCheckout(session: Stripe.Checkout.Session) {
  const order = await ensureOrder(session, "payment_failed");
  if (order.status === "pending") {
    await db.update(orders).set({ status: "payment_failed" }).where(eq(orders.id, order.id));
  }
}

/*
 * Customer order history. Every query is scoped by user id, so a customer
 * can only ever read their own orders. Guest orders (no user id) aren't
 * matched by email: emails aren't verified, so that would leak orders.
 */

/** A signed-in customer's orders, newest first. */
export async function getCustomerOrders(userId: string) {
  const rows = await db.query.orders.findMany({
    columns: { id: true, status: true, totalCents: true, createdAt: true },
    where: eq(orders.userId, userId),
    orderBy: [desc(orders.createdAt)],
    with: { items: { columns: { quantity: true } } },
  });
  return rows.map(({ items, ...order }) => ({
    ...order,
    itemCount: items.reduce((n, i) => n + i.quantity, 0),
  }));
}

/** One of the customer's orders with its items, or undefined if it isn't theirs. */
export async function getCustomerOrder(userId: string, orderId: string) {
  if (!UUID.test(orderId)) return undefined;
  const order = await db.query.orders.findFirst({
    where: and(eq(orders.id, orderId), eq(orders.userId, userId)),
    with: {
      items: {
        orderBy: [orderItems.createdAt, orderItems.productName],
        // Current slug and image; the name, size and price stay as sold.
        with: { product: { columns: { slug: true, images: true } } },
      },
    },
  });
  if (!order) return undefined;
  return {
    ...order,
    items: order.items.map((item) => ({
      slug: item.product?.slug ?? "",
      name: item.productName,
      size: item.productSize,
      unitPriceCents: item.unitPriceCents,
      quantity: item.quantity,
      lineTotalCents: item.unitPriceCents * item.quantity,
      image: item.product?.images[0],
    })),
  };
}
