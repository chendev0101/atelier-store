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

/*
 * Catalogue tables: categories, products and per-product inventory.
 * No `server-only` here: drizzle-kit and the seed script read this file
 * outside Next.js.
 */

export type ImageAsset = { src: string; alt: string };

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
    /** Ordered; the first is the card image. */
    images: jsonb("images").$type<ImageAsset[]>().notNull().default([]),
    keyIngredients: text("key_ingredients").array().notNull().default(sql`'{}'::text[]`),
    howToUse: text("how_to_use").notNull(),
    ...timestamps,
  },
  (t) => [
    index("products_category_id_idx").on(t.categoryId),
    check("products_price_cents_nonnegative", sql`${t.priceCents} >= 0`),
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

export const productsRelations = relations(products, ({ one }) => ({
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
  inventory: one(inventory, { fields: [products.id], references: [inventory.productId] }),
}));

export const inventoryRelations = relations(inventory, ({ one }) => ({
  product: one(products, { fields: [inventory.productId], references: [products.id] }),
}));
