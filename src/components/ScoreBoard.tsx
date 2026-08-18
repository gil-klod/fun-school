"use client";

import { useLocale } from "@/i18n/LocaleProvider";

interface ScoreBoardProps {
  score: number;
  streak?: number;
  total?: number;
  label?: string;
}

export function ScoreBoard({ score, streak, total, label }: ScoreBoardProps) {
  const { t } = useLocale();
  const scoreLabel = label ?? t("common.score");

  return (
    <div className="flex gap-4 flex-wrap justify-center mb-6">
      <div className="bg-white/80 backdrop-blur rounded-2xl px-5 py-3 shadow-md border-2 border-indigo-100">
        <span className="text-sm text-indigo-500 font-medium">{scoreLabel}</span>
        <p className="text-2xl font-bold text-indigo-700">{score}</p>
      </div>
      {streak !== undefined && streak > 0 && (
        <div className="bg-white/80 backdrop-blur rounded-2xl px-5 py-3 shadow-md border-2 border-orange-100">
          <span className="text-sm text-orange-500 font-medium">{t("common.streak")}</span>
          <p className="text-2xl font-bold text-orange-600">{streak}</p>
        </div>
      )}
      {total !== undefined && (
        <div className="bg-white/80 backdrop-blur rounded-2xl px-5 py-3 shadow-md border-2 border-green-100">
          <span className="text-sm text-green-500 font-medium">{t("common.round")}</span>
          <p className="text-2xl font-bold text-green-600">{total}</p>
        </div>
      )}
    </div>
  );
}
