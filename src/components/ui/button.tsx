import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/cn";

const variants = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  inverse: "btn-inverse",
  text: "btn-text",
} as const;

type StyleProps = {
  variant?: keyof typeof variants;
  size?: "md" | "sm";
  block?: boolean;
  /** Show a trailing arrow that nudges on hover (default for `text`). */
  arrow?: boolean;
};

export function buttonClasses({
  variant = "primary",
  size = "md",
  block = false,
  className,
}: StyleProps & { className?: string }) {
  return cn(
    "btn",
    variants[variant],
    size === "sm" && variant !== "text" && "btn-sm",
    block && "btn-block",
    className,
  );
}

function Content({ children, arrow }: { children: ReactNode; arrow: boolean }) {
  return (
    <>
      <span>{children}</span>
      {arrow && (
        <span data-arrow aria-hidden="true">
          →
        </span>
      )}
    </>
  );
}

type ButtonProps = StyleProps & ComponentPropsWithoutRef<"button">;

export function Button({
  variant,
  size,
  block,
  arrow = variant === "text",
  className,
  type = "button",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClasses({ variant, size, block, className })}
      {...props}
    >
      <Content arrow={arrow}>{children}</Content>
    </button>
  );
}

type ButtonLinkProps = StyleProps & ComponentPropsWithoutRef<typeof Link>;

/** A link styled as a button. Use for navigation; use <Button> for actions. */
export function ButtonLink({
  variant,
  size,
  block,
  arrow = variant === "text",
  className,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link className={buttonClasses({ variant, size, block, className })} {...props}>
      <Content arrow={arrow}>{children}</Content>
    </Link>
  );
}
