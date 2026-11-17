"use client";

import { useActionState, useState } from "react";
import { Field, Textarea, TextInput } from "@/components/admin/form-fields";
import { FormMessage } from "@/components/admin/form-message";
import { SubmitButton } from "@/components/admin/submit-button";
import type { ImageAsset } from "@/db/schema";
import { type FormState, slugify } from "@/lib/admin-form";

export type CategoryFormValues = {
  name: string;
  slug: string;
  note: string;
  image: ImageAsset;
  contextImage: ImageAsset;
};

type Props = {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  defaults: CategoryFormValues;
  submitLabel: string;
};

export function CategoryForm({ action, defaults, submitLabel }: Props) {
  const [state, formAction] = useActionState(action, null);
  const [name, setName] = useState(defaults.name);
  const [slug, setSlug] = useState(defaults.slug);
  const [slugTouched, setSlugTouched] = useState(Boolean(defaults.slug));
  const errors = state?.fieldErrors ?? {};
  const v = (key: string, fallback: string) => state?.values?.[key] ?? fallback;

  return (
    <form action={formAction} noValidate className="space-y-8">
      <FormMessage error={state?.error} success={state?.success} />

      <div className="grid gap-6 md:grid-cols-2">
        <Field id="name" label="Name" error={errors.name}>
          {(a11y) => (
            <TextInput
              {...a11y}
              name="name"
              required
              maxLength={60}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}
        </Field>
        <Field
          id="slug"
          label="Slug"
          hint="The /shop/… URL. Header and footer links are set in code, so update those too."
          error={errors.slug}
        >
          {(a11y) => (
            <TextInput
              {...a11y}
              name="slug"
              required
              maxLength={80}
              className="font-mono"
              value={slugTouched ? slug : slugify(name)}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
            />
          )}
        </Field>
      </div>

      <Field id="note" label="Note" hint="Short line under the name on the homepage tile." error={errors.note}>
        {(a11y) => (
          <Textarea {...a11y} name="note" rows={2} maxLength={160} defaultValue={v("note", defaults.note)} />
        )}
      </Field>

      {(
        [
          ["image", "Tile image", "Shown on the homepage.", defaults.image],
          ["contextImage", "Context image", "Shown after a product's own photos.", defaults.contextImage],
        ] as const
      ).map(([key, label, hint, image]) => (
        <fieldset key={key} className="grid gap-4 md:grid-cols-2">
          <legend className="eyebrow mb-1">{label}</legend>
          <p className="text-meta text-xs md:col-span-2">
            {hint} An https://images.unsplash.com/photo-… URL.
          </p>
          <Field id={`${key}Src`} label="URL" error={errors[`${key}Src`]}>
            {(a11y) => (
              <TextInput {...a11y} name={`${key}Src`} type="url" defaultValue={v(`${key}Src`, image.src)} />
            )}
          </Field>
          <Field id={`${key}Alt`} label="Alt text" error={errors[`${key}Alt`]}>
            {(a11y) => (
              <TextInput {...a11y} name={`${key}Alt`} defaultValue={v(`${key}Alt`, image.alt)} />
            )}
          </Field>
        </fieldset>
      ))}

      <div className="hairline-t pt-6">
        <SubmitButton>{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}
