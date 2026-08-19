"use client";

import { useLocale } from "@/i18n/LocaleProvider";
import { getGameHref } from "@/lib/gamePaths";
import { useStudent } from "@/components/students";
import { useEffect, useState } from "react";
import Link from "next/link";

interface RecentProgress {
  subjectId: string;
  gameId: string;
  score: number;
  round: number;
}

export function ContinueBanner() {
  const { t, gameTitle } = useLocale();
  const { activeStudent, ready } = useStudent();
  const [recent, setRecent] = useState<RecentProgress | null>(null);

  useEffect(() => {
    if (!ready || !activeStudent?.id) {
      setRecent(null);
      return;
    }

    fetch(`/api/progress?recent=true&studentId=${activeStudent.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.progress) setRecent(data.progress);
        else setRecent(null);
      })
      .catch(() => setRecent(null));
  }, [activeStudent?.id, ready]);

  if (!recent) return null;

  const label = gameTitle(recent.subjectId, recent.gameId);

  return (
    <div className="bg-indigo-500 text-white rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
      <div>
        <p className="font-bold text-lg">{t("home.continueTitle")}</p>
        <p className="text-indigo-100 text-sm">
          {t("home.continueRound", { label, round: recent.round, score: recent.score })}
        </p>
      </div>
      <Link
        href={getGameHref(recent.subjectId, recent.gameId)}
        className="bg-white text-indigo-600 px-6 py-2 rounded-xl font-bold hover:bg-indigo-50 transition-colors whitespace-nowrap"
      >
        {t("common.continue")}
      </Link>
    </div>
  );
}
