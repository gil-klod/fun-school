"use client";

import Link from "next/link";
import type { GameInfo } from "@/lib/types";
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
      className={`group block rounded-2xl border-2 border-indigo-100 ${color} p-5 shadow-md hover:shadow-lg hover:scale-[1.02] hover:border-indigo-300 transition-all duration-200`}
    >
      <div className="text-4xl mb-2">{game.emoji}</div>
      <h3 className="text-xl font-bold text-gray-800">{gameTitle(subjectId, game.id)}</h3>
      <p className="text-sm text-gray-500 mt-2">{gameDescription(subjectId, game.id)}</p>
    </Link>
  );
}
