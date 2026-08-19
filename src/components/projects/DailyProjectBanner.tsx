"use client";

import Link from "next/link";
import { useLocale } from "@/i18n/LocaleProvider";
import { getGameTitle, translate } from "@/i18n";
import { projectGameHref } from "@/lib/projects/links";
import { projectSlotContentLocale } from "@/lib/subjectLocale";
import type { DailyProjectPayload, ProjectSlot } from "@/lib/projects/types";
import { PROJECT_SLOTS } from "@/lib/projects/types";
import type { EnglishSubjectId } from "@/lib/projects/types";
import { subjects } from "@/lib/subjects";

const SLOT_EMOJI: Record<ProjectSlot, string> = {
  math: "🔢",
  hebrew: "📖",
  english: "🌱",
};

function slotComplete(day: DailyProjectPayload["days"][0], slot: ProjectSlot): boolean {
  if (slot === "math") return !!day.mathCompletedAt;
  if (slot === "hebrew") return !!day.hebrewCompletedAt;
  return !!day.englishCompletedAt;
}

function slotGame(day: DailyProjectPayload["days"][0], slot: ProjectSlot): string {
  if (slot === "math") return day.math.gameId;
  if (slot === "hebrew") return day.hebrew.gameId;
  return day.english.gameId;
}

interface DailyProjectBannerProps {
  project: DailyProjectPayload;
  studentName: string;
  englishSubjectId: EnglishSubjectId;
}

export function DailyProjectBanner({
  project,
  studentName,
  englishSubjectId,
}: DailyProjectBannerProps) {
  const { t, gameTitle } = useLocale();
  const day = project.days.find((d) => d.dayNumber === project.currentDay);
  if (!day || project.status === "completed") return null;

  const doneCount = PROJECT_SLOTS.filter((slot) => slotComplete(day, slot)).length;

  return (
    <section className="mb-6 bg-gradient-to-br from-violet-50 to-indigo-50 border-2 border-indigo-200 rounded-3xl p-4 sm:p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
            {t("projects.dailyTask")}
          </p>
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">{project.name}</h2>
          <p className="text-sm text-gray-600">
            {t("projects.dayProgress", {
              name: studentName,
              day: project.currentDay,
              total: project.totalDays,
              done: doneCount,
            })}
          </p>
        </div>
        <Link
          href="/settings#projects"
          className="text-sm font-semibold text-indigo-600 hover:underline shrink-0"
        >
          {t("projects.edit")}
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {PROJECT_SLOTS.map((slot) => {
          const complete = slotComplete(day, slot);
          const gameId = slotGame(day, slot);
          const subjectId =
            slot === "math" ? "math" : slot === "hebrew" ? "hebrew" : englishSubjectId;
          const subject = subjects.find((s) => s.id === subjectId);
          const game = subject?.games.find((g) => g.id === gameId);
          const href = complete
            ? undefined
            : projectGameHref(
                englishSubjectId,
                slot,
                gameId,
                project.id,
                project.currentDay,
                project.difficulty
              );

          const slotLocale = projectSlotContentLocale(slot, englishSubjectId);
          const slotLabel = slotLocale
            ? translate(slotLocale, `projects.slot.${slot}`)
            : t(`projects.slot.${slot}`);
          const gameName = slotLocale
            ? getGameTitle(slotLocale, subjectId, gameId)
            : gameTitle(subjectId, gameId);

          const inner = (
            <>
              <span className="text-2xl">{game?.emoji ?? SLOT_EMOJI[slot]}</span>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-500 uppercase">{slotLabel}</p>
                <p className="font-semibold text-gray-800 truncate">{gameName}</p>
              </div>
              <span className="text-sm font-bold shrink-0">
                {complete ? "✅" : "▶"}
              </span>
            </>
          );

          const className = `flex items-center gap-3 p-3 rounded-2xl border-2 transition-colors ${
            complete
              ? "bg-emerald-50 border-emerald-200 opacity-80"
              : "bg-white border-indigo-100 hover:border-indigo-300 hover:bg-indigo-50/50"
          }`;

          return href ? (
            <Link key={slot} href={href} className={className}>
              {inner}
            </Link>
          ) : (
            <div key={slot} className={className}>
              {inner}
            </div>
          );
        })}
      </div>

      {doneCount === 3 && (
        <p className="mt-3 text-center text-sm font-semibold text-emerald-700">
          {t("projects.dayComplete")}
        </p>
      )}
    </section>
  );
}
