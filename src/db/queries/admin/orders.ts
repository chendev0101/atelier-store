import "server-only";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { type OrderStatus, orderItems, orders, user } from "@/db/schema";
import { assertAdmin } from "@/lib/dal";

/* Admin order reads: uncached, read-only, and role-checked on every call. */

export const ADMIN_ORDERS_PAGE_SIZE = 25;

export async function listAdminOrders({ status, page }: { status?: OrderStatus; page: number }) {
  await assertAdmin();
  const rows = await db
    .select({
      id: orders.id,
      createdAt: orders.createdAt,
      email: orders.email,
      status: orders.status,
      totalCents: orders.totalCents,
      isGuest: sql<boolean>`${orders.userId} is null`,
      // Spelled out with table names: drizzle leaves columns unqualified here,
      // which would compare order_items.order_id to order_items.id.
      itemCount: sql<number>`(
        select coalesce(sum(oi.quantity), 0) from order_items as oi
        where oi.order_id = "orders"."id"
      )`.mapWith(Number),
    })
    .from(orders)
    .where(status ? eq(orders.status, status) : undefined)
    .orderBy(desc(orders.createdAt))
    .limit(ADMIN_ORDERS_PAGE_SIZE + 1)
    .offset((page - 1) * ADMIN_ORDERS_PAGE_SIZE);
  return {
    orders: rows.slice(0, ADMIN_ORDERS_PAGE_SIZE),
    hasNext: rows.length > ADMIN_ORDERS_PAGE_SIZE,
  };
}

export async function getAdminOrder(id: string) {
  await assertAdmin();
  const order = await db.query.orders.findFirst({
    where: eq(orders.id, id),
    with: {
      items: {
        orderBy: [orderItems.createdAt, orderItems.productName],
        with: { product: { columns: { id: true, slug: true, images: true } } },
      },
    },
  });
  if (!order) return undefined;
  const customer = order.userId
    ? await db.query.user.findFirst({
        columns: { name: true, email: true },
        where: eq(user.id, order.userId),
      })
    : undefined;
  return {
    ...order,
    customer,
    items: order.items.map((item) => ({
      productId: item.product?.id ?? null,
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
