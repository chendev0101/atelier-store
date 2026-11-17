import { Suspense } from "react";
import { CartLink, CartLinkView } from "@/components/cart/cart-link";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

/* Storefront chrome. A route group, so URLs are unchanged. */
export default function StoreLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SiteHeader
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
