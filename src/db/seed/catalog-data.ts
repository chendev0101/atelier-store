import type { ImageAsset } from "../schema";

/*
 * Starting catalogue, moved from the former hard-coded sample data.
 * Images are Unsplash photographs, chosen to carry no visible third-party
 * branding.
 */

const unsplash = (id: string) => `https://images.unsplash.com/photo-${id}`;

export type SeedCategory = {
  slug: string;
  name: string;
  note: string;
  image: ImageAsset;
  contextImage: ImageAsset;
  position: number;
};

export type SeedProduct = {
  slug: string;
  categorySlug: string;
  name: string;
  tagline: string;
  description: string;
  priceCents: number;
  size: string;
  badge?: string;
  images: ImageAsset[];
  keyIngredients: string[];
  howToUse: string;
  quantity: number;
};

export const seedCategories: SeedCategory[] = [
  {
    slug: "skin",
    name: "Skin",
    note: "Cleansers, oils and serums",
    position: 0,
    image: {
      src: unsplash("1617897903246-719242758050"),
      alt: "A dropper bottle of golden facial oil on a wooden board beside eucalyptus leaves",
    },
    contextImage: {
      src: unsplash("1617897903246-719242758050"),
      alt: "A dropper bottle of golden facial oil on a wooden board beside eucalyptus leaves",
    },
  },
  {
    slug: "body",
    name: "Body",
    note: "Bars, balms and washes",
    position: 1,
    image: {
      src: unsplash("1590439471364-192aa70c0b53"),
      alt: "A folded cotton towel, a round body bar and a wooden bath brush on linen",
    },
    contextImage: {
      src: unsplash("1620626011761-996317b8d101"),
      alt: "A calm white bathroom with a freestanding tub, a bamboo bath tray and a fern by the window",
    },
  },
  {
    slug: "hair",
    name: "Hair",
    note: "Washes, masks and scalp care",
    position: 2,
    image: {
      src: unsplash("1619451334792-150fd785ee74"),
      alt: "Two hands holding an open jar of pale green gel against a white linen shirt",
    },
    contextImage: {
      src: unsplash("1620626011761-996317b8d101"),
      alt: "A calm white bathroom with a freestanding tub, a bamboo bath tray and a fern by the window",
    },
  },
  {
    slug: "fragrance",
    name: "Fragrance",
    note: "Eaux de parfum",
    position: 3,
    image: {
      src: unsplash("1622618991746-fe6004db3a47"),
      alt: "Three amber fragrance bottles catching warm light",
    },
    contextImage: {
      src: unsplash("1622618991746-fe6004db3a47"),
      alt: "Three amber fragrance bottles catching warm light",
    },
  },
  {
    slug: "home",
    name: "Home",
    note: "Candles and room mists",
    position: 4,
    image: {
      src: unsplash("1603006905003-be475563bc59"),
      alt: "A lit candle in a smoked glass vessel on a soft wool throw",
    },
    contextImage: {
      src: unsplash("1612196808214-b8e1d6145a8c"),
      alt: "A matte ceramic vase on a low shelf beneath a hanging green branch",
    },
  },
  {
    slug: "gifts",
    name: "Gifts",
    note: "Sets and small presents",
    position: 5,
    image: {
      src: unsplash("1600857544200-b2f666a9a2ec"),
      alt: "Four paper-wrapped soap bars tied with twine on a wooden table among lavender sprigs",
    },
    contextImage: {
      src: unsplash("1608571423902-eed4a5ad8108"),
      alt: "An amber glass dropper bottle on a turned wooden stand, palm shadows falling across a pale wall",
    },
  },
];

export const seedProducts: SeedProduct[] = [
  {
    slug: "rosehip-facial-oil",
    name: "Rosehip Facial Oil",
    categorySlug: "skin",
    tagline: "Nourishing overnight oil",
    description:
      "A cold-pressed blend that softens and restores skin overnight. Absorbs fully, leaving a soft, satin finish rather than a sheen.",
    priceCents: 6400,
    size: "30 mL",
    quantity: 24,
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
    categorySlug: "skin",
    tagline: "Melts away the day",
    description:
      "A rich balm that turns to a light milk on contact with water, lifting sunscreen and make-up without stripping.",
    priceCents: 4600,
    size: "90 mL",
    quantity: 24,
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
    categorySlug: "skin",
    tagline: "For reactive skin",
    description:
      "A lightweight water serum that soothes redness and supports the skin barrier through changes in season.",
    priceCents: 7200,
    size: "30 mL",
    quantity: 24,
    images: [
      {
        src: unsplash("1600428877878-1a0fd85beda8"),
        alt: "A small amber dropper bottle beside a rose quartz facial roller on a white surface",
      },
    ],
    keyIngredients: ["Centella asiatica", "Niacinamide", "Panthenol"],
    howToUse: "Morning and evening, apply two drops to clean skin before oil or moisturiser.",
  },
  {
    slug: "geranium-hand-wash",
    name: "Geranium Hand Wash",
    categorySlug: "body",
    tagline: "Floral, green, bright",
    description:
      "A gentle, low-foaming cleanser for hands, scented with geranium leaf and a little bergamot.",
    priceCents: 3800,
    size: "500 mL",
    quantity: 24,
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
    categorySlug: "body",
    tagline: "Light, quick to absorb",
    description:
      "A fluid lotion that hydrates without weight, with a clean, sunlit neroli scent that lingers softly.",
    priceCents: 5200,
    size: "250 mL",
    quantity: 24,
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
    categorySlug: "body",
    tagline: "Clay and cedar leaf",
    description:
      "A cold-process bar with kaolin clay and cedar leaf oil. Cleanses thoroughly and leaves a faint, woody trace.",
    priceCents: 2200,
    size: "150 g",
    quantity: 4,
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
    categorySlug: "body",
    tagline: "Calming, herbaceous",
    description:
      "Wrapped by hand in recycled paper. A soft, creamy lather with dried lavender buds for gentle exfoliation.",
    priceCents: 1800,
    size: "120 g",
    quantity: 24,
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
    categorySlug: "fragrance",
    tagline: "Earthy, green, warm",
    description:
      "Damp vetiver root and smoked cedar, brightened by pink pepper and settling into a warm, mineral base.",
    priceCents: 14000,
    size: "50 mL",
    quantity: 3,
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
    categorySlug: "home",
    tagline: "Smoked, resinous",
    description:
      "Hand-poured rapeseed wax in a smoked glass vessel, with notes of cedar, birch tar and a little clove.",
    priceCents: 5800,
    size: "300 g",
    quantity: 0,
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
  {
    slug: "rosemary-scalp-oil",
    name: "Rosemary Scalp Oil",
    categorySlug: "hair",
    tagline: "A weekly scalp treatment",
    description:
      "A light pre-wash oil that loosens build-up and leaves the scalp calm. Rinses out cleanly without weighing hair down.",
    priceCents: 4200,
    size: "50 mL",
    quantity: 18,
    images: [
      {
        src: unsplash("1608571423902-eed4a5ad8108"),
        alt: "An amber glass dropper bottle on a turned wooden stand, palm shadows falling across a pale wall",
      },
    ],
    keyIngredients: ["Rosemary leaf oil", "Jojoba", "Peppermint"],
    howToUse:
      "Part dry hair and apply a few drops along the scalp. Massage in, leave for twenty minutes or overnight, then wash as usual.",
  },
  {
    slug: "aloe-hair-mask",
    name: "Aloe Hair Mask",
    categorySlug: "hair",
    tagline: "Softens without residue",
    description:
      "A cooling gel mask that smooths lengths and ends. Water-light, so it suits fine hair as well as thick.",
    priceCents: 3800,
    size: "200 mL",
    quantity: 24,
    badge: "New",
    images: [
      {
        src: unsplash("1619451334792-150fd785ee74"),
        alt: "Two hands holding an open jar of pale green gel against a white linen shirt",
      },
    ],
    keyIngredients: ["Aloe vera", "Oat protein", "Sunflower oil"],
    howToUse:
      "After washing, squeeze out excess water and work a generous amount through the lengths. Leave for five minutes and rinse.",
  },
  {
    slug: "bath-ritual-set",
    name: "Bath Ritual Set",
    categorySlug: "gifts",
    tagline: "Bar, brush and towel",
    description:
      "Our cedar body bar with a beechwood bath brush and an organic cotton towel, wrapped in recycled paper.",
    priceCents: 7200,
    size: "3 pieces",
    quantity: 12,
    images: [
      {
        src: unsplash("1590439471364-192aa70c0b53"),
        alt: "A folded cotton towel, a round body bar and a wooden bath brush on linen",
      },
    ],
    keyIngredients: ["Cedar body bar", "Beechwood brush", "Organic cotton towel"],
    howToUse:
      "Brush dry skin in long strokes towards the heart before bathing, then wash with the bar and wrap up in the towel.",
  },
  {
    slug: "fragrance-discovery-set",
    name: "Fragrance Discovery Set",
    categorySlug: "gifts",
    tagline: "Three scents to try",
    description:
      "Vetiver, neroli and fig in travel sizes, so you can wear each for a few days before choosing a full bottle.",
    priceCents: 4800,
    size: "3 × 10 mL",
    quantity: 5,
    badge: "Limited",
    images: [
      {
        src: unsplash("1622618991746-fe6004db3a47"),
        alt: "Three amber fragrance bottles catching warm light",
      },
    ],
    keyIngredients: ["Vetiver", "Neroli", "Fig leaf"],
    howToUse: "Apply to pulse points: wrists, neck and behind the ears. Do not rub.",
  },
  {
    slug: "evening-candle-gift",
    name: "Evening Candle Gift",
    categorySlug: "gifts",
    tagline: "Candle with a wool throw",
    description:
      "A hand-poured amber and tonka candle with a small undyed wool throw, for slow evenings at home.",
    priceCents: 9600,
    size: "2 pieces",
    quantity: 8,
    images: [
      {
        src: unsplash("1603006905003-be475563bc59"),
        alt: "A lit candle in a smoked glass vessel on a soft wool throw",
      },
    ],
    keyIngredients: ["Rapeseed wax", "Amber and tonka", "Undyed wool"],
    howToUse:
      "Burn for at least two hours the first time so the surface melts evenly. Trim the wick to 5 mm before each use.",
  },
];
