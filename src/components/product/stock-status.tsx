import { cn } from "@/lib/cn";
import type { StockStatus as Stock } from "@/lib/catalog";

const display = {
  in_stock: { dot: "bg-moss", text: "text-ink" },
  low_stock: { dot: "bg-clay", text: "text-clay" },
  out_of_stock: { dot: "bg-stone", text: "text-ink-muted" },
} as const;

export function stockLabel(stock: Stock) {
  switch (stock.state) {
    case "in_stock":
      return "In stock";
    case "low_stock":
      return `Only ${stock.remaining} left`;
    case "out_of_stock":
      return "Out of stock";
  }
}

/** Small dot + label. Colour reinforces the text, never replaces it. */
export function StockStatus({ stock, className }: { stock: Stock; className?: string }) {
  const { dot, text } = display[stock.state];
  return (
    <p className={cn("flex items-center gap-2 text-sm", text, className)}>
      <span aria-hidden="true" className={cn("size-2 rounded-full", dot)} />
      {stockLabel(stock)}
    </p>
  );
}
