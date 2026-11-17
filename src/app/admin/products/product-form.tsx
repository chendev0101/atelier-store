"use client";

import { useActionState, useState } from "react";
import { Checkbox, Field, Select, Textarea, TextInput } from "@/components/admin/form-fields";
import { FormMessage } from "@/components/admin/form-message";
import { SubmitButton } from "@/components/admin/submit-button";
import { Button } from "@/components/ui/button";
import type { ImageAsset, ProductStatus } from "@/db/schema";
import { type FormState, MAX_IMAGES, slugify } from "@/lib/admin-form";

export type ProductFormValues = {
  name: string;
  slug: string;
  categoryId: string;
  tagline: string;
  description: string;
  howToUse: string;
  /** Dollars, as typed, e.g. "48.00". */
  price: string;
  size: string;
  badge: string;
  isNew: boolean;
  status: ProductStatus;
  images: ImageAsset[];
  keyIngredients: string;
};

type Props = {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  categories: { id: string; name: string }[];
  defaults: ProductFormValues;
  /** Only new products take an opening stock level; later changes go through adjustments. */
  withInitialStock?: boolean;
  submitLabel: string;
};

const statusOptions: { value: ProductStatus; label: string }[] = [
  { value: "draft", label: "Draft (hidden from the store)" },
  { value: "active", label: "Active (on sale)" },
  { value: "archived", label: "Archived (withdrawn)" },
];

export function ProductForm({ action, categories, defaults, withInitialStock, submitLabel }: Props) {
  const [state, formAction] = useActionState(action, null);
  const [images, setImages] = useState<ImageAsset[]>(
    defaults.images.length ? defaults.images : [{ src: "", alt: "" }],
  );
  const [name, setName] = useState(defaults.name);
  const [slugTouched, setSlugTouched] = useState(Boolean(defaults.slug));
  const [slug, setSlug] = useState(defaults.slug);

  const errors = state?.fieldErrors ?? {};
  // After a failed submit, show what was sent rather than the original values.
  const value = (key: keyof ProductFormValues) =>
    state?.values?.[key] ?? String(defaults[key] ?? "");
  const shownSlug = slugTouched ? slug : slugify(name);

  return (
    <form action={formAction} noValidate className="space-y-10">
      <FormMessage error={state?.error} success={state?.success} />

      <fieldset className="grid gap-6 md:grid-cols-2">
        <legend className="eyebrow mb-4">Details</legend>
        <Field id="name" label="Name" error={errors.name}>
          {(a11y) => (
            <TextInput
              {...a11y}
              name="name"
              required
              maxLength={120}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}
        </Field>
        <Field
          id="slug"
          label="Slug"
          hint="Used in the product's URL. Changing it breaks existing links."
          error={errors.slug}
        >
          {(a11y) => (
            <TextInput
              {...a11y}
              name="slug"
              required
              maxLength={80}
              value={shownSlug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
              className="font-mono"
            />
          )}
        </Field>
        <Field id="categoryId" label="Category" error={errors.categoryId}>
          {(a11y) => (
            <Select {...a11y} name="categoryId" required defaultValue={value("categoryId")}>
              <option value="" disabled>
                Choose…
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field id="status" label="Status" error={errors.status}>
          {(a11y) => (
            <Select {...a11y} name="status" defaultValue={value("status")}>
              {statusOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field id="price" label="Price (USD)" hint="e.g. 48 or 48.50" error={errors.price}>
          {(a11y) => (
            <TextInput
              {...a11y}
              name="price"
              inputMode="decimal"
              required
              defaultValue={value("price")}
              className="tabular-nums"
            />
          )}
        </Field>
        <Field id="size" label="Size" hint="e.g. 30 mL" error={errors.size}>
          {(a11y) => (
            <TextInput {...a11y} name="size" required maxLength={40} defaultValue={value("size")} />
          )}
        </Field>
        <Field id="badge" label="Badge" hint="Optional, e.g. Bestseller" error={errors.badge}>
          {(a11y) => (
            <TextInput {...a11y} name="badge" maxLength={24} defaultValue={value("badge")} />
          )}
        </Field>
        {withInitialStock && (
          <Field
            id="initialStock"
            label="Opening stock"
            hint="Units on hand now. Later changes are made as adjustments."
            error={errors.initialStock}
          >
            {(a11y) => (
              <TextInput
                {...a11y}
                name="initialStock"
                type="number"
                min={0}
                step={1}
                inputMode="numeric"
                defaultValue={state?.values?.initialStock ?? "0"}
                className="tabular-nums"
              />
            )}
          </Field>
        )}
        <div className="md:col-span-2">
          <Checkbox
            name="isNew"
            label="List under New formulations"
            defaultChecked={state?.values ? state.values.isNew === "on" : defaults.isNew}
          />
        </div>
      </fieldset>

      <fieldset className="grid gap-6">
        <legend className="eyebrow mb-4">Copy</legend>
        <Field id="tagline" label="Tagline" hint="One line, shown on cards." error={errors.tagline}>
          {(a11y) => (
            <TextInput {...a11y} name="tagline" required maxLength={160} defaultValue={value("tagline")} />
          )}
        </Field>
        <Field id="description" label="Description" error={errors.description}>
          {(a11y) => (
            <Textarea {...a11y} name="description" required defaultValue={value("description")} />
          )}
        </Field>
        <Field id="howToUse" label="How to use" error={errors.howToUse}>
          {(a11y) => (
            <Textarea {...a11y} name="howToUse" rows={3} required defaultValue={value("howToUse")} />
          )}
        </Field>
        <Field
          id="keyIngredients"
          label="Key ingredients"
          hint="One per line."
          error={errors.keyIngredients}
        >
          {(a11y) => (
            <Textarea
              {...a11y}
              name="keyIngredients"
              rows={4}
              defaultValue={value("keyIngredients")}
            />
          )}
        </Field>
      </fieldset>

      <fieldset>
        <legend className="eyebrow mb-1">Images</legend>
        <p className="text-meta mb-4 text-xs">
          Unsplash photo URLs (https://images.unsplash.com/photo-…). The first is the card image.
        </p>
        {errors.images && (
          <p role="alert" className="mb-3 text-xs text-error">
            {errors.images}
          </p>
        )}
        <ol className="space-y-4">
          {images.map((image, i) => {
            const srcError = errors[`images.${i}.src`];
            const altError = errors[`images.${i}.alt`];
            return (
              // Rows have no identity until saved; the index is the row.
              <li key={i} className="grid gap-3 md:grid-cols-[2fr_1.5fr_auto] md:items-start">
                <Field id={`imageSrc-${i}`} label={`Image ${i + 1} URL`} error={srcError}>
                  {(a11y) => (
                    <TextInput
                      {...a11y}
                      name="imageSrc"
                      type="url"
                      value={image.src}
                      onChange={(e) =>
                        setImages((rows) =>
                          rows.map((r, j) => (j === i ? { ...r, src: e.target.value } : r)),
                        )
                      }
                    />
                  )}
                </Field>
                <Field id={`imageAlt-${i}`} label="Alt text" error={altError}>
                  {(a11y) => (
                    <TextInput
                      {...a11y}
                      name="imageAlt"
                      value={image.alt}
                      onChange={(e) =>
                        setImages((rows) =>
                          rows.map((r, j) => (j === i ? { ...r, alt: e.target.value } : r)),
                        )
                      }
                    />
                  )}
                </Field>
                <Button
                  variant="text"
                  size="sm"
                  arrow={false}
                  className="text-xs text-ink-muted md:mt-7"
                  disabled={images.length === 1}
                  onClick={() => setImages((rows) => rows.filter((_, j) => j !== i))}
                  aria-label={`Remove image ${i + 1}`}
                >
                  Remove
                </Button>
              </li>
            );
          })}
        </ol>
        {images.length < MAX_IMAGES && (
          <Button
            variant="secondary"
            size="sm"
            className="mt-4"
            onClick={() => setImages((rows) => [...rows, { src: "", alt: "" }])}
          >
            Add image
          </Button>
        )}
      </fieldset>

      <div className="hairline-t flex flex-wrap items-center gap-4 pt-6">
        <SubmitButton>{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}
