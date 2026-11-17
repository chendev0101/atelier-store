import type { OrderStatus as Status } from "@/db/schema";
import { cn } from "@/lib/cn";
import { ORDER_STATUS_LABELS } from "@/lib/orders";

const display: Record<Status, { dot: string; text: string }> = {
  paid: { dot: "bg-moss", text: "text-ink" },
  pending: { dot: "bg-clay", text: "text-clay" },
  payment_failed: { dot: "bg-error", text: "text-error" },
};

/** Small dot + label, like StockStatus. Colour reinforces the text, never replaces it. */
export function OrderStatus({ status, className }: { status: Status; className?: string }) {
  const { dot, text } = display[status];
  return (
    <span className={cn("inline-flex items-center gap-2", text, className)}>
      <span aria-hidden="true" className={cn("size-2 shrink-0 rounded-full", dot)} />
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}
