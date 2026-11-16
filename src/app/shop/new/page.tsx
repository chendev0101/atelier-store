import type { Metadata } from "next";
import { ProductCard, ProductGrid } from "@/components/product/product-card";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { TextLink } from "@/components/ui/text-link";
import { getNewProducts } from "@/db/queries/catalog";
import { toCardProps } from "@/lib/catalog";

const description = "Our latest formulations for skin, body and hair, newest first.";

export const metadata: Metadata = { title: "New formulations", description };

/* Static segment, so it takes precedence over /shop/[slug]. */
export default async function NewArrivalsPage() {
  const products = await getNewProducts();
  const count = `${products.length} ${products.length === 1 ? "product" : "products"}`;

  return (
    <>
      <Container className="pt-6 md:pt-8">
        <nav aria-label="Breadcrumb" className="text-meta">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              {/* Brand name, not "Home": that's also a category. */}
              <TextLink variant="nav" href="/">
                Atelier
              </TextLink>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-ink">
              New formulations
            </li>
          </ol>
        </nav>
      </Container>

      <Container className="hairline-b pt-10 pb-8 md:pt-14 md:pb-10">
        <p className="eyebrow">Just arrived</p>
        <h1 className="mt-3">New formulations</h1>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <p className="text-lead max-w-xl">{description}</p>
          <p className="text-meta">{count}</p>
        </div>
      </Container>

      <Container className="pt-10 pb-16 md:pt-14 md:pb-24">
        {products.length > 0 ? (
          <ProductGrid>
            {products.map((p) => (
              <ProductCard key={p.slug} {...toCardProps(p)} imageFit="cover" />
            ))}
          </ProductGrid>
        ) : (
          <div className="py-16 text-center">
            <h2>Nothing new just now</h2>
            <p className="text-meta mt-3">New formulations are on their way.</p>
            <ButtonLink href="/" variant="secondary" className="mt-8">
              Back to the atelier
            </ButtonLink>
          </div>
        )}
      </Container>
    </>
  );
}
