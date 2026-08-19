"use client";

import Link from "next/link";
import type { GameInfo } from "@/lib/types";
import { DirectionalArrow } from "@/components/DirectionalArrow";
import { useLocale } from "@/i18n/LocaleProvider";

interface GameCardProps {
  game: GameInfo;
  subjectId: string;
  color?: string;
}

export function GameCard({ game, subjectId, color = "bg-white" }: GameCardProps) {
  const { gameTitle, gameDescription } = useLocale();

  return (
    <Link
      href={game.href}
      className={`group flex overflow-hidden rounded-2xl border-2 border-indigo-100 bg-white/90 shadow-md hover:shadow-lg hover:scale-[1.01] hover:border-indigo-300 transition-all duration-200`}
    >
      <div className={`shrink-0 w-20 sm:w-24 flex items-center justify-center ${color}`}>
        <span className="text-4xl group-hover:animate-pop">{game.emoji}</span>
      </div>
      <div className="flex-1 min-w-0 p-4 flex flex-col justify-center">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-base sm:text-lg font-bold text-gray-800 truncate">
              {gameTitle(subjectId, game.id)}
            </h3>
            <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">
              {gameDescription(subjectId, game.id)}
            </p>
          </div>
          <DirectionalArrow className="shrink-0 text-indigo-400 group-hover:text-indigo-600 text-lg mt-0.5" />
        </div>
      </div>
    </Link>
  );
}
