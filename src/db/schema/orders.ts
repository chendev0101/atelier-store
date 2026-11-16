import { relations, sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { products } from "./catalog";

/*
 * Orders, written only by the Stripe webhook. Prices and product details are
 * snapshots taken at checkout, so later catalogue edits don't rewrite history.
 * No `server-only` here: drizzle-kit loads this file outside Next.js.
 */

export const ORDER_STATUSES = ["pending", "paid", "payment_failed"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type ShippingAddress = {
  line1: string;
  line2: string | null;
  city: string;
  state: string | null;
  postalCode: string;
  country: string;
};

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** Stripe retries webhooks; this unique key makes order creation idempotent. */
    stripeCheckoutSessionId: text("stripe_checkout_session_id").notNull().unique(),
    stripePaymentIntentId: text("stripe_payment_intent_id"),
    /** Null for guest checkouts, or if the account is later deleted. */
    userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
    email: text("email").notNull(),
    /** pending: async payment (e.g. bank debit) not settled yet. */
    status: text("status").$type<OrderStatus>().notNull(),
    currency: text("currency").notNull().default("usd"),
    subtotalCents: integer("subtotal_cents").notNull(),
    shippingCents: integer("shipping_cents").notNull(),
    totalCents: integer("total_cents").notNull(),
    /** Display name of the chosen shipping rate, e.g. "Standard". */
    shippingMethod: text("shipping_method"),
    shippingName: text("shipping_name"),
    shippingAddress: jsonb("shipping_address").$type<ShippingAddress>(),
    /** When stock was taken for this order; null until paid. Guards double decrements. */
    stockDeductedAt: timestamp("stock_deducted_at", { withTimezone: true }),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [
    index("orders_user_id_idx").on(t.userId),
    check(
      "orders_status_valid",
      sql`${t.status} in ('pending', 'paid', 'payment_failed')`,
    ),
    check(
      "orders_amounts_non_negative",
      sql`${t.subtotalCents} >= 0 and ${t.shippingCents} >= 0 and ${t.totalCents} >= 0`,
    ),
  ],
);

export const orderItems = pgTable(
  "order_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    /** Null if the product is later deleted; the snapshot below survives. */
    productId: uuid("product_id").references(() => products.id, { onDelete: "set null" }),
    productSlug: text("product_slug").notNull(),
    productName: text("product_name").notNull(),
    productSize: text("product_size").notNull(),
    unitPriceCents: integer("unit_price_cents").notNull(),
    quantity: integer("quantity").notNull(),
    ...timestamps,
  },
  (t) => [
    index("order_items_order_id_idx").on(t.orderId),
    check("order_items_quantity_positive", sql`${t.quantity} > 0`),
    check("order_items_unit_price_non_negative", sql`${t.unitPriceCents} >= 0`),
  ],
);

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(user, { fields: [orders.userId], references: [user.id] }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, { fields: [orderItems.productId], references: [products.id] }),
}));
