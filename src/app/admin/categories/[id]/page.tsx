import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { FormMessage } from "@/components/admin/form-message";
import { PageHeader } from "@/components/admin/page-header";
import { getAdminCategory } from "@/db/queries/admin/catalog";
import { categoryHref } from "@/lib/catalog";
import { requireAdmin } from "@/lib/dal";
import { updateCategory } from "../actions";
import { DeleteCategory } from "../category-controls";
import { CategoryForm } from "../category-form";

export const metadata: Metadata = { title: "Edit category" };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function EditCategoryPage({ params, searchParams }: PageProps<"/admin/categories/[id]">) {
  return (
    <Suspense fallback={<div aria-busy="true" className="min-h-96" />}>
      <EditCategory params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function EditCategory({
  params,
  searchParams,
}: {
  params: PageProps<"/admin/categories/[id]">["params"];
  searchParams: PageProps<"/admin/categories/[id]">["searchParams"];
}) {
  const { id } = await params;
  await requireAdmin(`/admin/categories/${id}`);
  if (!UUID.test(id)) notFound();
  const [category, query] = await Promise.all([getAdminCategory(id), searchParams]);
  if (!category) notFound();

  return (
    <>
      <PageHeader
        eyebrow={
          <Link href="/admin/categories" className="link-nav">
            ← Categories
          </Link>
        }
        title={category.name}
        description={
          <span className="flex flex-wrap gap-x-4">
            <Link href={`/admin/products?category=${category.id}`} className="link-nav">
              {category.productCount} {category.productCount === 1 ? "product" : "products"}
            </Link>
            <Link href={categoryHref(category.slug)} className="link-nav" target="_blank">
              View in store ↗
            </Link>
          </span>
        }
      />
      {query.saved === "created" && (
        <div className="mb-8">
          <FormMessage success="Category created." />
        </div>
      )}
      <div className="grid gap-12 xl:grid-cols-12 xl:gap-16">
        <div className="xl:col-span-8">
          <CategoryForm
            action={updateCategory.bind(null, category.id)}
            submitLabel="Save changes"
            defaults={{
              name: category.name,
              slug: category.slug,
              note: category.note,
              image: category.image,
              contextImage: category.contextImage,
            }}
          />
        </div>
        <aside className="xl:col-span-4">
          <section aria-labelledby="delete-title" className="hairline p-5">
            <h2 id="delete-title" className="eyebrow mb-3">
              Delete
            </h2>
            <DeleteCategory id={category.id} productCount={category.productCount} />
          </section>
        </aside>
      </div>
    </>
  );
}
