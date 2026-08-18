"use client";

import { useState } from "react";
import type { DifficultyLevel } from "@/lib/content/types";
import { useGameContent } from "@/hooks/useGameContent";
import { useGameProgress } from "@/hooks/useGameProgress";

export function useGameSession(subjectId: string, gameId: string) {
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(2);
  const progress = useGameProgress({ subjectId, gameId, difficulty });
  const { content, loading: contentLoading, error: contentError } = useGameContent(
    subjectId,
    gameId,
    difficulty
  );

  const changeDifficulty = (level: DifficultyLevel) => {
    if (level === difficulty) return;
    setDifficulty(level);
  };

  return {
    difficulty,
    changeDifficulty,
    progress,
    content,
    contentLoading,
    contentError,
    ready: progress.loaded && !!content,
  };
}
