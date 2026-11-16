import { CartCount } from "@/components/cart/cart-count";
import { TextLink } from "@/components/ui/text-link";
import { getCartCount } from "@/db/queries/cart";

/** Header "Cart" link with the current unit count. Server-rendered per request. */
export async function CartLink() {
  const count = await getCartCount();
  return <CartLinkView count={count} />;
}

/** Also the Suspense fallback while the count loads. */
export function CartLinkView({ count }: { count: number }) {
  return (
    <TextLink
      variant="nav"
      href="/cart"
      aria-label={count > 0 ? `Cart, ${count} ${count === 1 ? "item" : "items"}` : "Cart"}
    >
      Cart
      <CartCount count={count} />
    </TextLink>
  );
}
