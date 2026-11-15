import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type ProductCardProps = {
  href: string;
  name: string;
  /** Short descriptor under the name, e.g. category or key note. */
  description?: string;
  price: string;
  /** e.g. "100 mL" or "3 sizes" */
  size?: string;
  image?: { src: string; alt: string };
  badge?: string;
  className?: string;
};

/**
 * Minimal product tile: product on a tinted well (4:5), text left-aligned
 * beneath. Image lifts subtly on hover; no borders or shadows.
 */
export function ProductCard({
  href,
  name,
  description,
  price,
  size,
  image,
  badge,
  className,
}: ProductCardProps) {
  return (
    <article className={cn("group", className)}>
      <Link href={href} className="block focus-visible:outline-offset-4">
        <div className="media-well aspect-product">
          {image ? (
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(min-width: 64rem) 25vw, (min-width: 48rem) 33vw, 50vw"
              className="object-contain p-8 transition-transform duration-600 ease-standard group-hover:scale-[1.03]"
            />
          ) : (
            <div aria-hidden="true" className="absolute inset-0 bg-sand/40" />
          )}
          {badge && (
            <span className="eyebrow absolute top-3 left-3 bg-paper px-2 py-1 text-ink">
              {badge}
            </span>
          )}
        </div>

        <div className="mt-4 flex flex-col gap-1">
          <h3 className="font-sans text-sm font-medium tracking-normal md:text-base">
            {name}
          </h3>
          {description && <p className="text-meta">{description}</p>}
          <p className="mt-1 text-sm">
            {price}
            {size && <span className="text-ink-muted"> · {size}</span>}
          </p>
        </div>
      </Link>
    </article>
  );
}

/** Responsive product grid: 2 → 3 → 4 columns. */
export function ProductGrid({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4 lg:gap-x-8 lg:gap-y-14",
        className,
      )}
    >
      {children}
    </div>
  );
}
