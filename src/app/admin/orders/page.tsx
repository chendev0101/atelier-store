import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { EmptyRow, Table, Td, Th } from "@/components/admin/data-table";
import { PageHeader } from "@/components/admin/page-header";
import { Pagination } from "@/components/admin/pagination";
import { OrderStatus } from "@/components/orders/order-status";
import { ORDER_STATUSES, type OrderStatus as Status } from "@/db/schema";
import { listAdminOrders } from "@/db/queries/admin/orders";
import { formatPrice } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { requireAdmin } from "@/lib/dal";
import { ORDER_STATUS_LABELS, orderNumber } from "@/lib/orders";

export const metadata: Metadata = { title: "Orders" };

export default function AdminOrdersPage({ searchParams }: PageProps<"/admin/orders">) {
  return (
    <>
      <PageHeader title="Orders" description="Recorded by the Stripe webhook. Read-only for now." />
      <Suspense fallback={<div aria-busy="true" className="min-h-96" />}>
        <OrdersTable searchParams={searchParams} />
      </Suspense>
    </>
  );
}

const isStatus = (v: unknown): v is Status =>
  typeof v === "string" && (ORDER_STATUSES as readonly string[]).includes(v);

async function OrdersTable({
  searchParams,
}: {
  searchParams: PageProps<"/admin/orders">["searchParams"];
}) {
  await requireAdmin("/admin/orders");
  const params = await searchParams;
  const status = isStatus(params.status) ? params.status : undefined;
  const page = Math.max(1, Math.min(1000, Number.parseInt(String(params.page ?? "1"), 10) || 1));
  const { orders, hasNext } = await listAdminOrders({ status, page });

  const href = (next: { status?: Status; page?: number }) => {
    const q = new URLSearchParams();
    const s = "status" in next ? next.status : status;
    if (s) q.set("status", s);
    if (next.page && next.page > 1) q.set("page", String(next.page));
    const qs = q.toString();
    return qs ? `/admin/orders?${qs}` : "/admin/orders";
  };

  return (
    <>
      <nav aria-label="Filter by payment status" className="mb-6 flex flex-wrap gap-4 text-sm">
        {[undefined, ...ORDER_STATUSES].map((s) => (
          <Link
            key={s ?? "all"}
            href={href({ status: s })}
            aria-current={s === status ? "page" : undefined}
            className={cn("link-nav", s === status ? "text-ink" : "text-ink-muted")}
          >
            {s ? ORDER_STATUS_LABELS[s] : "All"}
          </Link>
        ))}
      </nav>

      <Table>
        <caption className="sr-only">Orders</caption>
        <thead>
          <tr>
            <Th>Order</Th>
            <Th>Customer</Th>
            <Th className="hidden text-right md:table-cell">Items</Th>
            <Th className="text-right">Total</Th>
            <Th>Payment</Th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 && <EmptyRow colSpan={5}>No orders here yet.</EmptyRow>}
          {orders.map((o) => (
            <tr key={o.id}>
              <Td>
                <Link href={`/admin/orders/${o.id}`} className="link-nav font-mono text-[0.8125rem]">
                  #{orderNumber(o.id)}
                </Link>
                <span className="text-meta block text-xs">
                  {o.createdAt.toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
              </Td>
              <Td className="max-w-56">
                <span className="block truncate">{o.email || "—"}</span>
                {o.isGuest && <span className="text-meta text-xs">Guest</span>}
              </Td>
              <Td className="hidden text-right tabular-nums md:table-cell">{o.itemCount}</Td>
              <Td className="text-right tabular-nums">{formatPrice(o.totalCents)}</Td>
              <Td>
                <OrderStatus status={o.status} className="whitespace-nowrap" />
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Pagination page={page} hasNext={hasNext} hrefFor={(p) => href({ page: p })} />
    </>
  );
}
