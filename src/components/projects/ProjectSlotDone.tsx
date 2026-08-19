"use client";

import Link from "next/link";
import { useLocale } from "@/i18n/LocaleProvider";

export function ProjectSlotDone() {
  const { t } = useLocale();
  return (
    <div className="text-center py-4 space-y-3">
      <p className="text-lg font-bold text-emerald-700">{t("projects.slotComplete")}</p>
      <Link href="/" className="game-btn game-btn-primary inline-block">
        {t("projects.backToHome")}
      </Link>
    </div>
  );
}
