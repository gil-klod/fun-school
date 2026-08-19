"use client";

import { useLocale } from "@/i18n/LocaleProvider";

type ArrowDirection = "forward" | "back";

interface DirectionalArrowProps {
  direction?: ArrowDirection;
  className?: string;
}

/** → in LTR, ← in RTL for forward; opposite for back. */
export function DirectionalArrow({ direction = "forward", className = "" }: DirectionalArrowProps) {
  const { dir } = useLocale();
  const rtl = dir === "rtl";
  const char =
    direction === "forward" ? (rtl ? "←" : "→") : rtl ? "→" : "←";

  return (
    <span className={className} aria-hidden>
      {char}
    </span>
  );
}
