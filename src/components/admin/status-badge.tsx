import type { ProductStatus } from "@/db/schema";
import { cn } from "@/lib/cn";

const display: Record<ProductStatus, { label: string; dot: string; text: string }> = {
  active: { label: "Active", dot: "bg-moss", text: "text-ink" },
  draft: { label: "Draft", dot: "bg-stone", text: "text-ink-muted" },
  archived: { label: "Archived", dot: "bg-clay", text: "text-clay" },
};

/** Product status as a dot + label; colour reinforces the text. */
export function ProductStatusBadge({ status, className }: { status: ProductStatus; className?: string }) {
  const { label, dot, text } = display[status];
  return (
    <span className={cn("inline-flex items-center gap-2 whitespace-nowrap", text, className)}>
      <span aria-hidden="true" className={cn("size-2 shrink-0 rounded-full", dot)} />
      {label}
    </span>
  );
}

export function productStatusLabel(status: ProductStatus) {
  return display[status].label;
}
