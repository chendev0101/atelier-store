import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { OrderStatus } from "@/components/orders/order-status";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { getCustomerOrders } from "@/db/queries/orders";
import { auth } from "@/lib/auth";
import { formatPrice } from "@/lib/catalog";
import { formatOrderDate, orderHref, orderNumber } from "@/lib/orders";

export const metadata: Metadata = { title: "Account", robots: { index: false } };

/* Session-dependent, so the details render in <Suspense>. */
export default function AccountPage() {
  return (
    <Container width="narrow" className="pt-14 pb-24 md:pt-20">
      <p className="eyebrow">Your account</p>
      <Suspense fallback={<div aria-busy="true" className="min-h-60" />}>
        <AccountDetails />
      </Suspense>
    </Container>
  );
}

async function AccountDetails() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in?next=/account");
  const { user } = session;
  const orders = await getCustomerOrders(user.id);

  return (
    <>
      <h1 className="mt-3">Hello, {user.name}</h1>

      <dl className="hairline-t mt-10 divide-y divide-line">
        <div className="flex justify-between gap-6 py-4 text-sm">
          <dt className="text-ink-muted">Name</dt>
          <dd>{user.name}</dd>
        </div>
        <div className="flex justify-between gap-6 py-4 text-sm">
          <dt className="text-ink-muted">Email</dt>
          <dd className="break-all">{user.email}</dd>
        </div>
      </dl>

      <section aria-labelledby="orders-title" className="mt-14">
        <h2 id="orders-title" className="text-xl md:text-2xl">
          Orders {orders.length > 0 && <span className="text-ink-muted">({orders.length})</span>}
        </h2>
        {orders.length === 0 ? (
          <>
            <p className="text-meta mt-3">You haven&rsquo;t placed any orders yet.</p>
            <ButtonLink href="/shop/new" variant="text" className="mt-4 text-sm">
              Shop new formulations
            </ButtonLink>
          </>
        ) : (
          <ul className="hairline-t mt-6">
            {orders.map((order) => (
              <li key={order.id} className="hairline-b">
                <Link
                  href={orderHref(order.id)}
                  className="group flex items-center gap-4 py-5 transition-colors hover:bg-paper-deep/60 sm:-mx-3 sm:gap-8 sm:px-3"
                >
                  <div className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_auto] gap-x-4 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_auto] sm:items-center sm:gap-8">
                    <div>
                      <p className="font-mono text-[0.8125rem]">
                        <span className="sr-only">Order </span>#{orderNumber(order.id)}
                      </p>
                      <p className="text-meta mt-1 text-xs">
                        {formatOrderDate(order.createdAt)} · {order.itemCount}{" "}
                        {order.itemCount === 1 ? "item" : "items"}
                      </p>
                    </div>
                    <OrderStatus
                      status={order.status}
                      className="order-3 col-span-2 mt-2 text-sm sm:order-2 sm:col-span-1 sm:mt-0"
                    />
                    <p className="order-2 text-right text-sm tabular-nums sm:order-3">
                      {formatPrice(order.totalCents)}
                    </p>
                  </div>
                  <span
                    aria-hidden="true"
                    className="text-ink-muted transition-transform group-hover:translate-x-1 group-hover:text-ink"
                  >
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="mt-14">
        <SignOutButton />
      </div>
    </>
  );
}
