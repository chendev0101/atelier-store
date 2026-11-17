import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { EmptyRow, Table, Td, Th } from "@/components/admin/data-table";
import { FormMessage } from "@/components/admin/form-message";
import { PageHeader } from "@/components/admin/page-header";
import { ButtonLink } from "@/components/ui/button";
import { listAdminCategories } from "@/db/queries/admin/catalog";
import { requireAdmin } from "@/lib/dal";
import { MoveButtons } from "./category-controls";

export const metadata: Metadata = { title: "Categories" };

export default function AdminCategoriesPage({ searchParams }: PageProps<"/admin/categories">) {
  return (
    <>
      <PageHeader
        title="Categories"
        description="The order here is the order on the homepage."
        action={
          <ButtonLink href="/admin/categories/new" size="sm">
            New category
          </ButtonLink>
        }
      />
      <Suspense fallback={<div aria-busy="true" className="min-h-96" />}>
        <CategoriesTable searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function CategoriesTable({
  searchParams,
}: {
  searchParams: PageProps<"/admin/categories">["searchParams"];
}) {
  await requireAdmin("/admin/categories");
  const [rows, query] = await Promise.all([listAdminCategories(), searchParams]);

  return (
    <>
      {query.saved === "deleted" && (
        <div className="mb-6">
          <FormMessage success="Category deleted." />
        </div>
      )}
      <Table>
        <caption className="sr-only">Categories</caption>
        <thead>
          <tr>
            <Th>Category</Th>
            <Th className="hidden md:table-cell">Note</Th>
            <Th className="text-right">Products</Th>
            <Th className="text-right">Order</Th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && <EmptyRow colSpan={4}>No categories yet.</EmptyRow>}
          {rows.map((c, i) => (
            <tr key={c.id}>
              <Td>
                <Link href={`/admin/categories/${c.id}`} className="link-nav font-medium">
                  {c.name}
                </Link>
                <span className="text-meta block font-mono text-xs">/shop/{c.slug}</span>
              </Td>
              <Td className="hidden max-w-sm text-ink-muted md:table-cell">{c.note}</Td>
              <Td className="text-right tabular-nums">
                <Link href={`/admin/products?category=${c.id}`} className="link-nav">
                  {c.productCount}
                </Link>
              </Td>
              <Td>
                <MoveButtons id={c.id} name={c.name} first={i === 0} last={i === rows.length - 1} />
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
