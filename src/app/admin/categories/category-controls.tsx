"use client";

import { useActionState, useState } from "react";
import { FormMessage } from "@/components/admin/form-message";
import { Button } from "@/components/ui/button";
import type { FormState } from "@/lib/admin-form";
import { deleteCategory, moveCategory } from "./actions";

/** ↑ / ↓ buttons for one row of the category list. */
export function MoveButtons({ id, name, first, last }: { id: string; name: string; first: boolean; last: boolean }) {
  const [state, act, pending] = useActionState<FormState, "up" | "down">(
    (_prev, direction) => moveCategory(id, direction),
    null,
  );
  return (
    <div className="flex items-center justify-end gap-1">
      <form action={() => act("up")}>
        <Button type="submit" variant="secondary" size="sm" className="min-h-8 px-2.5" disabled={first || pending} aria-label={`Move ${name} up`}>
          ↑
        </Button>
      </form>
      <form action={() => act("down")}>
        <Button type="submit" variant="secondary" size="sm" className="min-h-8 px-2.5" disabled={last || pending} aria-label={`Move ${name} down`}>
          ↓
        </Button>
      </form>
      {state?.error && <span role="alert" className="ml-2 text-xs text-error">{state.error}</span>}
    </div>
  );
}

/** Delete with a confirming second click; only offered for empty categories. */
export function DeleteCategory({ id, productCount }: { id: string; productCount: number }) {
  const [state, act, pending] = useActionState<FormState>(() => deleteCategory(id), null);
  const [confirming, setConfirming] = useState(false);

  if (productCount > 0) {
    return (
      <p className="text-meta text-xs">
        This category has {productCount} {productCount === 1 ? "product" : "products"}. Move them
        to another category before deleting it.
      </p>
    );
  }
  return (
    <div className="space-y-3">
      {confirming ? (
        <form action={act} className="flex flex-wrap gap-2">
          <Button type="submit" size="sm" variant="danger" disabled={pending}>
            Confirm delete
          </Button>
          <Button size="sm" variant="text" arrow={false} onClick={() => setConfirming(false)}>
            Cancel
          </Button>
        </form>
      ) : (
        <Button size="sm" variant="danger" onClick={() => setConfirming(true)}>
          Delete category
        </Button>
      )}
      <FormMessage error={state?.error} />
    </div>
  );
}
