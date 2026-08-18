"use client";

import { useEffect, useState } from "react";
import type { DifficultyLevel, GameContentBundle } from "@/lib/content/types";

export function useGameContent(
  subjectId: string,
  gameId: string,
  difficulty: DifficultyLevel
) {
  const [content, setContent] = useState<GameContentBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(
      `/api/content?subjectId=${encodeURIComponent(subjectId)}&gameId=${encodeURIComponent(gameId)}&difficulty=${difficulty}`
    )
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? "Failed to load game content");
        }
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setContent(data.content);
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setContent(null);
          setError(err.message);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [subjectId, gameId, difficulty]);

  return { content, loading, error };
}
