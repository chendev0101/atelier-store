import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { type ReactNode, Suspense } from "react";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductRail } from "@/components/product/product-rail";
import { StockStatus } from "@/components/product/stock-status";
import { Button } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { TextLink } from "@/components/ui/text-link";
import { getProduct, getProductSlugs, getRelatedProducts } from "@/db/queries/catalog";
import { formatPrice } from "@/lib/catalog";

export async function generateStaticParams() {
  return (await getProductSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/products/[slug]">): Promise<Metadata> {
  const product = await getProduct((await params).slug);
  if (!product) return {};
  const image = product.images[0];
  return {
    title: product.name,
    description: product.description,
    openGraph: image ? { images: [image.src] } : undefined,
  };
}

type Params = PageProps<"/products/[slug]">["params"];

/*
 * Everything here depends on the URL, so it renders inside <Suspense>: the
 * route's shared App Shell can't hold one product's data. Slugs from
 * generateStaticParams are still fully prerendered.
 */
export default function ProductPage({ params }: PageProps<"/products/[slug]">) {
  return (
    <Suspense fallback={<ProductPageFallback />}>
      <ProductDetails params={params} />
    </Suspense>
  );
}

function ProductPageFallback() {
  return (
    <Container className="grid gap-10 pt-14 pb-16 md:pt-16 md:pb-24 lg:grid-cols-12 lg:gap-8">
      <div className="media-well aspect-product lg:col-span-7" />
      <div aria-busy="true" className="lg:col-span-5 lg:col-start-8 xl:col-span-4 xl:col-start-9">
        <span className="sr-only">Loading product</span>
      </div>
    </Container>
  );
}

async function ProductDetails({ params }: { params: Params }) {
  const product = await getProduct((await params).slug);
  if (!product) notFound();

  const { category } = product;
  const soldOut = product.stock.state === "out_of_stock";
  const gallery = [
    ...product.images,
    ...(product.images.some((i) => i.src === category.contextImage.src)
      ? []
      : [category.contextImage]),
  ];
  const related = await getRelatedProducts(product.slug);

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
            <li>
              <TextLink variant="nav" href={category.href}>
                {category.name}
              </TextLink>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-ink">
              {product.name}
            </li>
          </ol>
        </nav>
      </Container>

      <Container className="grid gap-10 pt-6 pb-16 md:pt-8 md:pb-24 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-7">
          <ProductGallery images={gallery} name={product.name} />
        </div>

        <div className="lg:sticky lg:top-[calc(var(--spacing-header)+2rem)] lg:col-span-5 lg:col-start-8 lg:self-start xl:col-span-4 xl:col-start-9">
          <TextLink variant="nav" href={category.href} className="eyebrow">
            {category.name}
          </TextLink>
          <h1 className="mt-3">{product.name}</h1>
          <p className="text-lead mt-4">{product.description}</p>

          <div className="hairline-t mt-8 pt-6">
            <div className="flex items-baseline justify-between gap-4">
              <p className="font-serif text-2xl">
                {formatPrice(product.priceCents)}
                <span className="sr-only">, </span>
                <span className="text-meta ml-2 font-sans">{product.size}</span>
              </p>
              <StockStatus stock={product.stock} />
            </div>

            {/* Not wired to a cart yet. */}
            <Button block className="mt-6" disabled={soldOut}>
              {soldOut ? "Sold out" : "Add to bag"}
            </Button>
            {soldOut && (
              <p className="text-meta mt-3">
                We make in small batches; this will be back in stock soon.
              </p>
            )}

            <ul className="text-meta mt-6 space-y-1">
              <li>Complimentary samples with every order</li>
              <li>Free shipping on orders over $75</li>
            </ul>
          </div>

          <div className="hairline-t mt-8">
            <Disclosure title="Key ingredients" defaultOpen>
              <ul className="space-y-1">
                {product.keyIngredients.map((ing) => (
                  <li key={ing}>{ing}</li>
                ))}
              </ul>
            </Disclosure>
            <Disclosure title="How to use">
              <p>{product.howToUse}</p>
            </Disclosure>
            <Disclosure title="Shipping & returns">
              <p>
                Orders ship within two working days. Unopened products can be returned within 30
                days for a full refund.
              </p>
            </Disclosure>
          </div>
        </div>
      </Container>

      <Section tone="deep" aria-labelledby="related-title">
        <Container>
          <SectionHeading
            id="related-title"
            eyebrow="Continue exploring"
            title="You may also like"
            action={{ label: `All ${category.name.toLowerCase()}`, href: category.href }}
          />
          <ProductRail products={related} label="Related products" />
        </Container>
      </Section>
    </>
  );
}

/** Native <details> disclosure: works without JavaScript, keyboard accessible. */
function Disclosure({
  title,
  defaultOpen,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  return (
    <details className="group hairline-b" open={defaultOpen}>
      <summary className="flex min-h-12 cursor-pointer items-center justify-between gap-4 py-4 text-sm font-medium">
        {title}
        <span
          aria-hidden="true"
          className="text-lg leading-none font-light transition-transform duration-300 ease-standard group-open:rotate-45"
        >
          +
        </span>
      </summary>
      <div className="text-meta pb-6">{children}</div>
    </details>
  );
}
