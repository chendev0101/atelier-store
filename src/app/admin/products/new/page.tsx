import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PageHeader } from "@/components/admin/page-header";
import { listAdminCategories } from "@/db/queries/admin/catalog";
import { requireAdmin } from "@/lib/dal";
import { createProduct } from "../actions";
import { ProductForm } from "../product-form";

export const metadata: Metadata = { title: "New product" };

export default function NewProductPage() {
  return (
    <>
      <PageHeader
        eyebrow={
          <Link href="/admin/products" className="link-nav">
            ← Products
          </Link>
        }
        title="New product"
        description="Save as a draft to prepare it without showing it in the store."
      />
      <Suspense fallback={<div aria-busy="true" className="min-h-96" />}>
        <NewProductForm />
      </Suspense>
    </>
  );
}

async function NewProductForm() {
  await requireAdmin("/admin/products/new");
  const categories = await listAdminCategories();
  return (
    <div className="max-w-3xl">
      <ProductForm
        action={createProduct}
        categories={categories}
        withInitialStock
        submitLabel="Create product"
        defaults={{
          name: "",
          slug: "",
          categoryId: "",
          tagline: "",
          description: "",
          howToUse: "",
          price: "",
          size: "",
          badge: "",
          isNew: false,
          status: "draft",
          images: [],
          keyIngredients: "",
        }}
      />
    </div>
  );
}
