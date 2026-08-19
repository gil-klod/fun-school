"use client";

import { useEffect, useState } from "react";
import type { DifficultyLevel } from "@/lib/content/types";
import { useGameContent } from "@/hooks/useGameContent";
import { useGameProgress } from "@/hooks/useGameProgress";

function readGameUrlFlags(): { difficulty: DifficultyLevel; isProjectGame: boolean } {
  if (typeof window === "undefined") {
    return { difficulty: 2, isProjectGame: false };
  }
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("difficulty");
  const isProjectGame = params.has("projectId");
  const difficulty =
    raw === "1" || raw === "2" || raw === "3"
      ? (Number(raw) as DifficultyLevel)
      : isProjectGame
        ? 3
        : 2;
  return { difficulty, isProjectGame };
}

export function useGameSession(subjectId: string, gameId: string) {
  const [urlFlags, setUrlFlags] = useState({ difficulty: 2 as DifficultyLevel, isProjectGame: false });

  useEffect(() => {
    setUrlFlags(readGameUrlFlags());
  }, []);

  const { difficulty: initialDifficulty, isProjectGame } = urlFlags;
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(initialDifficulty);

  useEffect(() => {
    setDifficulty(initialDifficulty);
  }, [initialDifficulty]);

  const progress = useGameProgress({ subjectId, gameId, difficulty, isProjectGame: urlFlags.isProjectGame });
  const { content, loading: contentLoading, error: contentError } = useGameContent(
    subjectId,
    gameId,
    difficulty
  );

  const changeDifficulty = (level: DifficultyLevel) => {
    if (isProjectGame) return;
    if (level === difficulty) return;
    setDifficulty(level);
  };

  return {
    difficulty,
    changeDifficulty,
    lockDifficulty: isProjectGame,
    progress,
    content,
    contentLoading,
    contentError,
    ready: progress.loaded && !!content,
  };
}
