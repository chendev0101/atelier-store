"use client";

import { useActionState } from "react";
import { type CheckoutState, startCheckout } from "@/app/checkout/actions";
import { Button } from "@/components/ui/button";

/** Sends the bag to Stripe Checkout; shows why if it can't. */
export function CheckoutButton({ disabled }: { disabled?: boolean }) {
  const [state, action, pending] = useActionState<CheckoutState>(startCheckout, null);

  return (
    <form action={action} className="mt-6">
      <Button type="submit" block disabled={disabled || pending}>
        <span key={pending ? "p" : "i"} className="inline-block animate-fade-in">
          {pending ? "Redirecting to checkout…" : "Checkout"}
        </span>
      </Button>
      {state?.error && (
        <p role="alert" className="mt-3 animate-fade-up text-center text-xs text-error">
          {state.error}
        </p>
      )}
    </form>
  );
}
