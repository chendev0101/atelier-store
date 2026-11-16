import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { formatPrice } from "@/lib/catalog";
import { stripe } from "@/lib/stripe";

export const metadata: Metadata = { title: "Thank you", robots: { index: false } };

/*
 * Confirmation only. Orders, stock and the cart are handled by the Stripe
 * webhook: customers don't always reach this page after paying.
 */
export default function CheckoutSuccessPage({ searchParams }: PageProps<"/checkout/success">) {
  return (
    <Container width="narrow" className="pt-14 pb-24 md:pt-20">
      <Suspense fallback={<div aria-busy="true" className="min-h-60" />}>
        <Confirmation searchParams={searchParams} />
      </Suspense>
    </Container>
  );
}

async function Confirmation({
  searchParams,
}: {
  searchParams: PageProps<"/checkout/success">["searchParams"];
}) {
  // Stripe calls read the clock; this page is per request, never prerendered.
  await connection();
  const id = (await searchParams).session_id;
  const session =
    typeof id === "string" && id.startsWith("cs_")
      ? await stripe.checkout.sessions.retrieve(id).catch(() => null)
      : null;

  if (!session) {
    return (
      <>
        <p className="eyebrow">Checkout</p>
        <h1 className="mt-3">We couldn&rsquo;t find that order</h1>
        <p className="text-lead mt-4">If you completed a payment, a confirmation email is on its way.</p>
        <ButtonLink href="/" variant="secondary" className="mt-8">
          Back to the atelier
        </ButtonLink>
      </>
    );
  }

  const paid = session.payment_status !== "unpaid";
  const email = session.customer_details?.email;

  return (
    <>
      <p className="eyebrow">{paid ? "Order received" : "Payment processing"}</p>
      <h1 className="mt-3">Thank you</h1>
      <p className="text-lead mt-4">
        {paid
          ? "Your order is confirmed and we're preparing it now."
          : "Your payment is still processing. We'll email you as soon as it clears."}
      </p>

      <dl className="hairline-t mt-10 divide-y divide-line text-sm">
        {email && (
          <div className="flex justify-between gap-6 py-4">
            <dt className="text-ink-muted">Confirmation sent to</dt>
            <dd className="break-all">{email}</dd>
          </div>
        )}
        {session.amount_total !== null && (
          <div className="flex justify-between gap-6 py-4">
            <dt className="text-ink-muted">Total paid</dt>
            <dd className="tabular-nums">{formatPrice(session.amount_total)}</dd>
          </div>
        )}
      </dl>

      <ButtonLink href="/shop/new" variant="secondary" className="mt-10">
        Continue shopping
      </ButtonLink>
    </>
  );
}
