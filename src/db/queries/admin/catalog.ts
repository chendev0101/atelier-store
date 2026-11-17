import "server-only";
import { and, asc, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  categories,
  inventory,
  inventoryAdjustments,
  type ProductStatus,
  products,
  user,
} from "@/db/schema";
import { assertAdmin } from "@/lib/dal";

/*
 * Admin catalogue reads. Uncached on purpose (live stock, drafts and
 * archived products included), and each call re-checks the admin role so
 * these can't leak through a page that forgets its own guard.
 */

export type AdminProductFilter = { status?: ProductStatus; categoryId?: string };

export async function listAdminProducts(filter: AdminProductFilter = {}) {
  await assertAdmin();
  return db
    .select({
      id: products.id,
      slug: products.slug,
      name: products.name,
      size: products.size,
      status: products.status,
      priceCents: products.priceCents,
      image: sql<{ src: string; alt: string } | null>`${products.images} -> 0`,
      categoryName: categories.name,
      quantity: sql<number>`coalesce(${inventory.quantity}, 0)`.mapWith(Number),
      updatedAt: products.updatedAt,
    })
    .from(products)
    .innerJoin(categories, eq(categories.id, products.categoryId))
    .leftJoin(inventory, eq(inventory.productId, products.id))
    .where(
      and(
        filter.status ? eq(products.status, filter.status) : undefined,
        filter.categoryId ? eq(products.categoryId, filter.categoryId) : undefined,
      ),
    )
    .orderBy(asc(products.name));
}

export async function getAdminProduct(id: string) {
  await assertAdmin();
  const product = await db.query.products.findFirst({
    where: eq(products.id, id),
    with: { inventory: { columns: { quantity: true } } },
  });
  if (!product) return undefined;
  const adjustments = await db
    .select({
      id: inventoryAdjustments.id,
      delta: inventoryAdjustments.delta,
      reason: inventoryAdjustments.reason,
      note: inventoryAdjustments.note,
      quantityAfter: inventoryAdjustments.quantityAfter,
      createdAt: inventoryAdjustments.createdAt,
      actorEmail: user.email,
    })
    .from(inventoryAdjustments)
    .leftJoin(user, eq(user.id, inventoryAdjustments.actorUserId))
    .where(eq(inventoryAdjustments.productId, id))
    .orderBy(desc(inventoryAdjustments.createdAt))
    .limit(10);
  return { ...product, quantity: product.inventory?.quantity ?? 0, adjustments };
}

/** Categories in display order, with how many products each holds. */
export async function listAdminCategories() {
  await assertAdmin();
  return db
    .select({
      id: categories.id,
      slug: categories.slug,
      name: categories.name,
      note: categories.note,
      position: categories.position,
      productCount: sql<number>`count(${products.id})`.mapWith(Number),
    })
    .from(categories)
    .leftJoin(products, eq(products.categoryId, categories.id))
    .groupBy(categories.id)
    .orderBy(asc(categories.position), asc(categories.name));
}

export async function getAdminCategory(id: string) {
  await assertAdmin();
  const [row] = await db
    .select({
      category: categories,
      productCount: sql<number>`count(${products.id})`.mapWith(Number),
    })
    .from(categories)
    .leftJoin(products, eq(products.categoryId, categories.id))
    .where(eq(categories.id, id))
    .groupBy(categories.id);
  return row ? { ...row.category, productCount: row.productCount } : undefined;
}
