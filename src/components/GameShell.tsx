"use client";

import { useLocale } from "@/i18n/LocaleProvider";
import { DifficultySelector } from "@/components/DifficultySelector";
import type { DifficultyLevel } from "@/lib/content/types";
import { APP_CONTAINER } from "@/lib/layout";

interface GameShellProps {
  title: string;
  emoji: string;
  children: React.ReactNode;
  contentDir?: "ltr" | "rtl";
  difficulty?: DifficultyLevel;
  onDifficultyChange?: (level: DifficultyLevel) => void;
  difficultyDisabled?: boolean;
  toolbar?: React.ReactNode;
}

export function GameShell({
  title,
  emoji,
  children,
  contentDir,
  difficulty,
  onDifficultyChange,
  difficultyDisabled,
  toolbar,
}: GameShellProps) {
  const { dir } = useLocale();
  const showDifficulty = difficulty !== undefined && onDifficultyChange;

  return (
    <div className="w-full" dir={contentDir ?? dir}>
      <div className="bg-white/90 rounded-2xl border border-indigo-100 shadow-sm px-4 py-3 mb-4">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-3xl sm:text-4xl shrink-0 leading-none">{emoji}</span>
            <h1 className="text-lg sm:text-2xl font-bold text-gray-800 truncate">{title}</h1>
          </div>
          {showDifficulty && (
            <DifficultySelector
              inline
              value={difficulty}
              onChange={onDifficultyChange}
              disabled={difficultyDisabled}
            />
          )}
        </div>
        {toolbar ? <div className="mt-3 pt-3 border-t border-indigo-50">{toolbar}</div> : null}
      </div>
      {children}
    </div>
  );
}

export function GamePage({ children }: { children: React.ReactNode }) {
  return (
    <main className={`flex-1 py-4 sm:py-6 pb-24 sm:pb-6 ${APP_CONTAINER}`}>{children}</main>
  );
}

export function GameOptionsGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4">{children}</div>
  );
}
