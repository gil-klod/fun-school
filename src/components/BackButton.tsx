"use client";

import Link from "next/link";
import { useLocale } from "@/i18n/LocaleProvider";

interface BackButtonProps {
  href: string;
  label?: string;
}

export function BackButton({ href, label }: BackButtonProps) {
  const { t, dir } = useLocale();
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-semibold transition-colors mb-4"
    >
      <span className="text-xl">{dir === "rtl" ? "→" : "←"}</span>
      {label ?? t("common.back")}
    </Link>
  );
}
