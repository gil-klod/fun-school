"use client";

import Link from "next/link";

interface BackButtonProps {
  href: string;
  label?: string;
}

export function BackButton({ href, label = "Back" }: BackButtonProps) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-semibold transition-colors mb-4"
    >
      <span className="text-xl">←</span>
      {label}
    </Link>
  );
}
