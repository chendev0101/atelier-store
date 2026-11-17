import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { EmptyRow, Table, Td, Th } from "@/components/admin/data-table";
import { PageHeader } from "@/components/admin/page-header";
import { ProductStatusBadge } from "@/components/admin/status-badge";
import { listInventory } from "@/db/queries/admin/catalog";
import { LOW_STOCK_THRESHOLD } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { requireAdmin } from "@/lib/dal";
import { StockAdjuster } from "./stock-adjuster";

export const metadata: Metadata = { title: "Inventory" };

export default function InventoryPage() {
  return (
    <>
      <PageHeader
        title="Inventory"
        description="Lowest stock first. Changes are relative: enter +12 for a delivery, -2 for damaged units."
      />
      <Suspense fallback={<div aria-busy="true" className="min-h-96" />}>
        <InventoryTable />
      </Suspense>
    </>
  );
}

async function InventoryTable() {
  await requireAdmin("/admin/inventory");
  const rows = await listInventory();
  const low = rows.filter((r) => r.status === "active" && r.quantity <= LOW_STOCK_THRESHOLD);

  return (
    <>
      <p className="mb-6 text-sm">
        {low.length === 0 ? (
          "Every active product has more than " + LOW_STOCK_THRESHOLD + " units."
        ) : (
          <>
            <span className="text-clay">{low.length}</span> active{" "}
            {low.length === 1 ? "product is" : "products are"} at or below {LOW_STOCK_THRESHOLD}{" "}
            units.
          </>
        )}
      </p>
      <Table>
        <caption className="sr-only">Stock by product</caption>
        <thead>
          <tr>
            <Th>Product</Th>
            <Th className="hidden lg:table-cell">Status</Th>
            <Th className="text-right">On hand</Th>
            <Th>Adjust</Th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && <EmptyRow colSpan={4}>No products yet.</EmptyRow>}
          {rows.map((p) => (
            <tr key={p.id} className="align-top">
              <Td className="pt-4 align-top">
                <Link href={`/admin/products/${p.id}`} className="link-nav font-medium">
                  {p.name}
                </Link>
                <span className="text-meta block text-xs">
                  {p.size} · {p.categoryName}
                </span>
              </Td>
              <Td className="hidden pt-4 align-top lg:table-cell">
                <ProductStatusBadge status={p.status} />
              </Td>
              <Td
                className={cn(
                  "pt-4 text-right align-top text-base tabular-nums",
                  p.quantity === 0 ? "text-error" : p.quantity <= LOW_STOCK_THRESHOLD && "text-clay",
                )}
              >
                {p.quantity}
              </Td>
              <Td className="pt-3 align-top">
                <StockAdjuster productId={p.id} productName={p.name} quantity={p.quantity} />
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
