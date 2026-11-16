"use client";

import Link from "next/link";
import { type ReactNode, useEffect, useState } from "react";
import { TextLink } from "@/components/ui/text-link";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/cn";

export type NavItem = { label: string; href: string };

const defaultNav: NavItem[] = [
  { label: "Skin", href: "/shop/skin" },
  { label: "Body", href: "/shop/body" },
  { label: "Hair", href: "/shop/hair" },
  { label: "Fragrance", href: "/shop/fragrance" },
  { label: "Home", href: "/shop/home" },
  { label: "Gifts", href: "/shop/gifts" },
];

/**
 * Sticky, hairline-bordered header.
 * ≥ lg: wordmark left, category links inline, utility links right.
 * < lg: menu toggle, centered wordmark, cart; full-height drawer.
 */
export function SiteHeader({
  nav = defaultNav,
  cartLink,
}: {
  nav?: NavItem[];
  /** Server-rendered cart link (with count), passed in from the layout. */
  cartLink: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  // While the session loads, show "Account": /account sends guests to sign-in anyway.
  const { data: session, isPending } = authClient.useSession();
  const accountLink: NavItem =
    isPending || session
      ? { label: "Account", href: "/account" }
      : { label: "Sign in", href: "/sign-in" };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header className="hairline-b sticky top-0 z-40 bg-paper/95 backdrop-blur-sm">
      <div className="container-page flex h-header items-center justify-between gap-6">
        {/* Mobile: menu toggle */}
        <button
          type="button"
          className="-ml-2 p-2 text-sm lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Close" : "Menu"}
        </button>

        <Link
          href="/"
          className="font-serif text-xl tracking-tightish max-lg:absolute max-lg:left-1/2 max-lg:-translate-x-1/2"
        >
          Atelier
        </Link>

        <nav aria-label="Primary" className="hidden flex-1 lg:block">
          <ul className="flex gap-8 text-sm">
            {nav.map((item) => (
              <li key={item.href}>
                <TextLink variant="nav" href={item.href}>
                  {item.label}
                </TextLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-6 text-sm">
          <TextLink variant="nav" href="/search" className="hidden lg:inline">
            Search
          </TextLink>
          <TextLink variant="nav" href={accountLink.href} className="hidden lg:inline">
            {accountLink.label}
          </TextLink>
          {cartLink}
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        id="mobile-nav"
        hidden={!open}
        className="hairline-t fixed inset-x-0 top-header bottom-0 overflow-y-auto bg-paper lg:hidden"
      >
        <nav aria-label="Mobile" className="container-page py-8">
          <ul className="flex flex-col">
            {[...nav, { label: "Search", href: "/search" }, accountLink].map(
              (item, i) => (
                <li key={item.href} className={cn("hairline-b", i === nav.length && "mt-8")}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center justify-between py-4",
                      i < nav.length ? "font-serif text-2xl" : "text-base",
                    )}
                  >
                    {item.label}
                    <span aria-hidden="true" className="text-ink-subtle">
                      →
                    </span>
                  </Link>
                </li>
              ),
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}
