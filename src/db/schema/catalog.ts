import { relations, sql } from "drizzle-orm";
import {
  boolean,
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

/*
 * Catalogue tables: categories, products and per-product inventory.
 * No `server-only` here: drizzle-kit and the seed script read this file
 * outside Next.js.
 */

export type ImageAsset = { src: string; alt: string };

/** draft: not yet on sale; archived: withdrawn. Only active products show in the store. */
export const PRODUCT_STATUSES = ["draft", "active", "archived"] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export const STOCK_ADJUSTMENT_REASONS = ["initial", "restock", "correction", "damage"] as const;
export type StockAdjustmentReason = (typeof STOCK_ADJUSTMENT_REASONS)[number];

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  /** Short line under the name on the homepage tile. */
  note: text("note").notNull(),
  /** Tile image on the homepage. */
  image: jsonb("image").$type<ImageAsset>().notNull(),
  /** Atmosphere shot shown after a product's own images on its detail page. */
  contextImage: jsonb("context_image").$type<ImageAsset>().notNull(),
  /** Display order, ascending. */
  position: integer("position").notNull().default(0),
  ...timestamps,
});

export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    /** One line, shown on cards. */
    tagline: text("tagline").notNull(),
    /** A short paragraph, shown under the product name. */
    description: text("description").notNull(),
    /** Price in US cents. */
    priceCents: integer("price_cents").notNull(),
    size: text("size").notNull(),
    badge: text("badge"),
    /** Listed under New formulations and badged "New" on cards. */
    isNew: boolean("is_new").notNull().default(false),
    /** Ordered; the first is the card image. */
    images: jsonb("images").$type<ImageAsset[]>().notNull().default([]),
    keyIngredients: text("key_ingredients").array().notNull().default(sql`'{}'::text[]`),
    howToUse: text("how_to_use").notNull(),
    status: text("status").$type<ProductStatus>().notNull().default("active"),
    ...timestamps,
  },
  (t) => [
    index("products_category_id_idx").on(t.categoryId),
    check("products_price_cents_nonnegative", sql`${t.priceCents} >= 0`),
    check("products_status_valid", sql`${t.status} in ('draft', 'active', 'archived')`),
  ],
);

export const inventory = pgTable(
  "inventory",
  {
    productId: uuid("product_id")
      .primaryKey()
      .references(() => products.id, { onDelete: "cascade" }),
    quantity: integer("quantity").notNull().default(0),
    updatedAt: timestamps.updatedAt,
  },
  (t) => [check("inventory_quantity_nonnegative", sql`${t.quantity} >= 0`)],
);

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  adjustments: many(inventoryAdjustments),
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
  inventory: one(inventory, { fields: [products.id], references: [inventory.productId] }),
}));

export const inventoryRelations = relations(inventory, ({ one }) => ({
  product: one(products, { fields: [inventory.productId], references: [products.id] }),
}));

/**
 * Ledger of manual stock changes made in the admin (sales are recorded on
 * orders instead). inventory.quantity stays the live balance; each row
 * records who changed it, by how much and why.
 */
export const inventoryAdjustments = pgTable(
  "inventory_adjustments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    delta: integer("delta").notNull(),
    reason: text("reason").$type<StockAdjustmentReason>().notNull(),
    note: text("note"),
    /** Balance right after this change. */
    quantityAfter: integer("quantity_after").notNull(),
    /** Null if the admin's account is later deleted. */
    actorUserId: text("actor_user_id").references(() => user.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("inventory_adjustments_product_created_idx").on(t.productId, t.createdAt),
    check(
      "inventory_adjustments_reason_valid",
      sql`${t.reason} in ('initial', 'restock', 'correction', 'damage')`,
    ),
    check("inventory_adjustments_quantity_after_nonnegative", sql`${t.quantityAfter} >= 0`),
  ],
);

export const inventoryAdjustmentsRelations = relations(inventoryAdjustments, ({ one }) => ({
  product: one(products, { fields: [inventoryAdjustments.productId], references: [products.id] }),
  actor: one(user, { fields: [inventoryAdjustments.actorUserId], references: [user.id] }),
}));
