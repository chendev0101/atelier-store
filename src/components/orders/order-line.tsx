import Image from "next/image";
import Link from "next/link";
import type { ImageAsset } from "@/db/schema";
import { formatPrice, productHref } from "@/lib/catalog";

export type OrderLineItem = {
  /** Empty when the product no longer exists; the line then isn't linked. */
  slug: string;
  name: string;
  size: string;
  unitPriceCents: number;
  quantity: number;
  lineTotalCents: number;
};

/** One purchased item: thumbnail, name, size, quantity and line total. */
export function OrderLine({ line, image }: { line: OrderLineItem; image?: ImageAsset }) {
  const thumb = (
    <span className="media-well aspect-product block w-20 shrink-0 md:w-24">
      {image && <Image src={image.src} alt="" fill sizes="96px" className="object-cover" />}
    </span>
  );
  return (
    <li className="hairline-b flex gap-4 py-5 md:gap-6">
      {line.slug ? (
        <Link href={productHref(line.slug)} tabIndex={-1} aria-hidden="true">
          {thumb}
        </Link>
      ) : (
        thumb
      )}
      <div className="flex min-w-0 flex-1 justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium md:text-base">
            {line.slug ? (
              <Link href={productHref(line.slug)} className="link-nav">
                {line.name}
              </Link>
            ) : (
              line.name
            )}
          </p>
          <p className="text-meta mt-1 text-xs">
            {[line.size, `Qty ${line.quantity}`].filter(Boolean).join(" · ")}
          </p>
          {line.quantity > 1 && (
            <p className="text-meta mt-1 text-xs">{formatPrice(line.unitPriceCents)} each</p>
          )}
        </div>
        <p className="text-sm tabular-nums">{formatPrice(line.lineTotalCents)}</p>
      </div>
    </li>
  );
}
