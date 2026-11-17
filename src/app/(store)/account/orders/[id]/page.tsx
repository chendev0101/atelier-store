import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { type ReactNode, Suspense } from "react";
import { OrderLine } from "@/components/orders/order-line";
import { OrderStatus } from "@/components/orders/order-status";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { TextLink } from "@/components/ui/text-link";
import { getCustomerOrder } from "@/db/queries/orders";
import { auth } from "@/lib/auth";
import { formatPrice } from "@/lib/catalog";
import { addressLines, formatOrderDate, orderNumber } from "@/lib/orders";

export const metadata: Metadata = { title: "Order", robots: { index: false } };

/* Per customer, so everything below the shell renders in <Suspense>. */
export default function OrderPage({ params }: PageProps<"/account/orders/[id]">) {
  return (
    <Container className="pt-6 pb-20 md:pt-8 md:pb-28">
      <Suspense fallback={<OrderSkeleton />}>
        <OrderDetails params={params} />
      </Suspense>
    </Container>
  );
}

function OrderSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading your order">
      <div className="h-4 w-40 bg-sand/60" />
      <div className="mt-10 h-12 max-w-sm bg-sand/60" />
      <div className="mt-12 min-h-80 bg-paper-deep" />
    </div>
  );
}

async function OrderDetails({ params }: { params: PageProps<"/account/orders/[id]">["params"] }) {
  // Session checks read the clock; keep this out of every prerender.
  await connection();
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect(`/sign-in?next=${encodeURIComponent(`/account/orders/${id}`)}`);

  // Scoped by user id: someone else's order looks exactly like a missing one.
  const order = await getCustomerOrder(session.user.id, id);
  if (!order) notFound();

  const number = orderNumber(order.id);
  const count = order.items.reduce((n, i) => n + i.quantity, 0);

  return (
    <>
      <nav aria-label="Breadcrumb" className="text-meta">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <TextLink variant="nav" href="/account">
              Account
            </TextLink>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-ink">
            Order #{number}
          </li>
        </ol>
      </nav>

      <header className="mt-10 animate-fade-up md:mt-14">
        <p className="eyebrow">Order</p>
        <h1 className="mt-3">
          <span className="sr-only">Order </span>#{number}
        </h1>
        {order.status !== "paid" && (
          <p className="text-lead mt-5 max-w-2xl">
            {order.status === "pending"
              ? "Your payment is still clearing. We’ll start on your order the moment it does."
              : "Your payment didn’t go through, so this order won’t ship. Nothing was charged."}
          </p>
        )}
      </header>

      <dl className="hairline-t hairline-b mt-10 grid animate-fade-up grid-cols-2 gap-x-6 gap-y-5 py-6 text-sm [animation-delay:60ms] sm:grid-cols-4 md:mt-12">
        <MetaItem label="Placed">{formatOrderDate(order.createdAt)}</MetaItem>
        <MetaItem label="Payment">
          <OrderStatus status={order.status} />
        </MetaItem>
        <MetaItem label="Items">{count}</MetaItem>
        <MetaItem label="Total">
          <span className="tabular-nums">{formatPrice(order.totalCents)}</span>
        </MetaItem>
      </dl>

      <div className="mt-12 grid gap-12 md:mt-16 lg:grid-cols-12 lg:gap-16">
        <section
          aria-labelledby="items-title"
          className="animate-fade-up [animation-delay:120ms] lg:col-span-7"
        >
          <h2 id="items-title" className="text-2xl">
            Items <span className="text-ink-muted">({count})</span>
          </h2>
          <ul className="hairline-t mt-6">
            {order.items.map((item) => (
              <OrderLine key={`${item.slug}-${item.name}`} line={item} image={item.image} />
            ))}
          </ul>

          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">Subtotal</dt>
              <dd className="tabular-nums">{formatPrice(order.subtotalCents)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">Shipping</dt>
              <dd className="tabular-nums">
                {order.shippingCents ? formatPrice(order.shippingCents) : "Free"}
              </dd>
            </div>
            <div className="hairline-t flex items-baseline justify-between gap-4 pt-4">
              <dt className="font-medium">Total</dt>
              <dd className="font-serif text-2xl tabular-nums">{formatPrice(order.totalCents)}</dd>
            </div>
          </dl>
        </section>

        <aside
          aria-label="Delivery"
          className="animate-fade-up self-start bg-paper-deep p-6 [animation-delay:180ms] md:p-8 lg:col-span-5"
        >
          {order.shippingAddress && (
            <div>
              <h2 className="eyebrow">Delivering to</h2>
              <address className="mt-3 text-sm leading-relaxed not-italic">
                {addressLines(order.shippingName, order.shippingAddress).map((row) => (
                  <span key={row} className="block">
                    {row}
                  </span>
                ))}
              </address>
            </div>
          )}
          {order.shippingMethod && (
            <div className={order.shippingAddress ? "hairline-t mt-6 pt-6" : undefined}>
              <h2 className="eyebrow">Delivery</h2>
              <p className="mt-3 text-sm">{order.shippingMethod}</p>
            </div>
          )}
          <div
            className={
              order.shippingAddress || order.shippingMethod ? "hairline-t mt-6 pt-6" : undefined
            }
          >
            <h2 className="eyebrow">Receipt</h2>
            <p className="mt-3 text-sm break-all">{order.email}</p>
          </div>
        </aside>
      </div>

      <div className="mt-14 md:mt-20">
        <ButtonLink href="/account" variant="secondary">
          Back to your account
        </ButtonLink>
      </div>
    </>
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
