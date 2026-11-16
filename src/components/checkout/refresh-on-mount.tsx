"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Re-renders the route once after mount. Used when the page changed data the
 * header already rendered (the cart count), so it catches up.
 */
export function RefreshOnMount() {
  const router = useRouter();
  useEffect(() => router.refresh(), [router]);
  return null;
}
