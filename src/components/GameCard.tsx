import Link from "next/link";
import type { GameInfo } from "@/lib/types";

interface GameCardProps {
  game: GameInfo;
  color?: string;
}

export function GameCard({ game, color = "bg-white" }: GameCardProps) {
  return (
    <Link
      href={game.href}
      className={`group block rounded-2xl border-2 border-indigo-100 ${color} p-5 shadow-md hover:shadow-lg hover:scale-[1.02] hover:border-indigo-300 transition-all duration-200`}
    >
      <div className="text-4xl mb-2">{game.emoji}</div>
      <h3 className="text-xl font-bold text-gray-800">{game.title}</h3>
      {game.titleHe && (
        <p className="text-base text-gray-600" dir="rtl">
          {game.titleHe}
        </p>
      )}
      <p className="text-sm text-gray-500 mt-2">{game.description}</p>
    </Link>
  );
}
