import type { OrderStatus, ShippingAddress } from "@/db/schema";

/* Order display helpers. Pure, so safe to import anywhere. */

/** Short, human-readable reference from the order's uuid. */
export function orderNumber(id: string) {
  return id.replaceAll("-", "").slice(0, 8).toUpperCase();
}

export function orderHref(id: string) {
  return `/account/orders/${id}`;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Payment processing",
  paid: "Paid",
  payment_failed: "Payment failed",
};

export function formatOrderDate(date: Date) {
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

export function countryName(code: string) {
  return regionNames.of(code) ?? code;
}

/** Address as display lines, name first. */
export function addressLines(name: string | null, address: ShippingAddress) {
  const cityLine = [address.city, [address.state, address.postalCode].filter(Boolean).join(" ")]
    .filter(Boolean)
    .join(", ");
  return [name, address.line1, address.line2, cityLine, countryName(address.country)].filter(
    (row): row is string => Boolean(row),
  );
}
