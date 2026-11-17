"use client";

import { useActionState, useState } from "react";
import { SubmitButton } from "@/components/admin/submit-button";
import { cn } from "@/lib/cn";
import { adjustStock } from "./actions";

type Reason = "restock" | "correction" | "damage";

/** Reasons that make sense for a change's sign; the server enforces the same rule. */
function allowed(reason: Reason, sign: number) {
  if (sign < 0) return reason !== "restock";
  if (sign > 0) return reason !== "damage";
  return true;
}

/**
 * Relative stock change (+12 restock, -2 damaged…) with a reason. The
 * current quantity rides along so the server can refuse a stale change.
 * The reason follows the sign: typing -2 moves it off "Restock".
 */
export function StockAdjuster({
  productId,
  productName,
  quantity,
  layout = "row",
}: {
  productId: string;
  productName: string;
  quantity: number;
  layout?: "row" | "stacked";
}) {
  const [state, action] = useActionState(adjustStock, null);
  const id = (field: string) => `${field}-${productId}`;
  const stacked = layout === "stacked";
  const [sign, setSign] = useState(0);
  // The admin's own pick, kept while it fits the sign; otherwise a sensible default.
  const [picked, setPicked] = useState<Reason | null>(null);
  const reason: Reason =
    picked && allowed(picked, sign) ? picked : sign < 0 ? "correction" : "restock";

  return (
    <form
      action={action}
      // React resets the form after a successful submit; start the next one fresh.
      onReset={() => {
        setSign(0);
        setPicked(null);
      }}
      className="space-y-2"
    >
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="expected" value={quantity} />
      <div className={cn("flex flex-wrap items-end gap-2", stacked && "grid grid-cols-2")}>
        <div>
          <label htmlFor={id("delta")} className={cn("text-meta block text-xs", !stacked && "sr-only")}>
            {stacked ? (
              <>
                Change<span className="sr-only"> for {productName}</span>
              </>
            ) : (
              `Change for ${productName}`
            )}
          </label>
          <input
            id={id("delta")}
            name="delta"
            type="number"
            step={1}
            inputMode="numeric"
            placeholder="+12 or -2"
            required
            onChange={(e) => setSign(Math.sign(Number(e.target.value) || 0))}
            aria-invalid={state?.fieldErrors?.delta ? true : undefined}
            className={cn("field-box py-1.5 tabular-nums", stacked ? "w-full" : "w-28")}
          />
        </div>
        <div>
          <label htmlFor={id("reason")} className={cn("text-meta block text-xs", !stacked && "sr-only")}>
            Reason
          </label>
          <select
            id={id("reason")}
            name="reason"
            value={reason}
            onChange={(e) => setPicked(e.target.value as Reason)}
            className={cn("field-box py-1.5", stacked ? "w-full" : "w-auto")}
          >
            <option value="restock" disabled={!allowed("restock", sign)}>
              Restock
            </option>
            <option value="correction">Count correction</option>
            <option value="damage" disabled={!allowed("damage", sign)}>
              Damaged
            </option>
          </select>
        </div>
        <div className={cn(stacked && "col-span-2")}>
          <label htmlFor={id("note")} className={cn("text-meta block text-xs", !stacked && "sr-only")}>
            Note
          </label>
          <input
            id={id("note")}
            name="note"
            maxLength={200}
            placeholder="Note (optional)"
            className={cn("field-box py-1.5", stacked ? "w-full" : "w-44")}
          />
        </div>
        <SubmitButton size="sm" variant="secondary" pendingLabel="Saving…" className="min-h-9">
          Apply
        </SubmitButton>
      </div>
      <div aria-live="polite" className="min-h-4 text-xs">
        {state?.error ? (
          <p role="alert" className="text-error">
            {state.error}
          </p>
        ) : state?.success ? (
          <p className="animate-fade-up text-success">{state.success}</p>
        ) : null}
      </div>
    </form>
  );
}
