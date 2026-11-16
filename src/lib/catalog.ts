import type { ProductCardProps } from "@/components/product/product-card";
import type { ImageAsset } from "@/db/schema";

/*
 * Catalogue domain types and pure helpers. Safe to import anywhere; database
 * reads live in `@/db/queries/catalog`.
 */

export type { ImageAsset };

export type Category = {
  slug: string;
  name: string;
  href: string;
  note: string;
  /** Tile image on the homepage. */
  image: ImageAsset;
  /** Atmosphere shot shown after a product's own images on its detail page. */
  contextImage: ImageAsset;
};

export type StockStatus =
  | { state: "in_stock" }
  | { state: "low_stock"; remaining: number }
  | { state: "out_of_stock" };

export type Product = {
  slug: string;
  name: string;
  category: Category;
  /** One line, shown on cards. */
  tagline: string;
  /** A short paragraph, shown under the product name. */
  description: string;
  /** Price in US cents. */
  priceCents: number;
  size: string;
  stock: StockStatus;
  badge?: string;
  /** Listed under New formulations. */
  isNew: boolean;
  images: ImageAsset[];
  keyIngredients: string[];
  howToUse: string;
};

/** At or below this many units, products show "Only N left". */
export const LOW_STOCK_THRESHOLD = 5;

export function toStockStatus(quantity: number): StockStatus {
  if (quantity <= 0) return { state: "out_of_stock" };
  if (quantity <= LOW_STOCK_THRESHOLD) return { state: "low_stock", remaining: quantity };
  return { state: "in_stock" };
}

export const categoryHref = (slug: string) => `/shop/${slug}`;
export const productHref = (slug: string) => `/products/${slug}`;

const priceFormat = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export const formatPrice = (cents: number) => priceFormat.format(cents / 100);

export type ProductCardData = Omit<ProductCardProps, "className" | "imageFit">;

/** Shape a product for <ProductCard>. */
export function toCardProps(p: Product): ProductCardData {
  return {
    href: productHref(p.slug),
    name: p.name,
    description: p.tagline,
    price: formatPrice(p.priceCents),
    size: p.size,
    badge: p.stock.state === "out_of_stock" ? "Sold out" : (p.badge ?? (p.isNew ? "New" : undefined)),
    image: p.images[0],
  };
}
