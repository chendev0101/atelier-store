import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/cn";

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  /** Optional trailing text link, e.g. "View all". */
  action?: { label: string; href: string };
  id?: string;
  className?: string;
};

/** Eyebrow + serif heading, with an optional link aligned to the baseline. */
export function SectionHeading({ eyebrow, title, action, id, className }: SectionHeadingProps) {
  return (
    <div className={cn("mb-10 flex items-end justify-between gap-6 md:mb-14", className)}>
      <div>
        <p className="eyebrow mb-3">{eyebrow}</p>
        <h2 id={id}>{title}</h2>
      </div>
      {action && (
        <ButtonLink href={action.href} variant="text" className="shrink-0 text-sm">
          {action.label}
        </ButtonLink>
      )}
    </div>
  );
}
