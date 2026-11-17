"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const links = [
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/inventory", label: "Inventory" },
  { href: "/admin/orders", label: "Orders" },
];

/** Section links; the current section is marked with aria-current. */
export function AdminNav({ className }: { className?: string }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin" className={className}>
      <ul className="flex gap-5 overflow-x-auto lg:flex-col lg:gap-3">
        {links.map(({ href, label }) => {
          const current = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href} className="shrink-0">
              <Link
                href={href}
                aria-current={current ? "page" : undefined}
                className={cn("link-nav text-sm", current ? "text-ink" : "text-ink-muted")}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
