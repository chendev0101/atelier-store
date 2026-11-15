import { ProductCard } from "@/components/product/product-card";
import { cn } from "@/lib/cn";
import { type Product, toCardProps } from "@/lib/catalog";

/**
 * Products as a swipeable, snap-scrolling rail on small screens and a plain
 * grid from md up. The rail bleeds to the screen edge so the next card peeks in.
 */
export function ProductRail({
  products,
  columns = 4,
  label,
}: {
  products: Product[];
  columns?: 3 | 4;
  label: string;
}) {
  return (
    <ul
      aria-label={label}
      className={cn(
        "-mx-gutter flex snap-x snap-mandatory scroll-px-gutter gap-4 overflow-x-auto px-gutter pb-2 [scrollbar-width:none]",
        "md:mx-0 md:grid md:gap-x-6 md:gap-y-10 md:overflow-visible md:px-0 md:pb-0 lg:gap-x-8",
        columns === 4 ? "md:grid-cols-4" : "md:grid-cols-3",
      )}
    >
      {products.map((p) => (
        <li key={p.slug} className="w-[72%] shrink-0 snap-start sm:w-[44%] md:w-auto">
          <ProductCard {...toCardProps(p)} imageFit="cover" />
        </li>
      ))}
    </ul>
  );
}
