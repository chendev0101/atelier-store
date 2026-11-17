"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

type Props = Omit<Parameters<typeof Button>[0], "type"> & { pendingLabel?: string };

/** Submit button that disables itself and relabels while its form submits. */
export function SubmitButton({ children, pendingLabel = "Saving…", disabled, ...props }: Props) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={disabled || pending} aria-disabled={pending} {...props}>
      {pending ? pendingLabel : children}
    </Button>
  );
}
