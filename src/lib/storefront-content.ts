import type { ImageAsset } from "@/lib/catalog";

/*
 * Editorial content for the storefront: imagery, copy and the hand-picked
 * product lists on the homepage. Products themselves come from the database
 * (`@/db/queries/catalog`). Images are Unsplash photographs, chosen to carry
 * no visible third-party branding.
 */

const unsplash = (id: string) => `https://images.unsplash.com/photo-${id}`;

export const heroImage: ImageAsset = {
  src: unsplash("1608571423902-eed4a5ad8108"),
  alt: "An amber glass dropper bottle on a turned wooden stand, palm shadows falling across a pale wall",
};

export const newArrivalSlugs = [
  "rosehip-facial-oil",
  "oat-cleansing-balm",
  "geranium-hand-wash",
  "neroli-body-lotion",
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
  productSlugs: ["cedar-candle", "vetiver-eau-de-parfum", "cedar-body-bar"],
};

export const ritualImage: ImageAsset = {
  src: unsplash("1620626011761-996317b8d101"),
  alt: "A calm white bathroom with a freestanding tub, a bamboo bath tray and a fern by the window",
};

export const approachImage: ImageAsset = {
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
