import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PageHeader } from "@/components/admin/page-header";
import { requireAdmin } from "@/lib/dal";
import { createCategory } from "../actions";
import { CategoryForm } from "../category-form";

export const metadata: Metadata = { title: "New category" };

export default function NewCategoryPage() {
  return (
    <>
      <PageHeader
        eyebrow={
          <Link href="/admin/categories" className="link-nav">
            ← Categories
          </Link>
        }
        title="New category"
      />
      <Suspense fallback={<div aria-busy="true" className="min-h-96" />}>
        <NewCategoryForm />
      </Suspense>
    </>
  );
}

async function NewCategoryForm() {
  await requireAdmin("/admin/categories/new");
  const blank = { src: "", alt: "" };
  return (
    <div className="max-w-3xl">
      <CategoryForm
        action={createCategory}
        submitLabel="Create category"
        defaults={{ name: "", slug: "", note: "", image: blank, contextImage: blank }}
      />
    </div>
  );
}
