"use server";

import { eq, sql } from "drizzle-orm";
import { refresh, updateTag } from "next/cache";
import { db } from "@/db";
import { inventory } from "@/db/schema";
import type { FormState } from "@/lib/admin-form";
import { fieldErrorsFrom, stockAdjustmentSchema } from "@/lib/admin-validation";
import { authorizeAdminWrite } from "@/lib/dal";

/**
 * Apply a relative stock change and record it, in one statement. It only
 * applies if stock still equals what the admin saw (`expected`), so an
 * order paid in the meantime is never overwritten, and never below zero.
 */
export async function adjustStock(_prev: FormState, formData: FormData): Promise<FormState> {
  const guard = await authorizeAdminWrite();
  if (!guard.ok) return { error: guard.error };
  const { actor } = guard;

  const parsed = stockAdjustmentSchema.safeParse({
    productId: formData.get("productId"),
    delta: formData.get("delta"),
    reason: formData.get("reason"),
    note: formData.get("note") ?? "",
    expected: formData.get("expected"),
  });
  if (!parsed.success) {
    const fieldErrors = fieldErrorsFrom(parsed.error);
    return { error: fieldErrors.delta ?? fieldErrors.reason ?? fieldErrors.note ?? "Check the values.", fieldErrors };
  }
  const { productId, delta, reason, note, expected } = parsed.data;

  const result = await db.execute<{ quantity_after: number }>(sql`
    with updated as (
      update inventory
      set quantity = quantity + ${delta}, updated_at = now()
      where product_id = ${productId}
        and quantity = ${expected}
        and quantity + ${delta} >= 0
      returning product_id, quantity
    )
    insert into inventory_adjustments (product_id, delta, reason, note, quantity_after, actor_user_id)
    select product_id, ${delta}, ${reason}, ${note}, quantity, ${actor.id} from updated
    returning quantity_after
  `);

  const applied = result.rows[0];
  if (!applied) {
    const current = await db.query.inventory.findFirst({
      columns: { quantity: true },
      where: eq(inventory.productId, productId),
    });
    if (!current) return { error: "This product has no stock record." };
    if (current.quantity !== expected) {
      refresh();
      return {
        error: `Stock changed to ${current.quantity} since this page loaded (an order may have come in). Check the number and try again.`,
      };
    }
    return { error: `That would take stock below zero (${current.quantity} on hand).` };
  }

  updateTag("catalog");
  refresh();
  return { success: `Stock is now ${applied.quantity_after}.` };
}
