/*
 * Admin form limits and helpers. No schema or zod imports, so client
 * components can use them without pulling server code into the bundle.
 */

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const MAX_IMAGES = 6;
export const MAX_STOCK = 100_000;

export function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** next.config.ts only allows Unsplash photos for next/image. */
export function isAllowedImageUrl(value: string) {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname === "images.unsplash.com" &&
      url.pathname.startsWith("/photo-") &&
      !url.search
    );
  } catch {
    return false;
  }
}

export type FieldErrors = Partial<Record<string, string>>;

export type FormState = {
  error?: string;
  success?: string;
  fieldErrors?: FieldErrors;
  /** Submitted values, echoed back so a failed submit doesn't clear the form. */
  values?: Record<string, string>;
} | null;
