"use client";

import Link from "next/link";
import type { SubjectInfo } from "@/lib/types";
import { useLocale } from "@/i18n/LocaleProvider";

interface SubjectCardProps {
  subject: SubjectInfo;
}

export function SubjectCard({ subject }: SubjectCardProps) {
  const { subjectTitle, subjectDescription, gameTitle, t } = useLocale();

  return (
    <Link
      href={subject.href}
      className={`group flex overflow-hidden rounded-2xl border-2 ${subject.borderColor} bg-white/90 shadow-md hover:shadow-xl hover:scale-[1.01] transition-all duration-200`}
    >
      <div
        className={`shrink-0 w-[5.5rem] sm:w-24 flex items-center justify-center ${subject.color}`}
      >
        <span className="text-4xl sm:text-5xl group-hover:animate-pop">{subject.emoji}</span>
      </div>

      <div className="flex-1 min-w-0 p-4 sm:p-5 flex flex-col justify-center">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 truncate">
              {subjectTitle(subject.id)}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">
              {subjectDescription(subject.id)}
            </p>
          </div>
          <span
            className="shrink-0 text-indigo-400 group-hover:text-indigo-600 transition-all text-lg mt-0.5 [dir=rtl]:rotate-180 group-hover:translate-x-0.5 [dir=rtl]:group-hover:-translate-x-0.5"
            aria-hidden
          >
            →
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5 mt-3">
          {subject.games.map((game) => (
            <span
              key={game.id}
              className="inline-flex items-center gap-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full px-2.5 py-1"
              title={gameTitle(subject.id, game.id)}
            >
              <span aria-hidden>{game.emoji}</span>
              <span className="truncate max-w-[8rem] sm:max-w-none">
                {gameTitle(subject.id, game.id)}
              </span>
            </span>
          ))}
        </div>

        <p className="text-xs text-indigo-500 font-semibold mt-2.5">
          {subject.games.length} {t("common.games")} · {t("home.tapToPlay")}
        </p>
      </div>
    </Link>
  );
}
