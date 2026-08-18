"use client";

import { useLocale } from "@/i18n/LocaleProvider";

interface GameProgressBarProps {
  score: number;
  streak?: number;
  round?: number;
  correct: number;
  wrong: number;
}

export function GameProgressBar({ score, streak, round, correct, wrong }: GameProgressBarProps) {
  const { t } = useLocale();
  const total = correct + wrong;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : null;

  return (
    <div className="mb-6 space-y-3">
      <div className="flex gap-3 flex-wrap justify-center">
        <div className="bg-white/80 backdrop-blur rounded-2xl px-5 py-3 shadow-md border-2 border-indigo-100 min-w-[100px] text-center">
          <span className="text-sm text-indigo-500 font-medium">{t("common.score")}</span>
          <p className="text-2xl font-bold text-indigo-700">{score}</p>
        </div>
        {streak !== undefined && streak > 0 && (
          <div className="bg-white/80 backdrop-blur rounded-2xl px-5 py-3 shadow-md border-2 border-orange-100 min-w-[100px] text-center">
            <span className="text-sm text-orange-500 font-medium">{t("common.streak")}</span>
            <p className="text-2xl font-bold text-orange-600">{streak}</p>
          </div>
        )}
        {round !== undefined && (
          <div className="bg-white/80 backdrop-blur rounded-2xl px-5 py-3 shadow-md border-2 border-green-100 min-w-[100px] text-center">
            <span className="text-sm text-green-500 font-medium">{t("common.round")}</span>
            <p className="text-2xl font-bold text-green-600">{round}</p>
          </div>
        )}
        <div className="bg-white/80 backdrop-blur rounded-2xl px-5 py-3 shadow-md border-2 border-emerald-100 min-w-[100px] text-center">
          <span className="text-sm text-emerald-600 font-medium">{t("progress.correct")}</span>
          <p className="text-2xl font-bold text-emerald-700">{correct}</p>
        </div>
        <div className="bg-white/80 backdrop-blur rounded-2xl px-5 py-3 shadow-md border-2 border-red-100 min-w-[100px] text-center">
          <span className="text-sm text-red-500 font-medium">{t("progress.wrong")}</span>
          <p className="text-2xl font-bold text-red-600">{wrong}</p>
        </div>
      </div>
      {accuracy !== null && (
        <div className="bg-white/60 rounded-xl px-4 py-2 border border-indigo-100">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">{t("progress.accuracy")}</span>
            <span className="font-bold text-indigo-700">{accuracy}%</span>
          </div>
          <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-indigo-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${accuracy}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
