import Image from "next/image";
import { cn } from "@/lib/cn";
import type { ImageAsset } from "@/lib/catalog";

/**
 * Large product imagery. Mobile: a swipeable, snap-scrolling strip that bleeds
 * to the screen edge (the next image peeks in). lg+: images stacked in a
 * column so they stay large while the details panel stays in view.
 */
export function ProductGallery({ images, name }: { images: ImageAsset[]; name: string }) {
  const many = images.length > 1;
  return (
    <ul
      aria-label={`${name} images`}
      className={cn(
        "-mx-gutter flex snap-x snap-mandatory scroll-px-gutter gap-3 overflow-x-auto px-gutter [scrollbar-width:none]",
        "md:-mx-gutter-md md:scroll-px-gutter-md md:px-gutter-md",
        "lg:mx-0 lg:flex-col lg:gap-4 lg:overflow-visible lg:px-0",
      )}
    >
      {images.map((img, i) => (
        <li
          key={img.src}
          className={cn("shrink-0 snap-start lg:w-full", many ? "w-[88%] md:w-[70%]" : "w-full")}
        >
          <div className="media-well aspect-product">
            <Image
              src={img.src}
              alt={img.alt}
              fill
              preload={i === 0}
              sizes="(min-width: 64rem) 55vw, 90vw"
              className="object-cover"
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
