import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { FormMessage } from "@/components/admin/form-message";
import { PageHeader } from "@/components/admin/page-header";
import { ProductStatusBadge } from "@/components/admin/status-badge";
import { getAdminProduct, listAdminCategories } from "@/db/queries/admin/catalog";
import { productHref } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { requireAdmin } from "@/lib/dal";
import { StockAdjuster } from "../../inventory/stock-adjuster";
import { updateProduct } from "../actions";
import { ProductForm } from "../product-form";
import { StatusActions } from "../status-actions";

export const metadata: Metadata = { title: "Edit product" };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function EditProductPage({ params, searchParams }: PageProps<"/admin/products/[id]">) {
  return (
    <Suspense fallback={<div aria-busy="true" className="min-h-96" />}>
      <EditProduct params={params} searchParams={searchParams} />
    </Suspense>
  );
}

const reasonLabels: Record<string, string> = {
  initial: "Opening stock",
  restock: "Restock",
  correction: "Correction",
  damage: "Damaged",
};

async function EditProduct({
  params,
  searchParams,
}: {
  params: PageProps<"/admin/products/[id]">["params"];
  searchParams: PageProps<"/admin/products/[id]">["searchParams"];
}) {
  const { id } = await params;
  await requireAdmin(`/admin/products/${id}`);
  if (!UUID.test(id)) notFound();
  const [product, categories, query] = await Promise.all([
    getAdminProduct(id),
    listAdminCategories(),
    searchParams,
  ]);
  if (!product) notFound();

  return (
    <>
      <PageHeader
        eyebrow={
          <Link href="/admin/products" className="link-nav">
            ← Products
          </Link>
        }
        title={product.name}
        description={
          <span className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <ProductStatusBadge status={product.status} />
            {product.status === "active" && (
              <Link href={productHref(product.slug)} className="link-nav" target="_blank">
                View in store ↗
              </Link>
            )}
          </span>
        }
      />

      {query.saved === "created" && (
        <div className="mb-8">
          <FormMessage success="Product created." />
        </div>
      )}

      <div className="grid gap-12 xl:grid-cols-12 xl:gap-16">
        <div className="xl:col-span-8">
          <ProductForm
            action={updateProduct.bind(null, product.id)}
            categories={categories}
            submitLabel="Save changes"
            defaults={{
              name: product.name,
              slug: product.slug,
              categoryId: product.categoryId,
              tagline: product.tagline,
              description: product.description,
              howToUse: product.howToUse,
              price: (product.priceCents / 100).toFixed(2),
              size: product.size,
              badge: product.badge ?? "",
              isNew: product.isNew,
              status: product.status,
              images: product.images,
              keyIngredients: product.keyIngredients.join("\n"),
            }}
          />
        </div>

        <aside className="space-y-6 xl:col-span-4">
          <section aria-labelledby="status-title" className="hairline p-5">
            <h2 id="status-title" className="eyebrow">
              Visibility
            </h2>
            <p className="text-meta mt-2 mb-4 text-xs">
              Only active products appear in the store. Archive instead of deleting, so past
              orders keep their link to the product.
            </p>
            <StatusActions id={product.id} status={product.status} />
          </section>

          <section aria-labelledby="stock-title" className="hairline p-5">
            <div className="flex items-baseline justify-between gap-4">
              <h2 id="stock-title" className="eyebrow">
                Stock
              </h2>
              <Link href="/admin/inventory" className="link-nav text-xs text-ink-muted">
                All stock
              </Link>
            </div>
            <p
              className={cn(
                "mt-3 font-serif text-4xl tabular-nums",
                product.quantity === 0 && "text-error",
              )}
            >
              {product.quantity}
              <span className="text-meta ml-2 font-sans text-sm">on hand</span>
            </p>
            <div className="mt-4">
              <StockAdjuster
                productId={product.id}
                productName={product.name}
                quantity={product.quantity}
                layout="stacked"
              />
            </div>
            {product.adjustments.length > 0 && (
              <>
                <h3 className="mt-6 font-sans text-xs font-normal tracking-normal text-ink-muted">
                  Recent changes
                </h3>
                <ul className="mt-2 divide-y divide-line text-xs">
                  {product.adjustments.map((a) => (
                    <li key={a.id} className="flex justify-between gap-3 py-2">
                      <span className="min-w-0 break-words">
                        <span className="block">
                          {reasonLabels[a.reason] ?? a.reason}
                          {a.note && <span className="text-ink-muted"> · {a.note}</span>}
                        </span>
                        <span className="block text-ink-muted">
                          {a.createdAt.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                          {a.actorEmail && ` · ${a.actorEmail}`}
                        </span>
                      </span>
                      <span className="shrink-0 text-right tabular-nums">
                        <span className={a.delta < 0 ? "text-error" : undefined}>
                          {a.delta > 0 ? `+${a.delta}` : a.delta}
                        </span>
                        <span className="block text-ink-muted">→ {a.quantityAfter}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>
        </aside>
      </div>
    </>
  );
}
