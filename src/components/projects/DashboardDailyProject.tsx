"use client";

import Link from "next/link";
import { DailyProjectCalendar } from "@/components/projects/DailyProjectCalendar";
import { useLocale } from "@/i18n/LocaleProvider";
import {
  daySlotsDone,
  projectDaysComplete,
  projectProgressPercent,
  projectSlotsComplete,
  projectTotalSlots,
} from "@/lib/projects/dayProgress";
import type { DailyProjectPayload } from "@/lib/projects/types";

interface DashboardDailyProjectProps {
  project: DailyProjectPayload;
}

export function DashboardDailyProject({ project }: DashboardDailyProjectProps) {
  const { t } = useLocale();

  const daysDone = projectDaysComplete(project);
  const slotsDone = projectSlotsComplete(project);
  const slotsTotal = projectTotalSlots(project);
  const percent = projectProgressPercent(project);
  const currentDay = project.days.find((d) => d.dayNumber === project.currentDay);
  const todayDone = currentDay ? daySlotsDone(currentDay) : 0;
  const isProjectComplete = project.status === "completed";

  return (
    <section className="bg-gradient-to-br from-violet-50 to-indigo-50 border-2 border-indigo-200 rounded-3xl p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <p className="text-xs font-semibold tracking-wide text-indigo-500">
            {t("projects.dailyTask")}
          </p>
          <h2 className="text-lg font-bold text-gray-800">{project.name}</h2>
          <p className="text-sm text-gray-600 mt-1">
            {isProjectComplete
              ? t("dashboard.dailyProjectComplete")
              : t("dashboard.dailyProjectProgress", {
                  days: daysDone,
                  total: project.totalDays,
                  slots: slotsDone,
                  slotsTotal,
                  today: todayDone,
                })}
          </p>
        </div>
        <Link
          href="/"
          className="game-btn game-btn-secondary text-sm py-2 px-4 shrink-0"
        >
          {t("dashboard.dailyProjectContinue")}
        </Link>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between text-xs font-semibold text-gray-500 mb-1">
          <span>{t("dashboard.dailyProjectOverall")}</span>
          <span>{percent}%</span>
        </div>
        <div className="h-3 bg-white rounded-full border border-indigo-100 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              isProjectComplete ? "bg-emerald-500" : "bg-indigo-500"
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <DailyProjectCalendar project={project} />
    </section>
  );
}
