import type { ShippingAddress } from "@/db/schema";

/*
 * Redaction for the read-only demo admin. Applied in the admin queries, so
 * the real values never leave the server for a demo session.
 */

const HIDDEN = "•••";

/** "jordan.lee@example.com" → "jo•••@example.com" */
export function maskEmail(email: string) {
  const at = email.lastIndexOf("@");
  if (at < 1) return email ? HIDDEN : email;
  return `${email.slice(0, Math.min(2, at))}${HIDDEN}${email.slice(at)}`;
}

/** "Jordan Lee" → "J•••" */
export function maskName(name: string | null | undefined) {
  return name ? `${Array.from(name.trim())[0] ?? ""}${HIDDEN}` : name;
}

/** Keeps city, region and country; hides the street and postcode. */
export function maskAddress(address: ShippingAddress): ShippingAddress {
  return { ...address, line1: HIDDEN, line2: null, postalCode: HIDDEN };
}
