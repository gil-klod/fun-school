"use client";

import { GameCard } from "@/components/GameCard";
import { LocaleOverrideProvider, useLocale } from "@/i18n/LocaleProvider";
import type { SubjectInfo } from "@/lib/types";

function SubjectPageInner({ subject }: { subject: SubjectInfo }) {
  const { subjectTitle, t } = useLocale();

  return (
    <main className="flex-1 px-4 py-6 sm:py-8 max-w-5xl mx-auto w-full">
      <header className="flex items-center gap-4 mb-8">
        <span className="text-5xl sm:text-6xl shrink-0">{subject.emoji}</span>
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">{subjectTitle(subject.id)}</h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">
            {subject.games.length} {t("common.games")}
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {subject.games.map((game) => (
          <GameCard key={game.id} game={game} subjectId={subject.id} color={subject.color} />
        ))}
      </div>
    </main>
  );
}

export function SubjectPageContent({ subject }: { subject: SubjectInfo }) {
  if (subject.id === "english-natives") {
    return (
      <LocaleOverrideProvider locale="en">
        <div dir="ltr" lang="en" className="contents">
          <SubjectPageInner subject={subject} />
        </div>
      </LocaleOverrideProvider>
    );
  }

  return <SubjectPageInner subject={subject} />;
}
