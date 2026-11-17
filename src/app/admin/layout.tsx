import type { Metadata } from "next";
import Link from "next/link";
import { type ReactNode, Suspense } from "react";
import { AdminNav } from "@/components/admin/admin-nav";
import { requireAdmin } from "@/lib/dal";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin · Atelier" },
  robots: { index: false },
};

/*
 * The whole shell renders only for admins, so other visitors don't even see
 * the navigation. This check is for UX: every page and action still
 * verifies the role itself.
 */
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <Suspense fallback={<div aria-busy="true" className="min-h-screen" />}>
      <AdminShell>{children}</AdminShell>
    </Suspense>
  );
}

async function AdminShell({ children }: { children: ReactNode }) {
  const admin = await requireAdmin();
  return (
    <div className="flex flex-1 flex-col lg:flex-row">
      <aside className="hairline-b shrink-0 bg-paper-deep px-5 py-4 lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-56 lg:flex-col lg:border-r lg:border-b-0 lg:border-line lg:px-6 lg:py-8">
        <div className="flex items-baseline justify-between gap-4 lg:block">
          <Link href="/admin/products" className="font-serif text-xl">
            Atelier <span className="text-meta font-sans text-xs tracking-label uppercase">Admin</span>
          </Link>
          <Link href="/" className="link-nav text-xs text-ink-muted lg:hidden">
            View store
          </Link>
        </div>
        <AdminNav className="mt-4 lg:mt-10" />
        <div className="text-meta mt-auto hidden space-y-3 pt-8 text-xs lg:block">
          <p className="break-all">{admin.email}</p>
          <Link href="/" className="link-nav">
            View store →
          </Link>
        </div>
      </aside>
      <main className="min-w-0 flex-1 px-5 py-8 md:px-10 md:py-10">
        {admin.readOnly && (
          <p
            role="status"
            className="mb-8 border-l-2 border-clay bg-paper-deep px-4 py-3 text-sm"
          >
            <strong className="font-medium">Read-only demo.</strong> Look around freely: saving is
            disabled, and customer details are partly hidden.
          </p>
        )}
        {children}
      </main>
    </div>
  );
}
