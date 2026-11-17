"use client";

import { useActionState, useState } from "react";
import { FormMessage } from "@/components/admin/form-message";
import { Button } from "@/components/ui/button";
import type { ProductStatus } from "@/db/schema";
import type { FormState } from "@/lib/admin-form";
import { setProductStatus } from "./actions";

/** Publish / unpublish / archive buttons. Archiving asks for a second click. */
export function StatusActions({ id, status }: { id: string; status: ProductStatus }) {
  const [state, act, pending] = useActionState<FormState, ProductStatus>(
    (_prev, next) => setProductStatus(id, next),
    null,
  );
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {status !== "active" && (
          <form action={() => act("active")}>
            <Button type="submit" size="sm" disabled={pending}>
              Publish
            </Button>
          </form>
        )}
        {status === "active" && (
          <form action={() => act("draft")}>
            <Button type="submit" size="sm" variant="secondary" disabled={pending}>
              Unpublish
            </Button>
          </form>
        )}
        {status !== "archived" &&
          (confirming ? (
            <form action={() => act("archived")} className="flex gap-2">
              <Button type="submit" size="sm" variant="danger" disabled={pending}>
                Confirm archive
              </Button>
              <Button size="sm" variant="text" onClick={() => setConfirming(false)}>
                Cancel
              </Button>
            </form>
          ) : (
            <Button size="sm" variant="danger" onClick={() => setConfirming(true)}>
              Archive
            </Button>
          ))}
      </div>
      <FormMessage error={state?.error} success={state?.success} />
    </div>
  );
}
