import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { type ReactNode, Suspense } from "react";
import { PageHeader } from "@/components/admin/page-header";
import { OrderLine } from "@/components/orders/order-line";
import { OrderStatus } from "@/components/orders/order-status";
import { getAdminOrder } from "@/db/queries/admin/orders";
import { formatPrice } from "@/lib/catalog";
import { requireAdmin } from "@/lib/dal";
import { addressLines, orderNumber } from "@/lib/orders";

export const metadata: Metadata = { title: "Order" };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function AdminOrderPage({ params }: PageProps<"/admin/orders/[id]">) {
  return (
    <Suspense fallback={<div aria-busy="true" className="min-h-96" />}>
      <AdminOrder params={params} />
    </Suspense>
  );
}

/** Stripe Dashboard link; sandbox sessions live under /test. */
function stripePaymentUrl(sessionId: string, paymentIntentId: string | null) {
  const base = `https://dashboard.stripe.com/${sessionId.startsWith("cs_test_") ? "test/" : ""}`;
  return paymentIntentId ? `${base}payments/${paymentIntentId}` : `${base}checkout/sessions/${sessionId}`;
}

async function AdminOrder({ params }: { params: PageProps<"/admin/orders/[id]">["params"] }) {
  const { id } = await params;
  await requireAdmin(`/admin/orders/${id}`);
  if (!UUID.test(id)) notFound();
  const order = await getAdminOrder(id);
  if (!order) notFound();

  const count = order.items.reduce((n, i) => n + i.quantity, 0);
  const dateTime = (d: Date) =>
    d.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });

  return (
    <>
      <PageHeader
        eyebrow={
          <Link href="/admin/orders" className="link-nav">
            ← Orders
          </Link>
        }
        title={<span className="font-mono text-3xl md:text-4xl">#{orderNumber(order.id)}</span>}
        description={
          <span className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <OrderStatus status={order.status} />
            <span>Placed {dateTime(order.createdAt)}</span>
          </span>
        }
      />

      <div className="grid gap-12 xl:grid-cols-12 xl:gap-16">
        <section aria-labelledby="items-title" className="xl:col-span-7">
          <h2 id="items-title" className="text-2xl">
            Items <span className="text-ink-muted">({count})</span>
          </h2>
          <ul className="hairline-t mt-4">
            {order.items.map((item) => (
              <OrderLine key={`${item.slug}-${item.name}`} line={item} image={item.image} />
            ))}
          </ul>
          <dl className="mt-6 space-y-3 text-sm">
            <Row label="Subtotal">{formatPrice(order.subtotalCents)}</Row>
            <Row label={`Shipping${order.shippingMethod ? ` · ${order.shippingMethod}` : ""}`}>
              {order.shippingCents ? formatPrice(order.shippingCents) : "Free"}
            </Row>
            <div className="hairline-t flex items-baseline justify-between gap-4 pt-4">
              <dt className="font-medium">Total</dt>
              <dd className="font-serif text-2xl tabular-nums">{formatPrice(order.totalCents)}</dd>
            </div>
          </dl>
        </section>

        <aside className="space-y-6 xl:col-span-5">
          <Panel title="Customer">
            {order.customer ? (
              <>
                <p>{order.customer.name}</p>
                <p className="break-all text-ink-muted">{order.customer.email}</p>
                <p className="text-meta mt-2 text-xs">Signed-in customer</p>
              </>
            ) : (
              <>
                <p className="break-all">{order.email || "No email recorded"}</p>
                <p className="text-meta mt-2 text-xs">Guest checkout</p>
              </>
            )}
            {order.customer && order.email !== order.customer.email && order.email && (
              <p className="text-meta mt-2 text-xs">Receipt sent to {order.email}</p>
            )}
          </Panel>

          <Panel title="Ship to">
            {order.shippingAddress ? (
              <address className="leading-relaxed not-italic">
                {addressLines(order.shippingName, order.shippingAddress).map((row) => (
                  <span key={row} className="block">
                    {row}
                  </span>
                ))}
              </address>
            ) : (
              <p className="text-ink-muted">No address recorded.</p>
            )}
          </Panel>

          <Panel title="Payment">
            <dl className="space-y-2">
              <Row label="Status">
                <OrderStatus status={order.status} />
              </Row>
              {order.paidAt && <Row label="Paid">{dateTime(order.paidAt)}</Row>}
              <Row label="Stock taken">
                {order.stockDeductedAt ? dateTime(order.stockDeductedAt) : "Not yet"}
              </Row>
            </dl>
            <a
              href={stripePaymentUrl(order.stripeCheckoutSessionId, order.stripePaymentIntentId)}
              target="_blank"
              rel="noreferrer"
              className="link-nav mt-4 inline-block text-xs"
            >
              Open in Stripe Dashboard ↗
            </a>
          </Panel>
        </aside>
      </div>
    </>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="hairline p-5 text-sm">
      <h2 className="eyebrow mb-3">{title}</h2>
      {children}
    </section>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="text-right tabular-nums">{children}</dd>
    </div>
  );
}
