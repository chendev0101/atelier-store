/*
 * Seeds the catalogue: `pnpm db:seed`. Safe to re-run — rows are upserted by
 * slug, and inventory quantities are reset to the seed values.
 *
 * Runs outside Next.js, so it builds its own client instead of importing
 * `@/db` (which pulls in `server-only` and the app's env validation).
 */
import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { getTableColumns, sql, type SQL } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import type { PgTable } from "drizzle-orm/pg-core";
import * as schema from "../schema";
import { categories, inventory, products } from "../schema";
import { seedCategories, seedProducts } from "./catalog-data";

// Same lookup as Next.js: .env.local wins over .env.
config({ path: [".env.local", ".env"], quiet: true });

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set (expected in .env.local or .env)");

const db = drizzle({ client: neon(url), schema });

/** `SET col = excluded.col` for every listed column, for upserts. */
function excluded<T extends PgTable>(table: T, keys: (keyof T["_"]["columns"])[]) {
  const columns = getTableColumns(table);
  return Object.fromEntries(
    keys.map((k) => [k, sql.raw(`excluded."${columns[k as string].name}"`)]),
  ) as Record<string, SQL>;
}

const idBySlug = (table: "categories" | "products", slug: string) =>
  sql`(select id from ${sql.identifier(table)} where slug = ${slug})`;

async function main() {
  const now = new Date();

  // neon-http has no interactive transactions; batch() runs these statements
  // in order inside one transaction, so subqueries see earlier inserts.
  await db.batch([
    db
      .insert(categories)
      .values(seedCategories)
      .onConflictDoUpdate({
        target: categories.slug,
        set: {
          ...excluded(categories, ["name", "note", "image", "contextImage", "position"]),
          updatedAt: now,
        },
      }),
    db
      .insert(products)
      .values(
        seedProducts.map((p) => ({
          slug: p.slug,
          categoryId: idBySlug("categories", p.categorySlug),
          name: p.name,
          tagline: p.tagline,
          description: p.description,
          priceCents: p.priceCents,
          size: p.size,
          badge: p.badge ?? null,
          isNew: p.isNew ?? false,
          status: p.status ?? "active",
          images: p.images,
          keyIngredients: p.keyIngredients,
          howToUse: p.howToUse,
        })),
      )
      .onConflictDoUpdate({
        target: products.slug,
        set: {
          ...excluded(products, [
            "categoryId",
            "name",
            "tagline",
            "description",
            "priceCents",
            "size",
            "badge",
            "isNew",
            "status",
            "images",
            "keyIngredients",
            "howToUse",
          ]),
          updatedAt: now,
        },
      }),
    db
      .insert(inventory)
      .values(
        seedProducts.map((p) => ({
          productId: idBySlug("products", p.slug),
          quantity: p.quantity,
        })),
      )
      .onConflictDoUpdate({
        target: inventory.productId,
        set: { ...excluded(inventory, ["quantity"]), updatedAt: now },
      }),
  ]);

  const [counts] = await db.execute<{ categories: number; products: number; inventory: number }>(
    sql`select
      (select count(*)::int from categories) as categories,
      (select count(*)::int from products) as products,
      (select count(*)::int from inventory) as inventory`,
  ).then((r) => r.rows);
  console.log("Seeded catalogue:", counts);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
