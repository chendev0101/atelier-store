import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { EmptyRow, Table, Td, Th } from "@/components/admin/data-table";
import { PageHeader } from "@/components/admin/page-header";
import { ProductStatusBadge } from "@/components/admin/status-badge";
import { ButtonLink } from "@/components/ui/button";
import { PRODUCT_STATUSES, type ProductStatus } from "@/db/schema";
import { listAdminCategories, listAdminProducts } from "@/db/queries/admin/catalog";
import { formatPrice, LOW_STOCK_THRESHOLD } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { requireAdmin } from "@/lib/dal";

export const metadata: Metadata = { title: "Products" };

export default function AdminProductsPage({ searchParams }: PageProps<"/admin/products">) {
  return (
    <>
      <PageHeader
        title="Products"
        action={
          <ButtonLink href="/admin/products/new" size="sm">
            New product
          </ButtonLink>
        }
      />
      <Suspense fallback={<div aria-busy="true" className="min-h-96" />}>
        <ProductsTable searchParams={searchParams} />
      </Suspense>
    </>
  );
}

const isStatus = (v: unknown): v is ProductStatus =>
  typeof v === "string" && (PRODUCT_STATUSES as readonly string[]).includes(v);

async function ProductsTable({
  searchParams,
}: {
  searchParams: PageProps<"/admin/products">["searchParams"];
}) {
  await requireAdmin("/admin/products");
  const params = await searchParams;
  const status = isStatus(params.status) ? params.status : undefined;
  const categories = await listAdminCategories();
  const categoryId = categories.some((c) => c.id === params.category)
    ? (params.category as string)
    : undefined;
  const rows = await listAdminProducts({ status, categoryId });

  const href = (next: { status?: string; category?: string }) => {
    const q = new URLSearchParams();
    const s = "status" in next ? next.status : status;
    const c = "category" in next ? next.category : categoryId;
    if (s) q.set("status", s);
    if (c) q.set("category", c);
    const qs = q.toString();
    return qs ? `/admin/products?${qs}` : "/admin/products";
  };

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <nav aria-label="Filter by status" className="flex flex-wrap gap-4 text-sm">
          {[undefined, ...PRODUCT_STATUSES].map((s) => (
            <Link
              key={s ?? "all"}
              href={href({ status: s })}
              aria-current={s === status ? "page" : undefined}
              className={cn("link-nav capitalize", s === status ? "text-ink" : "text-ink-muted")}
            >
              {s ?? "All"}
            </Link>
          ))}
        </nav>
        <form action="/admin/products" className="flex items-center gap-2">
          {status && <input type="hidden" name="status" value={status} />}
          <label htmlFor="category-filter" className="sr-only">
            Category
          </label>
          <select
            id="category-filter"
            name="category"
            defaultValue={categoryId ?? ""}
            className="field-box w-auto py-1.5"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <button type="submit" className="btn btn-secondary btn-sm">
            Filter
          </button>
        </form>
      </div>

      <Table>
        <caption className="sr-only">Products</caption>
        <thead>
          <tr>
            <Th>Product</Th>
            <Th className="hidden md:table-cell">Category</Th>
            <Th className="text-right">Price</Th>
            <Th className="text-right">Stock</Th>
            <Th>Status</Th>
            <Th>
              <span className="sr-only">Actions</span>
            </Th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && <EmptyRow colSpan={6}>No products match these filters.</EmptyRow>}
          {rows.map((p) => (
            <tr key={p.id} className="group">
              <Td>
                <div className="flex items-center gap-3">
                  <span className="media-well block size-10 shrink-0">
                    {p.image && (
                      <Image src={p.image.src} alt="" fill sizes="40px" className="object-cover" />
                    )}
                  </span>
                  <span className="min-w-0">
                    <Link href={`/admin/products/${p.id}`} className="link-nav font-medium">
                      {p.name}
                    </Link>
                    <span className="text-meta block text-xs">{p.size}</span>
                  </span>
                </div>
              </Td>
              <Td className="hidden text-ink-muted md:table-cell">{p.categoryName}</Td>
              <Td className="text-right tabular-nums">{formatPrice(p.priceCents)}</Td>
              <Td
                className={cn(
                  "text-right tabular-nums",
                  p.quantity === 0 ? "text-error" : p.quantity <= LOW_STOCK_THRESHOLD && "text-clay",
                )}
              >
                {p.quantity}
              </Td>
              <Td>
                <ProductStatusBadge status={p.status} />
              </Td>
              <Td className="text-right">
                <Link href={`/admin/products/${p.id}`} className="link-nav text-xs text-ink-muted">
                  Edit<span className="sr-only"> {p.name}</span>
                </Link>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
      <p className="text-meta mt-4 text-xs">
        {rows.length} {rows.length === 1 ? "product" : "products"}
      </p>
    </>
  );
}
