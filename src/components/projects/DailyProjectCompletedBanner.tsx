"use client";

import Link from "next/link";
import { DailyProjectCalendar } from "@/components/projects/DailyProjectCalendar";
import { useLocale } from "@/i18n/LocaleProvider";
import type { DailyProjectPayload } from "@/lib/projects/types";

interface DailyProjectCompletedBannerProps {
  project: DailyProjectPayload;
  studentName: string;
}

export function DailyProjectCompletedBanner({
  project,
  studentName,
}: DailyProjectCompletedBannerProps) {
  const { t } = useLocale();

  return (
    <section className="mb-6 bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-3xl p-4 sm:p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
        <div>
          <p className="text-xs font-semibold tracking-wide text-amber-600">
            {t("projects.dailyTask")}
          </p>
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">{project.name}</h2>
        </div>
        <Link
          href="/settings#projects"
          className="text-sm font-semibold text-amber-700 hover:underline shrink-0"
        >
          {t("projects.edit")}
        </Link>
      </div>

      <DailyProjectCalendar project={project} />

      <div className="rounded-2xl border-2 border-amber-200 bg-white/80 p-4 text-center">
        <p className="text-3xl mb-2" aria-hidden>
          🏆
        </p>
        <p className="text-lg font-bold text-gray-800">
          {t("projects.projectCompleteTitle", { name: studentName })}
        </p>
        <p className="mt-2 text-sm text-gray-600 leading-relaxed">{t("projects.projectCompleteBody")}</p>
      </div>
    </section>
  );
}
