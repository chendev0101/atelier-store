import "server-only";
import { asc, desc, eq, inArray, ne, sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import { categories, products } from "@/db/schema";
import {
  type Category,
  type Product,
  categoryHref,
  toStockStatus,
} from "@/lib/catalog";

/*
 * Catalogue reads. Cached so pages stay in the static shell under Cache
 * Components; stock refreshes within minutes. Call `updateTag("catalog")`
 * after writes (e.g. when orders decrement inventory) to refresh at once.
 */

type CategoryRow = typeof categories.$inferSelect;
type ProductRow = typeof products.$inferSelect & {
  category: CategoryRow;
  inventory: { quantity: number } | null;
};

const withCategoryAndStock = {
  category: true,
  inventory: { columns: { quantity: true } },
} as const;

function toCategory(row: CategoryRow): Category {
  return {
    slug: row.slug,
    name: row.name,
    href: categoryHref(row.slug),
    note: row.note,
    image: row.image,
    contextImage: row.contextImage,
  };
}

function toProduct(row: ProductRow): Product {
  return {
    slug: row.slug,
    name: row.name,
    category: toCategory(row.category),
    tagline: row.tagline,
    description: row.description,
    priceCents: row.priceCents,
    size: row.size,
    // A product without an inventory row has nothing to sell.
    stock: toStockStatus(row.inventory?.quantity ?? 0),
    badge: row.badge ?? undefined,
    images: row.images,
    keyIngredients: row.keyIngredients,
    howToUse: row.howToUse,
  };
}

/** Categories in display order. */
export async function getCategories(): Promise<Category[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("catalog");
  const rows = await db.query.categories.findMany({
    orderBy: [asc(categories.position), asc(categories.name)],
  });
  return rows.map(toCategory);
}

/** A category and its products, alphabetical. Undefined if the slug is unknown. */
export async function getCategoryWithProducts(
  slug: string,
): Promise<{ category: Category; products: Product[] } | undefined> {
  "use cache";
  cacheLife("minutes");
  cacheTag("catalog");
  const row = await db.query.categories.findFirst({
    where: eq(categories.slug, slug),
    with: { products: { with: withCategoryAndStock, orderBy: [asc(products.name)] } },
  });
  if (!row) return undefined;
  return { category: toCategory(row), products: row.products.map(toProduct) };
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  "use cache";
  cacheLife("minutes");
  cacheTag("catalog");
  const row = await db.query.products.findFirst({
    where: eq(products.slug, slug),
    with: withCategoryAndStock,
  });
  return row ? toProduct(row) : undefined;
}

export async function getProductSlugs(): Promise<string[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("catalog");
  const rows = await db.select({ slug: products.slug }).from(products);
  return rows.map((r) => r.slug);
}

/** Products in the order given. Throws if any slug is unknown. */
export async function getProductsBySlugs(slugs: string[]): Promise<Product[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("catalog");
  const rows = await db.query.products.findMany({
    where: inArray(products.slug, slugs),
    with: withCategoryAndStock,
  });
  const bySlug = new Map(rows.map((r) => [r.slug, r]));
  return slugs.map((slug) => {
    const row = bySlug.get(slug);
    if (!row) throw new Error(`Unknown product slug: ${slug}`);
    return toProduct(row);
  });
}

/** Same-category products first, then others, excluding the product itself. */
export async function getRelatedProducts(slug: string, limit = 4): Promise<Product[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("catalog");
  const sameCategory = sql`${products.categoryId} = (
    select self.category_id from ${products} as self where self.slug = ${slug}
  )`;
  const rows = await db.query.products.findMany({
    where: ne(products.slug, slug),
    with: withCategoryAndStock,
    orderBy: [desc(sameCategory), asc(products.name)],
    limit,
  });
  return rows.map(toProduct);
}
