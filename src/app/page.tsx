import { ProductCard, ProductGrid } from "@/components/product/product-card";
import { ButtonLink } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";

// Placeholder catalogue until products come from the database.
const products = [
  { href: "/products/1", name: "Botanical Cleansing Gel", description: "Gentle daily cleanser", price: "$38", size: "200 mL" },
  { href: "/products/2", name: "Rosehip Facial Oil", description: "Nourishing overnight oil", price: "$64", size: "30 mL" },
  { href: "/products/3", name: "Cedar Hand Balm", description: "Rich, fast-absorbing", price: "$29", size: "75 mL", badge: "New" },
  { href: "/products/4", name: "Vetiver Room Mist", description: "Woody, grounding", price: "$52", size: "100 mL" },
];

export default function Home() {
  return (
    <>
      {/* Hero: split text / image well, stacks on mobile */}
      <section className="hairline-b">
        <div className="grid lg:grid-cols-2">
          <div className="container-page flex flex-col justify-center gap-6 py-16 lg:py-24 lg:pr-16">
            <p className="eyebrow">New season</p>
            <h1 className="text-hero max-w-xl">Formulations made with patience</h1>
            <p className="text-lead max-w-md">
              Plant-based essentials for skin, body and home, composed in small batches.
            </p>
            <div className="mt-2 flex flex-wrap gap-4">
              <ButtonLink href="/shop/skin">Shop skin care</ButtonLink>
              <ButtonLink href="/about" variant="secondary">
                Our approach
              </ButtonLink>
            </div>
          </div>
          <div className="media-well aspect-editorial lg:aspect-auto lg:min-h-[36rem]" />
        </div>
      </section>

      <Section>
        <Container>
          <div className="mb-10 flex items-end justify-between gap-6 md:mb-14">
            <div>
              <p className="eyebrow mb-3">Featured</p>
              <h2>Daily essentials</h2>
            </div>
            <ButtonLink href="/shop" variant="text" className="shrink-0 text-sm">
              View all
            </ButtonLink>
          </div>
          <ProductGrid>
            {products.map((p) => (
              <ProductCard key={p.href} {...p} />
            ))}
          </ProductGrid>
        </Container>
      </Section>

      <Section tone="deep">
        <Container width="prose" className="text-center">
          <p className="eyebrow mb-4">Our approach</p>
          <h2>Considered ingredients, quietly presented</h2>
          <p className="text-lead mt-6">
            Every product is developed to be used thoughtfully and replenished, not replaced.
          </p>
          <ButtonLink href="/about" variant="text" className="mt-8">
            Read more
          </ButtonLink>
        </Container>
      </Section>
    </>
  );
}
