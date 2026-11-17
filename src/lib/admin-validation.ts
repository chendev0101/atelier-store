import { z } from "zod";
import { PRODUCT_STATUSES } from "@/db/schema";
import {
  type FieldErrors,
  isAllowedImageUrl,
  MAX_IMAGES,
  MAX_STOCK,
  SLUG_PATTERN,
} from "@/lib/admin-form";

/* Zod schemas for admin Server Actions. Limits and helpers live in admin-form.ts. */

const text = (max: number, label: string) =>
  z.string().trim().min(1, `${label} is required.`).max(max, `${label} is too long.`);

const imageSchema = z.object({
  src: z
    .string()
    .trim()
    .refine(isAllowedImageUrl, "Use an https://images.unsplash.com/photo-… URL without a query string."),
  alt: text(200, "Alt text"),
});

export const slugSchema = z
  .string()
  .trim()
  .min(1, "Slug is required.")
  .max(80, "Slug is too long.")
  .regex(SLUG_PATTERN, "Use lowercase letters, numbers and single hyphens.");

export const productSchema = z.object({
  name: text(120, "Name"),
  slug: slugSchema,
  categoryId: z.uuid("Choose a category."),
  tagline: text(160, "Tagline"),
  description: text(2000, "Description"),
  howToUse: text(2000, "How to use"),
  priceCents: z
    .string()
    .trim()
    .regex(/^\d{1,6}(\.\d{1,2})?$/, "Enter a price like 48 or 48.50.")
    .transform((v) => Math.round(Number(v) * 100))
    .refine((v) => v > 0, "Price must be more than $0."),
  size: text(40, "Size"),
  badge: z.string().trim().max(24, "Badge is too long.").transform((v) => v || null),
  isNew: z.boolean(),
  status: z.enum(PRODUCT_STATUSES),
  images: z
    .array(imageSchema)
    .min(1, "Add at least one image.")
    .max(MAX_IMAGES, `Up to ${MAX_IMAGES} images.`),
  keyIngredients: z.array(z.string().trim().min(1).max(60)).max(12, "Up to 12 ingredients."),
});

export const initialStockSchema = z.coerce
  .number({ error: "Enter a whole number." })
  .int("Enter a whole number.")
  .min(0, "Stock can't be negative.")
  .max(MAX_STOCK, "That's more than we can store.");

/** First message per field, keyed by the field's top-level path ("images" for any image). */
export function fieldErrorsFrom(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path.length > 1 ? issue.path.join(".") : String(issue.path[0] ?? "form");
    out[key] ??= issue.message;
  }
  return out;
}
