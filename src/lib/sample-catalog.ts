import type { ProductCardProps } from "@/components/product/product-card";

/*
 * Placeholder catalogue for the storefront until products and collections
 * come from the database. Images are Unsplash photographs, chosen to carry
 * no visible third-party branding.
 */

const unsplash = (id: string) => `https://images.unsplash.com/photo-${id}`;

export type SampleImage = { src: string; alt: string };

export type Range = {
  name: string;
  href: string;
  note: string;
  image: SampleImage;
};

export type SampleProduct = Omit<ProductCardProps, "className" | "imageFit"> & {
  image: SampleImage;
};

export const heroImage: SampleImage = {
  src: unsplash("1608571423902-eed4a5ad8108"),
  alt: "An amber glass dropper bottle on a turned wooden stand, palm shadows falling across a pale wall",
};

export const ranges: Range[] = [
  {
    name: "Skin",
    href: "/shop/skin",
    note: "Cleansers, oils and serums",
    image: {
      src: unsplash("1617897903246-719242758050"),
      alt: "A dropper bottle of golden facial oil on a wooden board beside eucalyptus leaves",
    },
  },
  {
    name: "Body",
    href: "/shop/body",
    note: "Bars, balms and washes",
    image: {
      src: unsplash("1590439471364-192aa70c0b53"),
      alt: "A folded cotton towel, a round body bar and a wooden bath brush on linen",
    },
  },
  {
    name: "Fragrance",
    href: "/shop/fragrance",
    note: "Eaux de parfum",
    image: {
      src: unsplash("1622618991746-fe6004db3a47"),
      alt: "Three amber fragrance bottles catching warm light",
    },
  },
  {
    name: "Home",
    href: "/shop/home",
    note: "Candles and room mists",
    image: {
      src: unsplash("1603006905003-be475563bc59"),
      alt: "A lit candle in a smoked glass vessel on a soft wool throw",
    },
  },
];

export const newArrivals: SampleProduct[] = [
  {
    href: "/products/rosehip-facial-oil",
    name: "Rosehip Facial Oil",
    description: "Nourishing overnight oil",
    price: "$64",
    size: "30 mL",
    badge: "New",
    image: {
      src: unsplash("1576426863848-c21f53c60b19"),
      alt: "A white dropper bottle with a bronze collar on a marble block",
    },
  },
  {
    href: "/products/oat-cleansing-balm",
    name: "Oat Cleansing Balm",
    description: "Melts away the day",
    price: "$46",
    size: "90 mL",
    image: {
      src: unsplash("1599305090598-fe179d501227"),
      alt: "An open glass jar of pale balm in soft afternoon light",
    },
  },
  {
    href: "/products/geranium-hand-wash",
    name: "Geranium Hand Wash",
    description: "Floral, green, bright",
    price: "$38",
    size: "500 mL",
    image: {
      src: unsplash("1540555700478-4be289fbecef"),
      alt: "A white pump bottle beside a rolled towel, a tea light and pink tulips",
    },
  },
  {
    href: "/products/neroli-body-lotion",
    name: "Neroli Body Lotion",
    description: "Light, quick to absorb",
    price: "$52",
    size: "250 mL",
    image: {
      src: unsplash("1631729371254-42c2892f0e6e"),
      alt: "Three white bottles of body lotion on a pale counter beside a trailing plant",
    },
  },
];

export const featuredSeries = {
  eyebrow: "The series",
  title: "Cedar & Vetiver",
  body: "A quiet, woody family composed for the slower hours: smoked cedar, damp vetiver root and a trace of black pepper, carried from the bath to the room.",
  href: "/collections/cedar-vetiver",
  image: {
    src: unsplash("1612196808214-b8e1d6145a8c"),
    alt: "A matte ceramic vase on a low shelf beneath a hanging green branch",
  },
  products: [
    {
      href: "/products/cedar-candle",
      name: "Cedar Wood Candle",
      description: "Smoked, resinous",
      price: "$58",
      size: "300 g",
      image: {
        src: unsplash("1602874801007-bd458bb1b8b6"),
        alt: "A candle burning in a dark glass vessel",
      },
    },
    {
      href: "/products/vetiver-eau-de-parfum",
      name: "Vetiver Eau de Parfum",
      description: "Earthy, green, warm",
      price: "$140",
      size: "50 mL",
      image: {
        src: unsplash("1620916297397-a4a5402a3c6c"),
        alt: "A hand holding a small dark glass fragrance bottle",
      },
    },
    {
      href: "/products/cedar-body-bar",
      name: "Cedar Body Bar",
      description: "Clay and cedar leaf",
      price: "$22",
      size: "150 g",
      image: {
        src: unsplash("1607006344380-b6775a0824a7"),
        alt: "A stack of handmade soap bars in grey, white and violet",
      },
    },
  ] satisfies SampleProduct[],
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
