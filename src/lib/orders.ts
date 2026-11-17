/* Order display helpers. Pure, so safe to import anywhere. */

/** Short, human-readable reference from the order's uuid. */
export function orderNumber(id: string) {
  return id.replaceAll("-", "").slice(0, 8).toUpperCase();
}

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

export function countryName(code: string) {
  return regionNames.of(code) ?? code;
}
