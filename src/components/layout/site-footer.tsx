import { Button } from "@/components/ui/button";
import { TextLink } from "@/components/ui/text-link";

const columns = [
  {
    title: "Shop",
    links: [
      { label: "Skin", href: "/shop/skin" },
      { label: "Body", href: "/shop/body" },
      { label: "Fragrance", href: "/shop/fragrance" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Shipping", href: "/help/shipping" },
      { label: "Returns", href: "/help/returns" },
      { label: "Contact", href: "/help/contact" },
    ],
  },
  {
    title: "About",
    links: [
      { label: "Our approach", href: "/about" },
      { label: "Stores", href: "/stores" },
    ],
  },
];

/** Dark footer: newsletter + link columns. Stacks on mobile, 12-col on desktop. */
export function SiteFooter() {
  return (
    <footer className="bg-ink text-ink-inverse">
      <div className="container-page section-y grid-page">
        <form className="col-span-4 md:col-span-8 lg:col-span-5" action="#">
          <h2 className="text-xl md:text-2xl">Letters from the atelier</h2>
          <p className="mt-3 text-sm text-ink-inverse/70">
            Occasional notes on new formulations and seasonal rituals.
          </p>
          <div className="mt-6 flex items-end gap-4">
            <label className="flex-1">
              <span className="sr-only">Email address</span>
              <input
                type="email"
                required
                placeholder="Email address"
                className="field border-ink-inverse/30! text-ink-inverse! placeholder:text-ink-inverse/50 focus:border-ink-inverse!"
              />
            </label>
            <Button type="submit" variant="inverse" size="sm">
              Subscribe
            </Button>
          </div>
        </form>

        {columns.map((col, i) => (
          <div key={col.title} className={i === 0 ? "col-span-2 lg:col-start-7" : "col-span-2"}>
            <h3 className="eyebrow text-ink-inverse/60">{col.title}</h3>
            <ul className="mt-4 space-y-3 text-sm">
              {col.links.map((l) => (
                <li key={l.href}>
                  <TextLink variant="nav" href={l.href}>
                    {l.label}
                  </TextLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="container-page border-t border-ink-inverse/15 py-6 text-xs text-ink-inverse/60">
        © Atelier
      </div>
    </footer>
  );
}
