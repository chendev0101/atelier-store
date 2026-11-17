"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/admin/submit-button";
import { cn } from "@/lib/cn";
import { adjustStock } from "./actions";

/**
 * Relative stock change (+12 restock, -2 damaged…) with a reason. The
 * current quantity rides along so the server can refuse a stale change.
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

  return (
    <form action={action} className="space-y-2">
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
            defaultValue="restock"
            className={cn("field-box py-1.5", stacked ? "w-full" : "w-auto")}
          >
            <option value="restock">Restock</option>
            <option value="correction">Count correction</option>
            <option value="damage">Damaged</option>
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
