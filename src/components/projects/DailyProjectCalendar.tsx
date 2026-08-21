"use client";

import { useLocale } from "@/i18n/LocaleProvider";
import { daySlotsDone, isDayFullyComplete } from "@/lib/projects/dayProgress";
import type { DailyProjectPayload } from "@/lib/projects/types";

interface DailyProjectCalendarProps {
  project: DailyProjectPayload;
}

export function DailyProjectCalendar({ project }: DailyProjectCalendarProps) {
  const { t } = useLocale();

  return (
    <div className="mb-4">
      <p className="text-xs font-semibold text-gray-500 mb-2">{t("projects.calendarTitle")}</p>
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
        {project.days.map((day) => {
          const done = daySlotsDone(day);
          const complete = isDayFullyComplete(day);
          const isCurrent = day.dayNumber === project.currentDay && project.status === "active";
          const isPartial = done > 0 && !complete;

          let cellClass =
            "border-gray-200 bg-white text-gray-500";
          if (complete) {
            cellClass = "border-emerald-300 bg-emerald-50 text-emerald-800";
          } else if (isPartial) {
            cellClass = "border-amber-300 bg-amber-50 text-amber-800";
          } else if (isCurrent) {
            cellClass = "border-indigo-400 bg-indigo-50 text-indigo-800";
          }

          return (
            <div
              key={day.dayNumber}
              className={`shrink-0 w-11 rounded-xl border-2 px-1 py-2 text-center transition-colors ${cellClass} ${
                isCurrent ? "ring-2 ring-indigo-400 ring-offset-1" : ""
              }`}
              title={t("projects.calendarDayHint", {
                day: day.dayNumber,
                done: String(done),
              })}
            >
              <p className="text-[10px] font-semibold leading-none opacity-70">
                {t("projects.dayN", { day: day.dayNumber })}
              </p>
              <p className="mt-1 text-sm leading-none" aria-hidden>
                {complete ? "✅" : isPartial ? `${done}/3` : isCurrent ? "📍" : "·"}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
