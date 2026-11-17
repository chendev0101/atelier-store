import { Suspense } from "react";
import { CartLink, CartLinkView } from "@/components/cart/cart-link";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getCategories } from "@/db/queries/catalog";

/*
 * Storefront chrome. A route group, so URLs are unchanged. Categories come
 * from the cached catalogue, so the header follows the admin's order and
 * stays in the static shell.
 */
export default async function StoreLayout({ children }: LayoutProps<"/">) {
  const categories = await getCategories();
  return (
    <>
      <SiteHeader
        nav={categories.map((c) => ({ label: c.name, href: c.href }))}
        cartLink={
          <Suspense fallback={<CartLinkView count={0} />}>
            <CartLink />
          </Suspense>
        }
      />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}
