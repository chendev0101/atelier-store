"use server";

import { eq } from "drizzle-orm";
import { refresh, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { inventory, inventoryAdjustments, PRODUCT_STATUSES, products } from "@/db/schema";
import { type FormState, slugify } from "@/lib/admin-form";
import { fieldErrorsFrom, initialStockSchema, productSchema } from "@/lib/admin-validation";
import { AdminAuthError, assertAdmin } from "@/lib/dal";
import { isUniqueViolation } from "@/lib/db-errors";

/*
 * Every action starts with assertAdmin(), before reading any input: Server
 * Actions are public endpoints, whatever page renders the form.
 */

const NOT_AUTHORISED: FormState = { error: "You don't have permission to do that." };
const SLUG_TAKEN = "Another product already uses this slug.";

async function admin() {
  try {
    return await assertAdmin();
  } catch (e) {
    if (e instanceof AdminAuthError) return null;
    throw e;
  }
}

function echo(formData: FormData): Record<string, string> {
  const values: Record<string, string> = {};
  for (const [key, value] of formData) {
    if (typeof value === "string" && !key.startsWith("$") && !key.startsWith("image")) {
      values[key] = value;
    }
  }
  return values;
}

function readProduct(formData: FormData) {
  const str = (key: string) => String(formData.get(key) ?? "");
  const alts = formData.getAll("imageAlt").map(String);
  const images = formData
    .getAll("imageSrc")
    .map((src, i) => ({ src: String(src), alt: alts[i] ?? "" }))
    .filter((img) => img.src.trim() || img.alt.trim());
  return {
    name: str("name"),
    slug: str("slug").trim() || slugify(str("name")),
    categoryId: str("categoryId"),
    tagline: str("tagline"),
    description: str("description"),
    howToUse: str("howToUse"),
    priceCents: str("price"),
    size: str("size"),
    badge: str("badge"),
    isNew: formData.get("isNew") === "on",
    status: str("status"),
    images,
    keyIngredients: str("keyIngredients")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
  };
}

function invalid(error: z.ZodError, formData: FormData, extra: FormState = {}): FormState {
  const fieldErrors = { ...fieldErrorsFrom(error), ...extra?.fieldErrors };
  // The form's price field is "price"; the schema calls it priceCents.
  if (fieldErrors.priceCents) fieldErrors.price ??= fieldErrors.priceCents;
  return { error: "Please fix the highlighted fields.", fieldErrors, values: echo(formData) };
}

export async function createProduct(_prev: FormState, formData: FormData): Promise<FormState> {
  const actor = await admin();
  if (!actor) return NOT_AUTHORISED;

  const parsed = productSchema.safeParse(readProduct(formData));
  const stock = initialStockSchema.safeParse(formData.get("initialStock") || "0");
  if (!parsed.success || !stock.success) {
    const errors = parsed.success ? new z.ZodError([]) : parsed.error;
    return invalid(errors, formData, {
      fieldErrors: stock.success ? {} : { initialStock: stock.error.issues[0]?.message },
    });
  }

  const id = crypto.randomUUID();
  try {
    // One atomic batch: the product never exists without its stock row.
    await db.batch([
      db.insert(products).values({ id, ...parsed.data }),
      db.insert(inventory).values({ productId: id, quantity: stock.data }),
      db.insert(inventoryAdjustments).values({
        productId: id,
        delta: stock.data,
        reason: "initial",
        quantityAfter: stock.data,
        actorUserId: actor.id,
      }),
    ]);
  } catch (e) {
    if (isUniqueViolation(e, "products_slug_unique")) {
      return { error: SLUG_TAKEN, fieldErrors: { slug: SLUG_TAKEN }, values: echo(formData) };
    }
    console.error("Create product failed", e);
    return { error: "Couldn't save the product. Please try again.", values: echo(formData) };
  }

  updateTag("catalog");
  redirect(`/admin/products/${id}?saved=created`);
}

export async function updateProduct(
  id: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const actor = await admin();
  if (!actor) return NOT_AUTHORISED;
  if (!z.uuid().safeParse(id).success) return { error: "Unknown product." };

  const parsed = productSchema.safeParse(readProduct(formData));
  if (!parsed.success) return invalid(parsed.error, formData);

  try {
    const updated = await db
      .update(products)
      .set(parsed.data)
      .where(eq(products.id, id))
      .returning({ id: products.id });
    if (updated.length === 0) return { error: "This product no longer exists." };
  } catch (e) {
    if (isUniqueViolation(e, "products_slug_unique")) {
      return { error: SLUG_TAKEN, fieldErrors: { slug: SLUG_TAKEN }, values: echo(formData) };
    }
    console.error("Update product failed", e);
    return { error: "Couldn't save the product. Please try again.", values: echo(formData) };
  }

  updateTag("catalog");
  refresh();
  return { success: "Saved." };
}

const statusInput = z.object({ id: z.uuid(), status: z.enum(PRODUCT_STATUSES) });

/** Bound to (id, status) and used with useActionState, so it ignores the form. */
export async function setProductStatus(id: string, status: string): Promise<FormState> {
  const actor = await admin();
  if (!actor) return NOT_AUTHORISED;
  const parsed = statusInput.safeParse({ id, status });
  if (!parsed.success) return { error: "Unknown product or status." };

  const updated = await db
    .update(products)
    .set({ status: parsed.data.status })
    .where(eq(products.id, parsed.data.id))
    .returning({ id: products.id });
  if (updated.length === 0) return { error: "This product no longer exists." };

  updateTag("catalog");
  refresh();
  const labels = { active: "Published.", draft: "Moved to drafts.", archived: "Archived." };
  return { success: labels[parsed.data.status] };
}
