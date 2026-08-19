"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useStudent } from "@/components/students";
import type { ProjectSlot } from "@/lib/projects/types";

function readProjectGameParams(): {
  projectId: string | null;
  day: number;
  slot: ProjectSlot | null;
} {
  if (typeof window === "undefined") {
    return { projectId: null, day: 0, slot: null };
  }
  const params = new URLSearchParams(window.location.search);
  const slot = params.get("slot");
  return {
    projectId: params.get("projectId"),
    day: Number(params.get("day") ?? "0"),
    slot: slot === "math" || slot === "hebrew" || slot === "english" ? slot : null,
  };
}

export function useProjectGame() {
  const { activeStudent } = useStudent();
  const [params, setParams] = useState(readProjectGameParams);

  useEffect(() => {
    setParams(readProjectGameParams());
  }, []);

  const { projectId, day, slot } = params;
  const isProjectGame = Boolean(projectId && day > 0 && slot);

  const notifyComplete = useCallback(async () => {
    if (!isProjectGame || !activeStudent?.id || !projectId || !slot) return;
    try {
      await fetch("/api/projects/complete-slot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: activeStudent.id,
          projectId,
          day,
          slot,
        }),
      });
    } catch (err) {
      console.error("Project complete-slot failed:", err);
    }
  }, [isProjectGame, activeStudent?.id, projectId, day, slot]);

  const finishProjectGame = useCallback(
    async (markCompleted: () => void) => {
      markCompleted();
      await notifyComplete();
    },
    [notifyComplete]
  );

  const handleSessionNext = useCallback(
    (
      questionNum: number,
      sessionSize: number,
      markCompleted: () => void,
      onContinue: () => void
    ) => {
      if (isProjectGame && questionNum >= sessionSize) {
        void finishProjectGame(markCompleted);
        return true;
      }
      onContinue();
      return false;
    },
    [isProjectGame, finishProjectGame]
  );

  const handleRoundNext = useCallback(
    (
      round: number,
      sessionSize: number,
      markCompleted: () => void,
      onContinue: () => void
    ) => {
      if (isProjectGame && round >= sessionSize) {
        void finishProjectGame(markCompleted);
        return true;
      }
      onContinue();
      return false;
    },
    [isProjectGame, finishProjectGame]
  );

  const handleIndexNext = useCallback(
    (
      nextIndex: number,
      total: number,
      markCompleted: () => void,
      onContinue: () => void
    ) => {
      if (isProjectGame && nextIndex >= total) {
        void finishProjectGame(markCompleted);
        return true;
      }
      onContinue();
      return false;
    },
    [isProjectGame, finishProjectGame]
  );

  return useMemo(
    () => ({
      isProjectGame,
      projectId,
      day,
      slot,
      lockDifficulty: isProjectGame,
      notifyComplete,
      finishProjectGame,
      handleSessionNext,
      handleRoundNext,
      handleIndexNext,
    }),
    [
      isProjectGame,
      projectId,
      day,
      slot,
      notifyComplete,
      finishProjectGame,
      handleSessionNext,
      handleRoundNext,
      handleIndexNext,
    ]
  );
}
