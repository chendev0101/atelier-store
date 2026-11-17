import { ButtonLink } from "@/components/ui/button";

/** Previous / next links; `hrefFor` builds the URL for a page number. */
export function Pagination({
  page,
  hasNext,
  hrefFor,
}: {
  page: number;
  hasNext: boolean;
  hrefFor: (page: number) => string;
}) {
  if (page <= 1 && !hasNext) return null;
  return (
    <nav aria-label="Pagination" className="mt-6 flex items-center justify-between gap-4 text-sm">
      {page > 1 ? (
        <ButtonLink href={hrefFor(page - 1)} variant="secondary" size="sm">
          ← Previous
        </ButtonLink>
      ) : (
        <span />
      )}
      <span className="text-meta">Page {page}</span>
      {hasNext ? (
        <ButtonLink href={hrefFor(page + 1)} variant="secondary" size="sm">
          Next →
        </ButtonLink>
      ) : (
        <span />
      )}
    </nav>
  );
}
