"use client";

import { useLocale } from "@/i18n/LocaleProvider";
import type { DifficultyLevel } from "@/lib/content/types";
import { DIFFICULTY_LEVELS } from "@/lib/content/types";

interface DifficultySelectorProps {
  value: DifficultyLevel;
  onChange: (level: DifficultyLevel) => void;
  disabled?: boolean;
  /** Compact single-row layout for game header */
  inline?: boolean;
}

export function DifficultySelector({
  value,
  onChange,
  disabled,
  inline = false,
}: DifficultySelectorProps) {
  const { t } = useLocale();

  if (inline) {
    return (
      <div className="flex flex-wrap items-center gap-2 shrink-0">
        <span className="text-xs font-semibold text-gray-500 whitespace-nowrap">
          {t("difficulty.label")}:
        </span>
        <div className="flex gap-1.5">
          {DIFFICULTY_LEVELS.map((level) => (
            <button
              key={level}
              type="button"
              disabled={disabled}
              onClick={() => onChange(level)}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                value === level
                  ? "bg-indigo-500 text-white shadow-sm"
                  : "bg-white border border-indigo-200 text-indigo-700 hover:border-indigo-400"
              } disabled:opacity-50`}
            >
              {t(`difficulty.${level}`)}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-3">
      <p className="text-xs font-semibold text-gray-500 mb-2">{t("difficulty.label")}</p>
      <div className="flex flex-wrap gap-2">
        {DIFFICULTY_LEVELS.map((level) => (
          <button
            key={level}
            type="button"
            disabled={disabled}
            onClick={() => onChange(level)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              value === level
                ? "bg-indigo-500 text-white shadow-md"
                : "bg-white border-2 border-indigo-200 text-indigo-700 hover:border-indigo-400"
            } disabled:opacity-50`}
          >
            {t(`difficulty.${level}`)}
          </button>
        ))}
      </div>
    </div>
  );
}
