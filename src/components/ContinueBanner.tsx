"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getGameLabel } from "@/lib/games";

interface RecentProgress {
  subjectId: string;
  gameId: string;
  score: number;
  round: number;
  lastPlayedAt: string;
}

const SUBJECT_BASE: Record<string, string> = {
  math: "/math",
  hebrew: "/hebrew",
  "english-beginners": "/english-beginners",
  "english-natives": "/english-natives",
};

const GAME_PATHS: Record<string, Record<string, string>> = {
  math: { multiplication: "/multiplication", shuk: "/shuk", mystery: "/mystery" },
  hebrew: { scramble: "/scramble", "fix-sentence": "/fix-sentence", comprehension: "/comprehension" },
  "english-beginners": { vocabulary: "/vocabulary", sentences: "/sentences", "colors-numbers": "/colors-numbers" },
  "english-natives": { grammar: "/grammar", vocabulary: "/vocabulary", comprehension: "/comprehension" },
};

function getGameHref(subjectId: string, gameId: string): string {
  const base = SUBJECT_BASE[subjectId];
  if (!base) return "/";
  const path = GAME_PATHS[subjectId]?.[gameId] ?? "";
  return base + path;
}

export function ContinueBanner() {
  const [recent, setRecent] = useState<RecentProgress | null>(null);

  useEffect(() => {
    fetch("/api/progress?recent=true")
      .then((r) => r.json())
      .then((data) => {
        if (data.progress) setRecent(data.progress);
      })
      .catch(() => {});
  }, []);

  if (!recent) return null;

  const label = getGameLabel(recent.subjectId, recent.gameId);
  const gameHref = getGameHref(recent.subjectId, recent.gameId);

  return (
    <div className="bg-indigo-500 text-white rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
      <div>
        <p className="font-bold text-lg">Continue where you left off? 🎮</p>
        <p className="text-indigo-100 text-sm">
          {label} — Round {recent.round}, Score {recent.score}
        </p>
      </div>
      <Link
        href={gameHref}
        className="bg-white text-indigo-600 px-6 py-2 rounded-xl font-bold hover:bg-indigo-50 transition-colors whitespace-nowrap"
      >
        Continue →
      </Link>
    </div>
  );
}
