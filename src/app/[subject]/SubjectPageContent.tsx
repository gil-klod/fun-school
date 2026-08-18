"use client";

import { BackButton } from "@/components/BackButton";
import { GameCard } from "@/components/GameCard";
import { LocaleOverrideProvider, useLocale } from "@/i18n/LocaleProvider";
import type { SubjectInfo } from "@/lib/types";

function SubjectPageInner({ subject }: { subject: SubjectInfo }) {
  const { subjectTitle, t } = useLocale();

  return (
    <main className="flex-1 px-4 py-8 max-w-3xl mx-auto w-full">
      <BackButton href="/" label={t("common.home")} />

      <header className="text-center mb-8">
        <span className="text-6xl">{subject.emoji}</span>
        <h1 className="text-4xl font-bold text-gray-800 mt-2">{subjectTitle(subject.id)}</h1>
      </header>

      <div className="grid grid-cols-1 gap-4">
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
