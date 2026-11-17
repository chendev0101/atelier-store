import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { CheckoutButton } from "@/components/cart/checkout-button";
import { QuantityControl } from "@/components/cart/quantity-control";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { getCart } from "@/db/queries/cart";
import { FREE_SHIPPING_THRESHOLD_CENTS } from "@/lib/cart";
import { formatPrice, productHref } from "@/lib/catalog";

export const metadata: Metadata = { title: "Your bag", robots: { index: false } };

/* Per-visitor (session or cart cookie), so the contents render in <Suspense>. */
export default function CartPage() {
  return (
    <Container className="pt-10 pb-20 md:pt-14 md:pb-28">
      <p className="eyebrow">Your bag</p>
      <Suspense fallback={<CartFallback />}>
        <CartContents />
      </Suspense>
    </Container>
  );
}

function CartFallback() {
  return (
    <div aria-busy="true">
      <h1 className="mt-3">Bag</h1>
      <div className="mt-10 min-h-60" />
    </div>
  );
}

async function CartContents() {
  const cart = await getCart();

  if (cart.lines.length === 0) {
    return (
      <div>
        <h1 className="mt-3">Your bag is empty</h1>
        <p className="text-lead mt-4 max-w-md">
          Find something for skin, body or home, and it will wait for you here.
        </p>
        <ButtonLink href="/shop/new" className="mt-8">
          Shop new formulations
        </ButtonLink>
      </div>
    );
  }

  const remainingForFreeShipping = FREE_SHIPPING_THRESHOLD_CENTS - cart.subtotalCents;
  const overStock = cart.lines.some((l) => l.quantity > l.available);

  return (
    <>
      <h1 className="mt-3">
        Bag <span className="text-ink-muted">({cart.count})</span>
      </h1>

      <div className="mt-10 grid gap-12 lg:grid-cols-12 lg:gap-8">
        <ul className="hairline-t lg:col-span-8" aria-label="Items in your bag">
          {cart.lines.map((line) => (
            <li key={line.slug} className="hairline-b flex gap-4 py-6 md:gap-6">
              <Link
                href={productHref(line.slug)}
                className="media-well aspect-product w-24 shrink-0 md:w-32"
                tabIndex={-1}
                aria-hidden="true"
              >
                {line.image && (
                  <Image
                    src={line.image.src}
                    alt=""
                    fill
                    sizes="128px"
                    className="object-cover"
                  />
                )}
              </Link>

              <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:justify-between">
                <div className="min-w-0">
                  <h2 className="font-sans text-sm font-medium tracking-normal md:text-base">
                    <Link href={productHref(line.slug)} className="link-nav">
                      {line.name}
                    </Link>
                  </h2>
                  <p className="text-meta mt-1">
                    {line.size} · {formatPrice(line.unitPriceCents)}
                  </p>
                  {line.quantity > line.available ? (
                    <p className="mt-2 text-xs text-error">
                      {line.discontinued
                        ? "No longer available. Please remove it."
                        : line.available === 0
                          ? "Sold out since you added it."
                        : `Only ${line.available} left; please lower the quantity.`}
                    </p>
                  ) : line.available <= 5 ? (
                    <p className="text-meta mt-2 text-xs">Only {line.available} left</p>
                  ) : null}
                  <div className="mt-4">
                    <QuantityControl
                      slug={line.slug}
                      name={line.name}
                      quantity={line.quantity}
                      available={line.available}
                    />
                  </div>
                </div>
                <p className="text-sm tabular-nums sm:text-right">{formatPrice(line.lineTotalCents)}</p>
              </div>
            </li>
          ))}
        </ul>

        <aside
          aria-labelledby="summary-title"
          className="bg-paper-deep p-6 md:p-8 lg:sticky lg:top-[calc(var(--spacing-header)+2rem)] lg:col-span-4 lg:self-start"
        >
          <h2 id="summary-title" className="text-xl">
            Summary
          </h2>
          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt>Subtotal</dt>
              <dd className="tabular-nums">{formatPrice(cart.subtotalCents)}</dd>
            </div>
            <div className="flex justify-between gap-4 text-ink-muted">
              <dt>Shipping</dt>
              <dd>Calculated at checkout</dd>
            </div>
          </dl>
          <p className="text-meta hairline-t mt-6 pt-4 text-xs">
            {remainingForFreeShipping > 0
              ? `Add ${formatPrice(remainingForFreeShipping)} more for free shipping.`
              : "Your order ships free."}
          </p>

          <CheckoutButton disabled={overStock} />
          <p className="text-meta mt-3 text-center text-xs">
            {overStock
              ? "Adjust the items marked above to continue."
              : "Secure payment by Stripe. Shipping is chosen at checkout."}
          </p>
        </aside>
      </div>
    </>
  );
}
