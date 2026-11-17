import type { ReactNode } from "react";

/** Admin page title row with an optional action on the right. */
export function PageHeader({
  title,
  eyebrow,
  description,
  action,
}: {
  title: ReactNode;
  eyebrow?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && <div className="text-meta mb-2 text-xs">{eyebrow}</div>}
        <h1 className="text-3xl md:text-4xl">{title}</h1>
        {description && <p className="text-meta mt-2 text-sm">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}
