import type { ComponentPropsWithoutRef, ElementType } from "react";
import { cn } from "@/lib/cn";

const widths = {
  page: "container-page",
  narrow: "container-narrow",
  prose: "container-prose",
} as const;

type ContainerProps<T extends ElementType> = {
  as?: T;
  width?: keyof typeof widths;
} & Omit<ComponentPropsWithoutRef<T>, "as">;

/** Centered, max-width wrapper with responsive side gutters. */
export function Container<T extends ElementType = "div">({
  as,
  width = "page",
  className,
  ...props
}: ContainerProps<T>) {
  const Tag: ElementType = as ?? "div";
  return <Tag className={cn(widths[width], className)} {...props} />;
}

type SectionProps = ComponentPropsWithoutRef<"section"> & {
  tone?: "paper" | "deep" | "ink";
};

const tones = {
  paper: "bg-paper text-ink",
  deep: "bg-paper-deep text-ink",
  ink: "bg-ink text-ink-inverse",
} as const;

/** Page section with the standard vertical rhythm and background tone. */
export function Section({ tone = "paper", className, ...props }: SectionProps) {
  return <section className={cn("section-y", tones[tone], className)} {...props} />;
}
