"use client";

import { useLocale } from "@/i18n/LocaleProvider";
import type { DifficultyLevel } from "@/lib/content/types";
import { DIFFICULTY_LEVELS } from "@/lib/content/types";

interface DifficultySelectorProps {
  value: DifficultyLevel;
  onChange: (level: DifficultyLevel) => void;
  disabled?: boolean;
}

export function DifficultySelector({ value, onChange, disabled }: DifficultySelectorProps) {
  const { t } = useLocale();

  return (
    <div className="mb-3">
      <p className="text-center text-xs font-semibold text-gray-500 mb-2">
        {t("difficulty.label")}
      </p>
      <div className="flex gap-2 justify-center">
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
