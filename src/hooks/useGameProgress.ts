"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { DifficultyLevel } from "@/lib/content/types";
import { useStudent } from "@/components/students";
import type { ProjectSlot } from "@/lib/projects/types";

function readProjectParams(): {
  projectId: string | null;
  projectDay: number;
  projectSlot: ProjectSlot | null;
} {
  if (typeof window === "undefined") {
    return { projectId: null, projectDay: 0, projectSlot: null };
  }
  const params = new URLSearchParams(window.location.search);
  const slot = params.get("slot");
  return {
    projectId: params.get("projectId"),
    projectDay: Number(params.get("day") ?? "0"),
    projectSlot: slot === "math" || slot === "hebrew" || slot === "english" ? slot : null,
  };
}

export interface ProgressData {
  score: number;
  streak: number;
  round: number;
  correct: number;
  wrong: number;
  state: Record<string, unknown>;
  status?: "in_progress" | "completed";
  difficulty?: DifficultyLevel;
}

interface UseGameProgressOptions {
  subjectId: string;
  gameId: string;
  difficulty: DifficultyLevel;
  isProjectGame?: boolean;
  defaultState?: Record<string, unknown>;
}

const EMPTY_GAME_STATE: Record<string, unknown> = {};

const emptyProgress = (defaultState: Record<string, unknown>): ProgressData => ({
  score: 0,
  streak: 0,
  round: 1,
  correct: 0,
  wrong: 0,
  state: defaultState,
  status: "in_progress",
});

function hasStatUpdate(overrides?: Partial<ProgressData>) {
  return (
    overrides?.status !== undefined ||
    overrides?.correct !== undefined ||
    overrides?.wrong !== undefined ||
    overrides?.score !== undefined ||
    overrides?.streak !== undefined ||
    overrides?.round !== undefined
  );
}

export function useGameProgress({
  subjectId,
  gameId,
  difficulty,
  isProjectGame = false,
  defaultState = EMPTY_GAME_STATE,
}: UseGameProgressOptions) {
  const { activeStudent, ready: studentReady } = useStudent();
  const [projectParams, setProjectParams] = useState(readProjectParams);
  const studentId = activeStudent?.id;
  const { projectId, projectDay, projectSlot } = projectParams;

  useEffect(() => {
    if (isProjectGame) setProjectParams(readProjectParams());
  }, [isProjectGame]);
  const [loaded, setLoaded] = useState(false);
  const [hasSavedProgress, setHasSavedProgress] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [round, setRound] = useState(1);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [gameState, setGameState] = useState<Record<string, unknown>>(defaultState);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef<ProgressData>(emptyProgress(defaultState));

  useEffect(() => {
    latest.current = { score, streak, round, correct, wrong, state: gameState, difficulty };
  }, [score, streak, round, correct, wrong, gameState, difficulty]);

  const resetProgress = useCallback(() => {
    const fresh = emptyProgress(defaultState);
    setScore(fresh.score);
    setStreak(fresh.streak);
    setRound(fresh.round);
    setCorrect(fresh.correct);
    setWrong(fresh.wrong);
    setGameState(fresh.state);
    setHasSavedProgress(false);
    latest.current = fresh;
  }, [defaultState]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!studentReady) return;
      if (!studentId) {
        resetProgress();
        if (!cancelled) setLoaded(true);
        return;
      }

      setLoaded(false);
      try {
        const res = await fetch(
          `/api/progress?subjectId=${subjectId}&gameId=${gameId}&difficulty=${difficulty}&studentId=${studentId}`
        );
        if (res.ok) {
          const { progress } = await res.json();
          if (!cancelled && progress && progress.status === "in_progress") {
            const state = (progress.state ?? {}) as Record<string, unknown>;
            setScore(progress.score ?? 0);
            setStreak(progress.streak ?? 0);
            setRound(progress.round ?? 1);
            setCorrect(progress.correct ?? 0);
            setWrong(progress.wrong ?? 0);
            setGameState(state);
            setHasSavedProgress(true);
            latest.current = {
              score: progress.score ?? 0,
              streak: progress.streak ?? 0,
              round: progress.round ?? 1,
              correct: progress.correct ?? 0,
              wrong: progress.wrong ?? 0,
              state,
              difficulty,
              status: "in_progress",
            };
          } else if (!cancelled) {
            resetProgress();
          }
        }
      } catch (err) {
        console.error("Failed to load progress:", err);
      } finally {
        if (!cancelled) setLoaded(true);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [subjectId, gameId, difficulty, studentId, studentReady, resetProgress]);

  const applyOverrides = useCallback(
    (overrides?: Partial<ProgressData>) => {
      if (!overrides) return;
      latest.current = {
        ...latest.current,
        ...overrides,
        difficulty,
        state: overrides.state ?? latest.current.state,
        status: overrides.status ?? latest.current.status ?? "in_progress",
      };
    },
    [difficulty]
  );

  const persistProgress = useCallback(
    async (overrides?: Partial<ProgressData>, options?: { keepalive?: boolean }) => {
      if (!studentId) return false;

      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
        saveTimer.current = null;
      }

      applyOverrides(overrides);

      const data: ProgressData = {
        ...latest.current,
        difficulty,
        status: latest.current.status ?? "in_progress",
      };

      try {
        const res = await fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ studentId, subjectId, gameId, difficulty, ...data }),
          keepalive: options?.keepalive ?? false,
        });
        if (!res.ok) {
          const message = await res.text();
          console.error("[fun-school] Progress save failed:", res.status, message);
        }
        return res.ok;
      } catch (err) {
        console.error("Failed to save progress:", err);
        return false;
      }
    },
    [studentId, subjectId, gameId, difficulty, applyOverrides]
  );

  const save = useCallback(
    (overrides?: Partial<ProgressData>) => {
      if (!studentId) {
        if (loaded) {
          console.warn("[fun-school] Progress not saved: no active student selected.");
        }
        return;
      }

      applyOverrides(overrides);

      if (hasStatUpdate(overrides)) {
        void persistProgress();
        return;
      }

      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        void persistProgress();
      }, 300);
    },
    [studentId, loaded, applyOverrides, persistProgress]
  );

  useEffect(() => {
    const flushPendingSave = () => {
      if (!studentId || !saveTimer.current) return;
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
      void persistProgress(undefined, { keepalive: true });
    };

    const onHide = () => {
      if (document.visibilityState === "hidden") flushPendingSave();
    };

    window.addEventListener("pagehide", flushPendingSave);
    document.addEventListener("visibilitychange", onHide);

    return () => {
      flushPendingSave();
      window.removeEventListener("pagehide", flushPendingSave);
      document.removeEventListener("visibilitychange", onHide);
    };
  }, [studentId, persistProgress]);

  const notifyProjectComplete = useCallback(async () => {
    if (!projectId || !projectDay || !projectSlot || !studentId) return;
    try {
      await fetch("/api/projects/complete-slot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          projectId,
          day: projectDay,
          slot: projectSlot,
        }),
      });
    } catch (err) {
      console.error("Project complete-slot failed:", err);
    }
  }, [projectId, projectDay, projectSlot, studentId]);

  const markCompleted = useCallback(() => {
    latest.current = {
      score,
      streak,
      round,
      correct,
      wrong,
      state: gameState,
      difficulty,
      status: "completed",
    };
    void persistProgress({ status: "completed" });
    if (projectId) void notifyProjectComplete();
  }, [
    score,
    streak,
    round,
    correct,
    wrong,
    gameState,
    difficulty,
    persistProgress,
    projectId,
    notifyProjectComplete,
  ]);

  return {
    loaded: loaded && studentReady && !!studentId,
    hasSavedProgress,
    canSave: !!studentId,
    difficulty,
    score,
    setScore,
    streak,
    setStreak,
    round,
    setRound,
    correct,
    setCorrect,
    wrong,
    setWrong,
    gameState,
    setGameState,
    resetProgress,
    save,
    markCompleted,
  };
}
