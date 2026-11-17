import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProductCard, ProductGrid } from "@/components/product/product-card";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { TextLink } from "@/components/ui/text-link";
import { getCategories, getCategoryWithProducts } from "@/db/queries/catalog";
import { toCardProps } from "@/lib/catalog";

export async function generateStaticParams() {
  return (await getCategories()).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/shop/[slug]">): Promise<Metadata> {
  const data = await getCategoryWithProducts((await params).slug);
  if (!data) return {};
  return {
    title: data.category.name,
    description: data.category.note,
    openGraph: { images: [data.category.image.src] },
  };
}

type Params = PageProps<"/shop/[slug]">["params"];

/* Depends on the URL, so it renders inside <Suspense> (see products/[slug]). */
export default function CategoryPage({ params }: PageProps<"/shop/[slug]">) {
  return (
    <Suspense fallback={<CategoryPageFallback />}>
      <CategoryListing params={params} />
    </Suspense>
  );
}

function CategoryPageFallback() {
  return (
    <Container className="pt-14 pb-16 md:pt-16 md:pb-24">
      <div aria-busy="true" className="min-h-40">
        <span className="sr-only">Loading products</span>
      </div>
      <ProductGrid>
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="media-well aspect-product" />
        ))}
      </ProductGrid>
    </Container>
  );
}

async function CategoryListing({ params }: { params: Params }) {
  const { slug } = await params;
  const [data, categories] = await Promise.all([getCategoryWithProducts(slug), getCategories()]);
  if (!data) notFound();

  const { category, products } = data;
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
              {category.name}
            </li>
          </ol>
        </nav>
      </Container>

      <Container className="hairline-b pt-10 pb-8 md:pt-14 md:pb-10">
        <p className="eyebrow">Shop by range</p>
        <h1 className="mt-3">{category.name}</h1>
        <p className="text-lead mt-4 max-w-xl">{category.note}</p>

        <div className="mt-8 flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <nav aria-label="Ranges" className="-mx-gutter overflow-x-auto px-gutter md:mx-0 md:px-0">
            <ul className="flex gap-6 text-sm whitespace-nowrap">
              {categories.map((c) => (
                <li key={c.slug}>
                  <TextLink
                    variant="nav"
                    href={c.href}
                    aria-current={c.slug === category.slug ? "page" : undefined}
                    className={c.slug === category.slug ? "text-ink" : "text-ink-muted"}
                  >
                    {c.name}
                  </TextLink>
                </li>
              ))}
            </ul>
          </nav>
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
            <h2>Nothing here yet</h2>
            <p className="text-meta mt-3">
              New {category.name.toLowerCase()} formulations are on their way.
            </p>
            <ButtonLink href="/" variant="secondary" className="mt-8">
              Back to the atelier
            </ButtonLink>
          </div>
        )}
      </Container>
    </>
  );
}
