import Image from "next/image";
import Link from "next/link";
import { ProductRail } from "@/components/product/product-rail";
import { SectionHeading } from "@/components/ui/section-heading";
import { ButtonLink } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import { getCategories, getNewProducts, getProductsBySlugs } from "@/db/queries/catalog";
import {
  approachImage,
  featuredSeries,
  heroImage,
  ritualImage,
  services,
} from "@/lib/storefront-content";

export default async function Home() {
  const [ranges, newArrivals, seriesProducts] = await Promise.all([
    getCategories(),
    getNewProducts(4),
    getProductsBySlugs(featuredSeries.productSlugs),
  ]);

  return (
    <>
      {/* Hero: tall image beside the headline; image leads on mobile */}
      <section aria-labelledby="hero-title" className="hairline-b grid lg:grid-cols-12">
        <div className="media-well aspect-product lg:order-2 lg:col-span-7 lg:aspect-auto lg:min-h-[calc(100svh-var(--spacing-header))]">
          <Image
            src={heroImage.src}
            alt={heroImage.alt}
            fill
            preload
            sizes="(min-width: 64rem) 58vw, 100vw"
            className="object-cover"
          />
        </div>
        <div className="container-page flex flex-col justify-center gap-6 py-12 md:py-16 lg:order-1 lg:col-span-5 lg:py-24 lg:pr-12">
          <p className="eyebrow">New formulation</p>
          <h1 id="hero-title" className="text-hero max-w-xl">
            Formulations made with patience
          </h1>
          <p className="text-lead max-w-md">
            Plant-based essentials for skin, body and home, composed in small batches and meant to
            be refilled.
          </p>
          <div className="mt-2 flex flex-wrap gap-4">
            <ButtonLink href="/shop/skin">Shop skin care</ButtonLink>
            <ButtonLink href="/about" variant="secondary">
              Our approach
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* New arrivals: hidden when nothing is flagged new */}
      {newArrivals.length > 0 && (
        <Section aria-labelledby="new-title">
          <Container>
            <SectionHeading
              id="new-title"
              eyebrow="Just arrived"
              title="New formulations"
              action={{ label: "View all", href: "/shop/new" }}
            />
            <ProductRail products={newArrivals} label="New formulations" />
          </Container>
        </Section>
      )}

      {/* Shop by range */}
      <Section aria-labelledby="ranges-title" className="hairline-t">
        <Container>
          <SectionHeading id="ranges-title" eyebrow="Shop by range" title="For every part of the day" />
          <ul className="grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-6 lg:grid-cols-4 lg:gap-x-8">
            {ranges.map((range) => (
              <li key={range.href}>
                <Link href={range.href} className="group block focus-visible:outline-offset-4">
                  <div className="media-well aspect-product">
                    <Image
                      src={range.image.src}
                      alt={range.image.alt}
                      fill
                      sizes="(min-width: 64rem) 25vw, 50vw"
                      className="object-cover transition-transform duration-600 ease-standard group-hover:scale-[1.03]"
                    />
                  </div>
                  <h3 className="mt-4">{range.name}</h3>
                  <p className="text-meta mt-1">{range.note}</p>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {/* Featured series */}
      <Section tone="deep" aria-labelledby="series-title">
        <Container>
          <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-8">
            <div className="media-well aspect-product lg:col-span-6 lg:aspect-square">
              <Image
                src={featuredSeries.image.src}
                alt={featuredSeries.image.alt}
                fill
                sizes="(min-width: 64rem) 50vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="lg:col-span-5 lg:col-start-8">
              <p className="eyebrow mb-4">{featuredSeries.eyebrow}</p>
              <h2 id="series-title" className="text-hero">
                {featuredSeries.title}
              </h2>
              <p className="text-lead mt-6 max-w-md">{featuredSeries.body}</p>
              <ButtonLink href={featuredSeries.href} variant="secondary" className="mt-8">
                Explore the series
              </ButtonLink>
            </div>
          </div>
          <div className="mt-16 md:mt-20">
            <ProductRail
              products={seriesProducts}
              columns={3}
              label={`${featuredSeries.title} products`}
            />
          </div>
        </Container>
      </Section>

      {/* Full-bleed editorial band */}
      <section
        aria-labelledby="ritual-title"
        className="relative isolate flex min-h-[80svh] items-end overflow-hidden bg-ink text-ink-inverse lg:min-h-[44rem]"
      >
        <Image
          src={ritualImage.src}
          alt={ritualImage.alt}
          fill
          sizes="100vw"
          className="-z-10 object-cover object-[40%_center]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-linear-to-t from-ink/85 via-ink/35 to-ink/0 lg:bg-linear-to-r lg:from-ink/75 lg:via-ink/25"
        />
        <div className="container-page section-y">
          <div className="max-w-lg">
            <p className="eyebrow mb-4 text-ink-inverse/75">The evening ritual</p>
            <h2 id="ritual-title" className="text-hero">
              Three steps, ten quiet minutes
            </h2>
            <p className="mt-6 text-lg text-ink-inverse/85">
              Draw a warm bath, cleanse with the balm, and press in a few drops of oil while the
              room settles by candlelight.
            </p>
            <ButtonLink href="/journal/evening-ritual" variant="inverse" className="mt-8">
              Read the ritual
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* Approach */}
      <Section aria-labelledby="approach-title">
        <Container className="grid-page items-center">
          <div className="media-well col-span-4 aspect-product md:col-span-4 lg:col-span-5">
            <Image
              src={approachImage.src}
              alt={approachImage.alt}
              fill
              sizes="(min-width: 64rem) 40vw, (min-width: 48rem) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="col-span-4 md:col-span-4 lg:col-span-5 lg:col-start-7">
            <p className="eyebrow mb-4">Our approach</p>
            <h2 id="approach-title">Considered ingredients, quietly presented</h2>
            <p className="text-lead mt-6">
              Every product is developed to be used thoughtfully and replenished, not replaced.
            </p>
            <p className="mt-4 text-ink-muted">
              We work with a small number of growers, keep our formulas short, and pack them in
              amber glass and aluminium that can be returned, refilled or recycled.
            </p>
            <ButtonLink href="/about" variant="text" className="mt-8">
              Read more
            </ButtonLink>
          </div>
        </Container>
      </Section>

      {/* Services */}
      <section aria-label="Services" className="hairline-t bg-paper-deep">
        <Container as="ul" className="grid gap-10 py-14 md:grid-cols-3 md:gap-8 md:py-20">
          {services.map((s) => (
            <li key={s.title}>
              <h3>{s.title}</h3>
              <p className="text-meta mt-3 max-w-xs">{s.body}</p>
            </li>
          ))}
        </Container>
      </section>
    </>
  );
}
