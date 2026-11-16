/**
 * Where to send the user after signing in. Only same-site paths are allowed,
 * so a crafted `?next=https://evil.example` can't turn sign-in into an open
 * redirect. Safe to import anywhere.
 */
export function safeNext(value: unknown, fallback = "/account"): string {
  if (typeof value !== "string") return fallback;
  // "/path" is fine; "//host" and "/\host" are protocol-relative URLs.
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return fallback;
  }
  return value;
}
