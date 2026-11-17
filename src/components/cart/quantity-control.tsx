"use client";

import { useState, useTransition } from "react";
import { updateCartItem } from "@/app/(store)/cart/actions";
import { cn } from "@/lib/cn";
import { MAX_LINE_QUANTITY } from "@/lib/cart";

type Props = { slug: string; name: string; quantity: number; available: number };

/** − / + stepper and Remove link for one cart line. */
export function QuantityControl({ slug, name, quantity, available }: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const max = Math.min(available, MAX_LINE_QUANTITY);

  function set(next: number) {
    setError(null);
    startTransition(async () => {
      const result = await updateCartItem(slug, next);
      if (!result.ok) setError(result.error);
    });
  }

  const step =
    "flex size-10 items-center justify-center text-lg leading-none transition-colors hover:bg-paper-deep disabled:cursor-not-allowed disabled:text-ink-subtle disabled:hover:bg-transparent";

  return (
    <div className={cn("transition-opacity", pending && "opacity-60")}>
      <div className="flex items-center gap-5">
        <div className="hairline inline-flex items-center" role="group" aria-label={`Quantity of ${name}`}>
          <button
            type="button"
            className={step}
            onClick={() => set(quantity - 1)}
            disabled={pending}
            aria-label={quantity === 1 ? `Remove ${name}` : `Decrease quantity of ${name}`}
          >
            −
          </button>
          <span className="w-8 text-center text-sm tabular-nums" aria-live="polite">
            {/* Keyed so the new number fades in. */}
            <span key={quantity} className="inline-block animate-fade-in">
              {quantity}
            </span>
          </span>
          <button
            type="button"
            className={step}
            onClick={() => set(quantity + 1)}
            disabled={pending || quantity >= max}
            aria-label={`Increase quantity of ${name}`}
          >
            +
          </button>
        </div>
        <button
          type="button"
          className="link-nav text-xs text-ink-muted"
          onClick={() => set(0)}
          disabled={pending}
        >
          Remove
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-2 animate-fade-up text-xs text-error">
          {error}
        </p>
      )}
    </div>
  );
}
