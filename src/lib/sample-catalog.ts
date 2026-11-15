import type { ProductCardProps } from "@/components/product/product-card";

/*
 * Placeholder catalogue for the storefront until products and collections
 * come from the database. Images are Unsplash photographs, chosen to carry
 * no visible third-party branding.
 */

const unsplash = (id: string) => `https://images.unsplash.com/photo-${id}`;

export type SampleImage = { src: string; alt: string };

/* ---- Categories --------------------------------------------------------- */

export type CategorySlug = "skin" | "body" | "fragrance" | "home";

export type Category = {
  slug: CategorySlug;
  name: string;
  href: string;
  note: string;
  /** Tile image on the homepage. */
  image: SampleImage;
  /** Atmosphere shot shown after a product's own images on its detail page. */
  contextImage: SampleImage;
};

export const categories: Record<CategorySlug, Category> = {
  skin: {
    slug: "skin",
    name: "Skin",
    href: "/shop/skin",
    note: "Cleansers, oils and serums",
    image: {
      src: unsplash("1617897903246-719242758050"),
      alt: "A dropper bottle of golden facial oil on a wooden board beside eucalyptus leaves",
    },
    contextImage: {
      src: unsplash("1617897903246-719242758050"),
      alt: "A dropper bottle of golden facial oil on a wooden board beside eucalyptus leaves",
    },
  },
  body: {
    slug: "body",
    name: "Body",
    href: "/shop/body",
    note: "Bars, balms and washes",
    image: {
      src: unsplash("1590439471364-192aa70c0b53"),
      alt: "A folded cotton towel, a round body bar and a wooden bath brush on linen",
    },
    contextImage: {
      src: unsplash("1620626011761-996317b8d101"),
      alt: "A calm white bathroom with a freestanding tub, a bamboo bath tray and a fern by the window",
    },
  },
  fragrance: {
    slug: "fragrance",
    name: "Fragrance",
    href: "/shop/fragrance",
    note: "Eaux de parfum",
    image: {
      src: unsplash("1622618991746-fe6004db3a47"),
      alt: "Three amber fragrance bottles catching warm light",
    },
    contextImage: {
      src: unsplash("1622618991746-fe6004db3a47"),
      alt: "Three amber fragrance bottles catching warm light",
    },
  },
  home: {
    slug: "home",
    name: "Home",
    href: "/shop/home",
    note: "Candles and room mists",
    image: {
      src: unsplash("1603006905003-be475563bc59"),
      alt: "A lit candle in a smoked glass vessel on a soft wool throw",
    },
    contextImage: {
      src: unsplash("1612196808214-b8e1d6145a8c"),
      alt: "A matte ceramic vase on a low shelf beneath a hanging green branch",
    },
  },
};

export const ranges: Category[] = [
  categories.skin,
  categories.body,
  categories.fragrance,
  categories.home,
];

/* ---- Products ----------------------------------------------------------- */

export type StockStatus =
  | { state: "in_stock" }
  | { state: "low_stock"; remaining: number }
  | { state: "out_of_stock" };

export type Product = {
  slug: string;
  name: string;
  category: CategorySlug;
  /** One line, shown on cards. */
  tagline: string;
  /** A short paragraph, shown under the product name. */
  description: string;
  /** Price in US dollars. */
  price: number;
  size: string;
  stock: StockStatus;
  badge?: string;
  images: SampleImage[];
  keyIngredients: string[];
  howToUse: string;
};

export const products: Product[] = [
  {
    slug: "rosehip-facial-oil",
    name: "Rosehip Facial Oil",
    category: "skin",
    tagline: "Nourishing overnight oil",
    description:
      "A cold-pressed blend that softens and restores skin overnight. Absorbs fully, leaving a soft, satin finish rather than a sheen.",
    price: 64,
    size: "30 mL",
    stock: { state: "in_stock" },
    badge: "New",
    images: [
      {
        src: unsplash("1576426863848-c21f53c60b19"),
        alt: "A white dropper bottle with a bronze collar on a marble block",
      },
    ],
    keyIngredients: ["Rosehip seed oil", "Sea buckthorn", "Vitamin E"],
    howToUse:
      "After cleansing in the evening, warm three to four drops between the palms and press gently into face and neck.",
  },
  {
    slug: "oat-cleansing-balm",
    name: "Oat Cleansing Balm",
    category: "skin",
    tagline: "Melts away the day",
    description:
      "A rich balm that turns to a light milk on contact with water, lifting sunscreen and make-up without stripping.",
    price: 46,
    size: "90 mL",
    stock: { state: "in_stock" },
    images: [
      {
        src: unsplash("1599305090598-fe179d501227"),
        alt: "An open glass jar of pale balm in soft afternoon light",
      },
    ],
    keyIngredients: ["Colloidal oat", "Sunflower seed oil", "Chamomile"],
    howToUse:
      "Massage a small scoop over dry skin, add warm water to emulsify, then rinse or remove with a damp cloth.",
  },
  {
    slug: "calm-serum",
    name: "Calm Serum",
    category: "skin",
    tagline: "For reactive skin",
    description:
      "A lightweight water serum that soothes redness and supports the skin barrier through changes in season.",
    price: 72,
    size: "30 mL",
    stock: { state: "in_stock" },
    images: [
      {
        src: unsplash("1600428877878-1a0fd85beda8"),
        alt: "A small amber dropper bottle beside a rose quartz facial roller on a white surface",
      },
    ],
    keyIngredients: ["Centella asiatica", "Niacinamide", "Panthenol"],
    howToUse:
      "Morning and evening, apply two drops to clean skin before oil or moisturiser.",
  },
  {
    slug: "geranium-hand-wash",
    name: "Geranium Hand Wash",
    category: "body",
    tagline: "Floral, green, bright",
    description:
      "A gentle, low-foaming cleanser for hands, scented with geranium leaf and a little bergamot.",
    price: 38,
    size: "500 mL",
    stock: { state: "in_stock" },
    images: [
      {
        src: unsplash("1540555700478-4be289fbecef"),
        alt: "A white pump bottle beside a rolled towel, a tea light and pink tulips",
      },
    ],
    keyIngredients: ["Geranium leaf", "Bergamot rind", "Glycerin"],
    howToUse: "Dispense one pump onto wet hands, work into a lather and rinse well.",
  },
  {
    slug: "neroli-body-lotion",
    name: "Neroli Body Lotion",
    category: "body",
    tagline: "Light, quick to absorb",
    description:
      "A fluid lotion that hydrates without weight, with a clean, sunlit neroli scent that lingers softly.",
    price: 52,
    size: "250 mL",
    stock: { state: "in_stock" },
    images: [
      {
        src: unsplash("1631729371254-42c2892f0e6e"),
        alt: "Three white bottles of body lotion on a pale counter beside a trailing plant",
      },
    ],
    keyIngredients: ["Neroli flower", "Shea butter", "Aloe leaf"],
    howToUse: "Smooth over damp skin after bathing, paying attention to elbows and knees.",
  },
  {
    slug: "cedar-body-bar",
    name: "Cedar Body Bar",
    category: "body",
    tagline: "Clay and cedar leaf",
    description:
      "A cold-process bar with kaolin clay and cedar leaf oil. Cleanses thoroughly and leaves a faint, woody trace.",
    price: 22,
    size: "150 g",
    stock: { state: "low_stock", remaining: 4 },
    images: [
      {
        src: unsplash("1607006344380-b6775a0824a7"),
        alt: "A stack of handmade soap bars in grey, white and violet",
      },
    ],
    keyIngredients: ["Kaolin clay", "Cedar leaf oil", "Olive oil"],
    howToUse:
      "Lather between wet hands or on a cloth. Keep on a draining dish between uses to make it last.",
  },
  {
    slug: "lavender-body-bar",
    name: "Lavender Body Bar",
    category: "body",
    tagline: "Calming, herbaceous",
    description:
      "Wrapped by hand in recycled paper. A soft, creamy lather with dried lavender buds for gentle exfoliation.",
    price: 18,
    size: "120 g",
    stock: { state: "in_stock" },
    images: [
      {
        src: unsplash("1600857544200-b2f666a9a2ec"),
        alt: "Four paper-wrapped soap bars tied with twine on a wooden table among lavender sprigs",
      },
    ],
    keyIngredients: ["Lavender oil", "Lavender buds", "Shea butter"],
    howToUse: "Lather on wet skin and rinse. Store dry between uses.",
  },
  {
    slug: "vetiver-eau-de-parfum",
    name: "Vetiver Eau de Parfum",
    category: "fragrance",
    tagline: "Earthy, green, warm",
    description:
      "Damp vetiver root and smoked cedar, brightened by pink pepper and settling into a warm, mineral base.",
    price: 140,
    size: "50 mL",
    stock: { state: "low_stock", remaining: 3 },
    images: [
      {
        src: unsplash("1620916297397-a4a5402a3c6c"),
        alt: "A hand holding a small dark glass fragrance bottle",
      },
    ],
    keyIngredients: ["Haitian vetiver", "Atlas cedar", "Pink pepper"],
    howToUse: "Apply to pulse points: wrists, neck and behind the ears. Do not rub.",
  },
  {
    slug: "cedar-candle",
    name: "Cedar Wood Candle",
    category: "home",
    tagline: "Smoked, resinous",
    description:
      "Hand-poured rapeseed wax in a smoked glass vessel, with notes of cedar, birch tar and a little clove.",
    price: 58,
    size: "300 g",
    stock: { state: "out_of_stock" },
    images: [
      {
        src: unsplash("1602874801007-bd458bb1b8b6"),
        alt: "A candle burning in a dark glass vessel",
      },
    ],
    keyIngredients: ["Rapeseed wax", "Cedarwood", "Cotton wick"],
    howToUse:
      "Burn for at least two hours the first time so the surface melts evenly. Trim the wick to 5 mm before each use.",
  },
];

/* ---- Lookups (swap for DB queries later) -------------------------------- */

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

/** Same-category products first, then others, excluding the product itself. */
export function getRelatedProducts(product: Product, limit = 4): Product[] {
  const others = products.filter((p) => p.slug !== product.slug);
  return [
    ...others.filter((p) => p.category === product.category),
    ...others.filter((p) => p.category !== product.category),
  ].slice(0, limit);
}

export const productHref = (slug: string) => `/products/${slug}`;

const priceFormat = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export const formatPrice = (price: number) => priceFormat.format(price);

export type ProductCardData = Omit<ProductCardProps, "className" | "imageFit">;

/** Shape a product for <ProductCard>. */
export function toCardProps(p: Product): ProductCardData {
  return {
    href: productHref(p.slug),
    name: p.name,
    description: p.tagline,
    price: formatPrice(p.price),
    size: p.size,
    badge: p.stock.state === "out_of_stock" ? "Sold out" : p.badge,
    image: p.images[0],
  };
}

const bySlug = (slugs: string[]) =>
  slugs.map((slug) => {
    const p = getProduct(slug);
    if (!p) throw new Error(`Unknown product slug: ${slug}`);
    return p;
  });

/* ---- Homepage content --------------------------------------------------- */

export const heroImage: SampleImage = {
  src: unsplash("1608571423902-eed4a5ad8108"),
  alt: "An amber glass dropper bottle on a turned wooden stand, palm shadows falling across a pale wall",
};

export const newArrivals = bySlug([
  "rosehip-facial-oil",
  "oat-cleansing-balm",
  "geranium-hand-wash",
  "neroli-body-lotion",
]);

export const featuredSeries = {
  eyebrow: "The series",
  title: "Cedar & Vetiver",
  body: "A quiet, woody family composed for the slower hours: smoked cedar, damp vetiver root and a trace of black pepper, carried from the bath to the room.",
  href: "/collections/cedar-vetiver",
  image: {
    src: unsplash("1612196808214-b8e1d6145a8c"),
    alt: "A matte ceramic vase on a low shelf beneath a hanging green branch",
  },
  products: bySlug(["cedar-candle", "vetiver-eau-de-parfum", "cedar-body-bar"]),
};

export const ritualImage: SampleImage = {
  src: unsplash("1620626011761-996317b8d101"),
  alt: "A calm white bathroom with a freestanding tub, a bamboo bath tray and a fern by the window",
};

export const approachImage: SampleImage = {
  src: unsplash("1619451334792-150fd785ee74"),
  alt: "Two hands holding an open jar of pale green gel against a white linen shirt",
};

export const services = [
  {
    title: "Complimentary samples",
    body: "Two samples chosen for you with every order, so you can try before committing.",
  },
  {
    title: "Skin consultations",
    body: "Book a free thirty-minute conversation, in store or by video, with a trained consultant.",
  },
  {
    title: "Refill, don't replace",
    body: "Return any empty bottle to a store and receive 10% off its refill.",
  },
];
