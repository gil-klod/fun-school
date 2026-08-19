"use client";

import Link from "next/link";
import { DirectionalArrow } from "@/components/DirectionalArrow";
import { useLocale } from "@/i18n/LocaleProvider";

interface BackButtonProps {
  href: string;
  label?: string;
}

export function BackButton({ href, label }: BackButtonProps) {
  const { t } = useLocale();
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-semibold transition-colors mb-2"
    >
      <DirectionalArrow direction="back" className="text-xl" />
      {label ?? t("common.back")}
    </Link>
  );
}
