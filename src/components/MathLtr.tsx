"use client";

import type { ReactNode } from "react";

/** Keeps numbers and equations left-to-right inside Hebrew UI. */
export function MathLtr({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span dir="ltr" className={`unicode-bidi-isolate ${className}`}>
      {children}
    </span>
  );
}
