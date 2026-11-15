import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/cn";

type TextLinkProps = ComponentPropsWithoutRef<typeof Link> & {
  /** `inline` = underlined body link; `nav` = underline appears on hover/active. */
  variant?: "inline" | "nav";
};

export function TextLink({ variant = "inline", className, ...props }: TextLinkProps) {
  return (
    <Link className={cn(variant === "nav" ? "link-nav" : "link", className)} {...props} />
  );
}
