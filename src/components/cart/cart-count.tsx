"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The "(n)" after "Cart". Gives a small bump when the count goes up, so an
 * add is noticeable from anywhere on the page; no motion on first render or
 * when the count drops.
 */
export function CartCount({ count }: { count: number }) {
  const previous = useRef(count);
  const [bumpKey, setBumpKey] = useState(0);

  useEffect(() => {
    if (count > previous.current) setBumpKey((k) => k + 1);
    previous.current = count;
  }, [count]);

  if (count === 0) return null;
  return (
    <span
      key={bumpKey}
      className={bumpKey > 0 ? "inline-block animate-bump tabular-nums" : "inline-block tabular-nums"}
    >
      &nbsp;({count})
    </span>
  );
}
