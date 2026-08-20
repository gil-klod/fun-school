"use client";

import Link from "next/link";
import { Feedback } from "@/components/Feedback";
import { useLocale } from "@/i18n/LocaleProvider";

interface SessionCompleteProps {
  score: number;
  message?: string;
  playAgainLabel?: string;
  onPlayAgain: () => void;
  homeHref?: string;
}

export function SessionComplete({
  score,
  message,
  playAgainLabel,
  onPlayAgain,
  homeHref = "/",
}: SessionCompleteProps) {
  const { t } = useLocale();

  return (
    <div className="text-center py-4 space-y-4 animate-bounce-in">
      <Feedback
        type="correct"
        message={message ?? t("games.allDone", { score })}
      />
      <div className="flex flex-col sm:flex-row gap-3 justify-center items-stretch sm:items-center max-w-md mx-auto">
        <Link href={homeHref} className="game-btn game-btn-secondary flex-1">
          {t("projects.backToHome")}
        </Link>
        <button type="button" onClick={onPlayAgain} className="game-btn game-btn-primary flex-1">
          {playAgainLabel ?? t("common.playAgain")}
        </button>
      </div>
    </div>
  );
}
