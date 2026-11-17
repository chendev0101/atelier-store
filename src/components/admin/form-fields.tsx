import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/cn";

/*
 * Labelled admin form controls. Errors are tied to their control with
 * aria-describedby and aria-invalid; hints sit under the label.
 */

type FieldProps = {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  className?: string;
  children: (a11y: {
    id: string;
    "aria-invalid"?: true;
    "aria-describedby"?: string;
  }) => ReactNode;
};

export function Field({ id, label, hint, error, className, children }: FieldProps) {
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ");
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-xs font-medium tracking-label uppercase">
        {label}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="text-meta mt-1 text-xs">
          {hint}
        </p>
      )}
      <div className="mt-2">
        {children({
          id,
          "aria-invalid": error ? true : undefined,
          "aria-describedby": describedBy || undefined,
        })}
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-error">
          {error}
        </p>
      )}
    </div>
  );
}

type InputProps = ComponentPropsWithoutRef<"input">;
type TextareaProps = ComponentPropsWithoutRef<"textarea">;
type SelectProps = ComponentPropsWithoutRef<"select">;

export function TextInput({ className, ...props }: InputProps) {
  return <input className={cn("field-box", className)} {...props} />;
}

export function Textarea({ className, rows = 4, ...props }: TextareaProps) {
  return <textarea rows={rows} className={cn("field-box leading-relaxed", className)} {...props} />;
}

export function Select({ className, ...props }: SelectProps) {
  return <select className={cn("field-box", className)} {...props} />;
}

export function Checkbox({ label, hint, ...props }: InputProps & { label: string; hint?: string }) {
  return (
    <label className="flex items-start gap-3 text-sm">
      <input type="checkbox" className="mt-0.5 size-4 accent-ink" {...props} />
      <span>
        {label}
        {hint && <span className="text-meta block text-xs">{hint}</span>}
      </span>
    </label>
  );
}
