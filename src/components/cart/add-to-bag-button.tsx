"use client";

import { useEffect, useState, useTransition } from "react";
import { addToCart } from "@/app/(store)/cart/actions";
import { Button } from "@/components/ui/button";
import { TextLink } from "@/components/ui/text-link";

/** How long the button reads "Added" before returning to "Add to bag". */
const ADDED_MS = 1800;

/** "Add to bag" for a product page; shows a confirmation or the reason it couldn't. */
export function AddToBagButton({ slug, soldOut }: { slug: string; soldOut: boolean }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  // Bumped on each success so the label and message replay their animation.
  const [addedAt, setAddedAt] = useState<number | null>(null);

  useEffect(() => {
    if (addedAt === null) return;
    const t = setTimeout(() => setAddedAt(null), ADDED_MS);
    return () => clearTimeout(t);
  }, [addedAt]);

  function onClick() {
    setMessage(null);
    startTransition(async () => {
      const result = await addToCart(slug);
      if (result.ok) {
        setMessage({ ok: true, text: "Added to your bag." });
        setAddedAt(Date.now());
      } else {
        setMessage({ ok: false, text: result.error });
      }
    });
  }

  const label = soldOut
    ? "Sold out"
    : pending
      ? "Adding…"
      : addedAt !== null
        ? "✓ Added"
        : "Add to bag";

  return (
    <div className="mt-6">
      <Button block onClick={onClick} disabled={soldOut || pending}>
        {/* Keyed so each label change fades in rather than snapping. */}
        <span key={label} className="inline-block animate-fade-in">
          {label}
        </span>
      </Button>
      {/* Announced to screen readers when it changes. */}
      <p aria-live="polite" className="mt-3 min-h-5 text-sm">
        {message && (
          <span key={addedAt ?? message.text} className="inline-block animate-fade-up">
            {message.ok ? (
              <span className="text-success">
                {message.text}{" "}
                <TextLink href="/cart" className="text-ink">
                  View bag
                </TextLink>
              </span>
            ) : (
              <span className="text-error">{message.text}</span>
            )}
          </span>
        )}
      </p>
    </div>
  );
}
