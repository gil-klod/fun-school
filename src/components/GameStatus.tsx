"use client";

import { useLocale } from "@/i18n/LocaleProvider";

interface GameStatusProps {
  /** Current question number (1-based) */
  current: number;
  /** Total questions in this game/session — shows "3 of 10" */
  total?: number;
  correct: number;
  wrong: number;
  score?: number;
}

export function GameStatus({ current, total, correct, wrong, score }: GameStatusProps) {
  const { t } = useLocale();
  const pct = total ? Math.min(100, (current / total) * 100) : 0;

  return (
    <div className="mb-3">
      <div className="flex items-center justify-between gap-2 text-sm font-semibold">
        <span className="text-indigo-700">
          {total
            ? t("progress.questionOf", { current, total })
            : t("progress.questionN", { current })}
        </span>
        <span className="text-xs font-medium text-gray-500 shrink-0">
          ✓ {correct} · ✗ {wrong}
          {score !== undefined && ` · ${t("progress.points", { score })}`}
        </span>
      </div>
      {total !== undefined && (
        <div
          className="mt-1.5 h-1.5 rounded-full bg-indigo-100 overflow-hidden"
          role="progressbar"
          aria-valuenow={current}
          aria-valuemin={1}
          aria-valuemax={total}
        >
          <div
            className="h-full rounded-full bg-indigo-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}
