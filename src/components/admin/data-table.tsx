import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/cn";

/* Plain semantic table primitives in the admin's dense style. */

export function Table({ className, ...props }: ComponentPropsWithoutRef<"table">) {
  return (
    <div className="-mx-5 overflow-x-auto px-5 md:mx-0 md:px-0">
      <table className={cn("w-full border-collapse text-sm", className)} {...props} />
    </div>
  );
}

export function Th({ className, ...props }: ComponentPropsWithoutRef<"th">) {
  return (
    <th
      scope="col"
      className={cn(
        "hairline-b py-3 pr-4 text-left text-xs font-medium whitespace-nowrap text-ink-muted last:pr-0",
        className,
      )}
      {...props}
    />
  );
}

export function Td({ className, ...props }: ComponentPropsWithoutRef<"td">) {
  return (
    <td className={cn("hairline-b py-3 pr-4 align-middle last:pr-0", className)} {...props} />
  );
}

export function EmptyRow({ colSpan, children }: { colSpan: number; children: React.ReactNode }) {
  return (
    <tr>
      <td colSpan={colSpan} className="text-meta py-10 text-center text-sm">
        {children}
      </td>
    </tr>
  );
}
