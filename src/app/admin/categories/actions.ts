"use server";

import { and, asc, eq, notExists } from "drizzle-orm";
import { refresh, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { type FormState, slugify } from "@/lib/admin-form";
import { categorySchema, fieldErrorsFrom } from "@/lib/admin-validation";
import { authorizeAdminWrite } from "@/lib/dal";
import { isUniqueViolation } from "@/lib/db-errors";

/* Every action checks the admin role first, before reading any input. */

const SLUG_TAKEN = "Another category already uses this slug.";

function echo(formData: FormData): Record<string, string> {
  const values: Record<string, string> = {};
  for (const [key, value] of formData) {
    if (typeof value === "string" && !key.startsWith("$")) values[key] = value;
  }
  return values;
}

function readCategory(formData: FormData) {
  const str = (key: string) => String(formData.get(key) ?? "");
  return {
    name: str("name"),
    slug: str("slug").trim() || slugify(str("name")),
    note: str("note"),
    image: { src: str("imageSrc"), alt: str("imageAlt") },
    contextImage: { src: str("contextImageSrc"), alt: str("contextImageAlt") },
  };
}

/** Field names in the form are flat (imageSrc); the schema's are nested (image.src). */
function formFieldErrors(error: z.ZodError) {
  const errors = fieldErrorsFrom(error);
  const map: Record<string, string> = {
    "image.src": "imageSrc",
    "image.alt": "imageAlt",
    "contextImage.src": "contextImageSrc",
    "contextImage.alt": "contextImageAlt",
  };
  return Object.fromEntries(Object.entries(errors).map(([k, v]) => [map[k] ?? k, v]));
}

export async function createCategory(_prev: FormState, formData: FormData): Promise<FormState> {
  const guard = await authorizeAdminWrite();
  if (!guard.ok) return { error: guard.error };
  const parsed = categorySchema.safeParse(readCategory(formData));
  if (!parsed.success) {
    return {
      error: "Please fix the highlighted fields.",
      fieldErrors: formFieldErrors(parsed.error),
      values: echo(formData),
    };
  }

  let id: string;
  try {
    // New categories go last.
    const last = await db.query.categories.findFirst({
      columns: { position: true },
      orderBy: (c, { desc }) => [desc(c.position)],
    });
    const [row] = await db
      .insert(categories)
      .values({ ...parsed.data, position: (last?.position ?? -1) + 1 })
      .returning({ id: categories.id });
    id = row.id;
  } catch (e) {
    if (isUniqueViolation(e, "categories_slug_unique")) {
      return { error: SLUG_TAKEN, fieldErrors: { slug: SLUG_TAKEN }, values: echo(formData) };
    }
    console.error("Create category failed", e);
    return { error: "Couldn't save the category. Please try again.", values: echo(formData) };
  }

  updateTag("catalog");
  redirect(`/admin/categories/${id}?saved=created`);
}

export async function updateCategory(
  id: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const guard = await authorizeAdminWrite();
  if (!guard.ok) return { error: guard.error };
  if (!z.uuid().safeParse(id).success) return { error: "Unknown category." };
  const parsed = categorySchema.safeParse(readCategory(formData));
  if (!parsed.success) {
    return {
      error: "Please fix the highlighted fields.",
      fieldErrors: formFieldErrors(parsed.error),
      values: echo(formData),
    };
  }

  try {
    const updated = await db
      .update(categories)
      .set(parsed.data)
      .where(eq(categories.id, id))
      .returning({ id: categories.id });
    if (updated.length === 0) return { error: "This category no longer exists." };
  } catch (e) {
    if (isUniqueViolation(e, "categories_slug_unique")) {
      return { error: SLUG_TAKEN, fieldErrors: { slug: SLUG_TAKEN }, values: echo(formData) };
    }
    console.error("Update category failed", e);
    return { error: "Couldn't save the category. Please try again.", values: echo(formData) };
  }

  updateTag("catalog");
  refresh();
  return { success: "Saved." };
}

const moveInput = z.object({ id: z.uuid(), direction: z.enum(["up", "down"]) });

/** Swap a category with its neighbour, renumbering positions 0..n-1. */
export async function moveCategory(id: string, direction: string): Promise<FormState> {
  const guard = await authorizeAdminWrite();
  if (!guard.ok) return { error: guard.error };
  const parsed = moveInput.safeParse({ id, direction });
  if (!parsed.success) return { error: "Unknown category." };

  const ordered = await db
    .select({ id: categories.id })
    .from(categories)
    .orderBy(asc(categories.position), asc(categories.name));
  const from = ordered.findIndex((c) => c.id === parsed.data.id);
  const to = from + (parsed.data.direction === "up" ? -1 : 1);
  if (from === -1) return { error: "This category no longer exists." };
  if (to < 0 || to >= ordered.length) return null;

  [ordered[from], ordered[to]] = [ordered[to], ordered[from]];
  const [first, ...rest] = ordered.map((c, position) =>
    db.update(categories).set({ position }).where(eq(categories.id, c.id)),
  );
  await db.batch([first, ...rest]);

  updateTag("catalog");
  refresh();
  return null;
}

/** Only empty categories can go; products must be moved first (the FK is RESTRICT). */
export async function deleteCategory(id: string): Promise<FormState> {
  const guard = await authorizeAdminWrite();
  if (!guard.ok) return { error: guard.error };
  if (!z.uuid().safeParse(id).success) return { error: "Unknown category." };

  const deleted = await db
    .delete(categories)
    .where(
      and(
        eq(categories.id, id),
        notExists(db.select().from(products).where(eq(products.categoryId, id))),
      ),
    )
    .returning({ id: categories.id });
  if (deleted.length === 0) {
    return { error: "Move this category's products to another category before deleting it." };
  }

  updateTag("catalog");
  redirect("/admin/categories?saved=deleted");
}
