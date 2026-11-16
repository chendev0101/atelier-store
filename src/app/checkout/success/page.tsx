import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { type ReactNode, Suspense } from "react";
import type Stripe from "stripe";
import { RefreshOnMount } from "@/components/checkout/refresh-on-mount";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { getProductsBySlugs } from "@/db/queries/catalog";
import {
  type CheckoutLine,
  clearCheckedOutCart,
  getCheckoutLines,
  getOrderForCheckout,
} from "@/db/queries/orders";
import { formatPrice, productHref } from "@/lib/catalog";
import { stripe } from "@/lib/stripe";

export const metadata: Metadata = { title: "Thank you", robots: { index: false } };

/*
 * Confirmation page Stripe returns to. The webhook records the order and
 * takes stock; this page only clears the bag as a fallback, since the
 * customer may land here before the webhook arrives.
 */
export default function CheckoutSuccessPage({ searchParams }: PageProps<"/checkout/success">) {
  return (
    <Container className="pt-12 pb-20 md:pt-16 md:pb-28">
      <Suspense fallback={<ConfirmationSkeleton />}>
        <Confirmation searchParams={searchParams} />
      </Suspense>
    </Container>
  );
}

function ConfirmationSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading your order">
      <div className="size-12 rounded-full bg-sand" />
      <div className="mt-8 h-12 max-w-md bg-sand/60" />
      <div className="mt-4 h-5 max-w-lg bg-sand/40" />
      <div className="mt-12 min-h-80 bg-paper-deep" />
    </div>
  );
}

async function loadCheckout(id: unknown) {
  if (typeof id !== "string" || !id.startsWith("cs_")) return null;
  try {
    const session = await stripe.checkout.sessions.retrieve(id, {
      expand: ["shipping_cost.shipping_rate"],
    });
    if (session.status !== "complete") return null;
    const [lines, order, removed] = await Promise.all([
      getCheckoutLines(session.id),
      getOrderForCheckout(session.id),
      clearCheckedOutCart(session),
    ]);
    return { session, lines, order, removed };
  } catch (error) {
    console.error("Checkout confirmation failed", error);
    return null;
  }
}

async function Confirmation({
  searchParams,
}: {
  searchParams: PageProps<"/checkout/success">["searchParams"];
}) {
  // Stripe calls read the clock; this page is per request, never prerendered.
  await connection();
  const checkout = await loadCheckout((await searchParams).session_id);
  if (!checkout) return <NotFound />;

  const { session, lines, order, removed } = checkout;
  const products = await getProductsBySlugs(lines.map((l) => l.slug).filter(Boolean));
  const images = new Map(products.map((p) => [p.slug, p.images[0]]));

  const paid = session.payment_status !== "unpaid";
  const shipping = session.collected_information?.shipping_details ?? null;
  const fullName = shipping?.name ?? session.customer_details?.name ?? "";
  const firstName = fullName.trim().split(/\s+/)[0];
  const email = session.customer_details?.email;
  const rate =
    typeof session.shipping_cost?.shipping_rate === "object"
      ? session.shipping_cost.shipping_rate
      : null;
  const placedAt = order?.createdAt ?? new Date(session.created * 1000);
  const count = lines.reduce((n, l) => n + l.quantity, 0);

  return (
    <>
      {/* The header rendered the old bag count before the bag was cleared. */}
      {removed > 0 && <RefreshOnMount />}

      <header className="max-w-2xl animate-fade-up">
        <StatusMark paid={paid} />
        <p className="eyebrow mt-8">{paid ? "Order confirmed" : "Payment processing"}</p>
        <h1 className="mt-3">{firstName ? `Thank you, ${firstName}.` : "Thank you."}</h1>
        <p className="text-lead mt-5">
          {paid
            ? "Your order is in. We’ll pack it by hand and send tracking as soon as it leaves the atelier."
            : "Your payment is still clearing. We’ll start on your order the moment it does, and let you know by email."}
        </p>
      </header>

      <dl className="hairline-t hairline-b mt-12 grid animate-fade-up grid-cols-2 gap-x-6 gap-y-5 py-6 text-sm [animation-delay:60ms] sm:grid-cols-4 md:mt-14">
        <MetaItem label="Order">
          {order ? (
            <span className="font-mono text-[0.8125rem]">#{orderNumber(order.id)}</span>
          ) : (
            "Confirming…"
          )}
        </MetaItem>
        <MetaItem label="Placed">
          {placedAt.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </MetaItem>
        <MetaItem label="Payment">
          <span className={paid ? "text-success" : "text-clay"}>{paid ? "Paid" : "Processing"}</span>
        </MetaItem>
        {email && (
          <MetaItem label="Receipt to">
            <span className="break-all">{email}</span>
          </MetaItem>
        )}
      </dl>

      <div className="mt-12 grid gap-12 md:mt-16 lg:grid-cols-12 lg:gap-16">
        <section
          aria-labelledby="items-title"
          className="animate-fade-up [animation-delay:120ms] lg:col-span-7"
        >
          <h2 id="items-title" className="text-2xl">
            In your order <span className="text-ink-muted">({count})</span>
          </h2>
          <ul className="hairline-t mt-6">
            {lines.map((line) => (
              <OrderLine key={`${line.slug}-${line.name}`} line={line} image={images.get(line.slug)} />
            ))}
          </ul>

          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">Subtotal</dt>
              <dd className="tabular-nums">{formatPrice(session.amount_subtotal ?? 0)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">Shipping</dt>
              <dd className="tabular-nums">
                {session.shipping_cost?.amount_total
                  ? formatPrice(session.shipping_cost.amount_total)
                  : "Free"}
              </dd>
            </div>
            <div className="hairline-t flex items-baseline justify-between gap-4 pt-4">
              <dt className="font-medium">Total</dt>
              <dd className="font-serif text-2xl tabular-nums">
                {formatPrice(session.amount_total ?? 0)}
              </dd>
            </div>
          </dl>
        </section>

        <aside
          aria-label="Delivery"
          className="animate-fade-up self-start bg-paper-deep p-6 [animation-delay:180ms] md:p-8 lg:col-span-5"
        >
          {shipping && (
            <div>
              <h2 className="eyebrow">Delivering to</h2>
              <address className="mt-3 text-sm leading-relaxed not-italic">
                {formatAddress(shipping).map((row) => (
                  <span key={row} className="block">
                    {row}
                  </span>
                ))}
              </address>
            </div>
          )}
          {rate && (
            <div className={shipping ? "hairline-t mt-6 pt-6" : undefined}>
              <h2 className="eyebrow">Delivery</h2>
              <p className="mt-3 text-sm">{rate.display_name}</p>
              {rate.delivery_estimate && (
                <p className="text-meta mt-1 text-xs">{deliveryWindow(rate.delivery_estimate)}</p>
              )}
            </div>
          )}

          <div className="hairline-t mt-6 pt-6">
            <h2 className="eyebrow">What happens next</h2>
            <ol className="mt-4 space-y-4 text-sm">
              {nextSteps(paid).map((step, i) => (
                <li key={step.title} className="flex gap-4">
                  <span
                    aria-hidden="true"
                    className="flex size-6 shrink-0 items-center justify-center rounded-full border border-line-strong font-mono text-[0.6875rem]"
                  >
                    {i + 1}
                  </span>
                  <span>
                    <span className="block font-medium">{step.title}</span>
                    <span className="text-meta mt-0.5 block text-xs">{step.body}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </aside>
      </div>

      <div className="mt-14 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6 md:mt-20">
        <ButtonLink href="/shop/new">Continue shopping</ButtonLink>
        {session.metadata?.userId ? (
          <ButtonLink href="/account" variant="text">
            View your account
          </ButtonLink>
        ) : (
          <ButtonLink href="/" variant="text">
            Back to the atelier
          </ButtonLink>
        )}
      </div>
    </>
  );
}

function NotFound() {
  return (
    <div className="max-w-xl animate-fade-up">
      <p className="eyebrow">Checkout</p>
      <h1 className="mt-3">We couldn&rsquo;t find that order</h1>
      <p className="text-lead mt-5">
        The link may be incomplete. If you finished paying, a confirmation email is on its way.
      </p>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
        <ButtonLink href="/cart" variant="secondary">
          Return to your bag
        </ButtonLink>
        <ButtonLink href="/" variant="text">
          Back to the atelier
        </ButtonLink>
      </div>
    </div>
  );
}

function StatusMark({ paid }: { paid: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`flex size-12 items-center justify-center rounded-full ${
        paid ? "bg-moss text-ink-inverse" : "border border-line-strong text-ink"
      }`}
    >
      <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.5">
        {paid ? (
          <path d="m5 12.5 4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <>
            <circle cx="12" cy="12" r="8" />
            <path d="M12 8v4l2.5 2" strokeLinecap="round" strokeLinejoin="round" />
          </>
        )}
      </svg>
    </span>
  );
}

function MetaItem({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-meta text-xs">{label}</dt>
      <dd className="mt-1">{children}</dd>
    </div>
  );
}

function OrderLine({ line, image }: { line: CheckoutLine; image?: { src: string; alt: string } }) {
  const thumb = (
    <span className="media-well aspect-product block w-20 shrink-0 md:w-24">
      {image && <Image src={image.src} alt="" fill sizes="96px" className="object-cover" />}
    </span>
  );
  return (
    <li className="hairline-b flex gap-4 py-5 md:gap-6">
      {line.slug ? (
        <Link href={productHref(line.slug)} tabIndex={-1} aria-hidden="true">
          {thumb}
        </Link>
      ) : (
        thumb
      )}
      <div className="flex min-w-0 flex-1 justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium md:text-base">
            {line.slug ? (
              <Link href={productHref(line.slug)} className="link-nav">
                {line.name}
              </Link>
            ) : (
              line.name
            )}
          </p>
          <p className="text-meta mt-1 text-xs">
            {[line.size, `Qty ${line.quantity}`].filter(Boolean).join(" · ")}
          </p>
          {line.quantity > 1 && (
            <p className="text-meta mt-1 text-xs">{formatPrice(line.unitPriceCents)} each</p>
          )}
        </div>
        <p className="text-sm tabular-nums">{formatPrice(line.lineTotalCents)}</p>
      </div>
    </li>
  );
}

/** Short, human-readable reference from the order's uuid. */
function orderNumber(id: string) {
  return id.replaceAll("-", "").slice(0, 8).toUpperCase();
}

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

function formatAddress(shipping: Stripe.Checkout.Session.CollectedInformation.ShippingDetails) {
  const a = shipping.address;
  const cityLine = [a.city, [a.state, a.postal_code].filter(Boolean).join(" ")]
    .filter(Boolean)
    .join(", ");
  return [
    shipping.name,
    a.line1,
    a.line2,
    cityLine,
    a.country ? (regionNames.of(a.country) ?? a.country) : null,
  ].filter((row): row is string => Boolean(row));
}

function deliveryWindow(estimate: Stripe.ShippingRate.DeliveryEstimate) {
  const min = estimate.minimum?.value;
  const max = estimate.maximum?.value;
  if (min && max) return `Arrives in ${min}–${max} business days once shipped`;
  if (max) return `Arrives within ${max} business days once shipped`;
  return "We’ll email tracking once it ships";
}

function nextSteps(paid: boolean) {
  return [
    paid
      ? { title: "Confirmation", body: "A receipt is on its way to your inbox." }
      : { title: "Payment clears", body: "Usually within a few business days." },
    { title: "Prepared by hand", body: "Each order is packed at the atelier within 1–2 days." },
    { title: "On its way", body: "We’ll email tracking the moment it ships." },
  ];
}
