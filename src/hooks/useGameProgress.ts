"use client";

import { useState, useEffect, useRef, useCallback, type SetStateAction } from "react";
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

function resolveStateAction<T>(value: SetStateAction<T>, prev: T): T {
  return typeof value === "function" ? (value as (current: T) => T)(prev) : value;
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
  const [score, setScoreState] = useState(0);
  const [streak, setStreakState] = useState(0);
  const [round, setRoundState] = useState(1);
  const [correct, setCorrectState] = useState(0);
  const [wrong, setWrongState] = useState(0);
  const [gameState, setGameStateState] = useState<Record<string, unknown>>(defaultState);
  const latest = useRef<ProgressData>(emptyProgress(defaultState));
  /** Only write to DB after real gameplay — prevents reopening a finished game from wiping stats. */
  const sessionDirty = useRef(false);

  const applyLoadedProgress = useCallback(
    (
      progress: {
        score?: number;
        streak?: number;
        round?: number;
        correct?: number;
        wrong?: number;
        state?: Record<string, unknown>;
        status?: "in_progress" | "completed";
      },
      resumeInProgress: boolean
    ) => {
      const state = (progress.state ?? {}) as Record<string, unknown>;
      setScoreState(progress.score ?? 0);
      setStreakState(progress.streak ?? 0);
      setRoundState(progress.round ?? 1);
      setCorrectState(progress.correct ?? 0);
      setWrongState(progress.wrong ?? 0);
      setGameStateState(state);
      latest.current = {
        score: progress.score ?? 0,
        streak: progress.streak ?? 0,
        round: progress.round ?? 1,
        correct: progress.correct ?? 0,
        wrong: progress.wrong ?? 0,
        state,
        difficulty,
        status: progress.status ?? "in_progress",
      };
      setHasSavedProgress(resumeInProgress);
      sessionDirty.current = resumeInProgress;
    },
    [difficulty]
  );

  const setScore = useCallback((value: SetStateAction<number>) => {
    setScoreState((prev) => {
      const next = resolveStateAction(value, prev);
      latest.current = { ...latest.current, score: next };
      return next;
    });
  }, []);

  const setStreak = useCallback((value: SetStateAction<number>) => {
    setStreakState((prev) => {
      const next = resolveStateAction(value, prev);
      latest.current = { ...latest.current, streak: next };
      return next;
    });
  }, []);

  const setRound = useCallback((value: SetStateAction<number>) => {
    setRoundState((prev) => {
      const next = resolveStateAction(value, prev);
      latest.current = { ...latest.current, round: next };
      return next;
    });
  }, []);

  const setCorrect = useCallback((value: SetStateAction<number>) => {
    setCorrectState((prev) => {
      const next = resolveStateAction(value, prev);
      latest.current = { ...latest.current, correct: next };
      return next;
    });
  }, []);

  const setWrong = useCallback((value: SetStateAction<number>) => {
    setWrongState((prev) => {
      const next = resolveStateAction(value, prev);
      latest.current = { ...latest.current, wrong: next };
      return next;
    });
  }, []);

  const setGameState = useCallback((value: SetStateAction<Record<string, unknown>>) => {
    setGameStateState((prev) => {
      const next = resolveStateAction(value, prev);
      latest.current = { ...latest.current, state: next };
      return next;
    });
  }, []);

  const resetProgress = useCallback(() => {
    const fresh = emptyProgress(defaultState);
    setScoreState(fresh.score);
    setStreakState(fresh.streak);
    setRoundState(fresh.round);
    setCorrectState(fresh.correct);
    setWrongState(fresh.wrong);
    setGameStateState(fresh.state);
    setHasSavedProgress(false);
    latest.current = fresh;
    sessionDirty.current = false;
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
          `/api/progress?subjectId=${subjectId}&gameId=${gameId}&difficulty=${difficulty}&studentId=${studentId}`,
          { credentials: "same-origin" }
        );
        if (res.ok) {
          const { progress } = await res.json();
          if (!cancelled && progress?.status === "in_progress") {
            applyLoadedProgress(progress, true);
          } else if (!cancelled && progress?.status === "completed") {
            // Keep saved stats in DB — do not zero on remount/unmount.
            applyLoadedProgress(progress, false);
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
  }, [subjectId, gameId, difficulty, studentId, studentReady, resetProgress, applyLoadedProgress]);

  const persistChain = useRef(Promise.resolve(true));

  const persistProgress = useCallback(async () => {
    if (!studentId) return false;

    const run = async (): Promise<boolean> => {
      const data: ProgressData = {
        ...latest.current,
        difficulty,
        status: latest.current.status ?? "in_progress",
      };

      try {
        const res = await fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          keepalive: true,
          body: JSON.stringify({ studentId, subjectId, gameId, difficulty, ...data }),
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
    };

    const task = persistChain.current.then(run, run);
    persistChain.current = task.catch(() => false);
    return task;
  }, [studentId, subjectId, gameId, difficulty]);

  const save = useCallback(
    (overrides?: Partial<ProgressData>) => {
      if (!studentId) {
        if (loaded) {
          console.warn("[fun-school] Progress not saved: no active student selected.");
        }
        return Promise.resolve(false);
      }

      if (overrides) {
        latest.current = {
          ...latest.current,
          ...overrides,
          difficulty,
          state: overrides.state ?? latest.current.state,
          status: overrides.status ?? latest.current.status ?? "in_progress",
        };
      }

      sessionDirty.current = true;
      return persistProgress();
    },
    [studentId, loaded, persistProgress, difficulty]
  );

  useEffect(() => {
    const flushPendingSave = () => {
      if (!studentId || !sessionDirty.current) return;
      void persistProgress();
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
        credentials: "same-origin",
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

  const recordAnswer = useCallback((wasCorrect: boolean) => {
    const prev = latest.current;
    const nextStreak = wasCorrect ? prev.streak + 1 : 0;
    const points = wasCorrect ? 10 + prev.streak : 0;
    const next = {
      score: wasCorrect ? prev.score + points : prev.score,
      streak: nextStreak,
      correct: prev.correct + (wasCorrect ? 1 : 0),
      wrong: prev.wrong + (wasCorrect ? 0 : 1),
    };

    latest.current = { ...prev, ...next, status: "in_progress" };
    setScoreState(next.score);
    setStreakState(next.streak);
    setCorrectState(next.correct);
    setWrongState(next.wrong);

    return next;
  }, []);

  const recordAnswerAndSave = useCallback(
    (wasCorrect: boolean, state?: Record<string, unknown>) => {
      recordAnswer(wasCorrect);
      if (state) {
        latest.current = { ...latest.current, state };
      }
      sessionDirty.current = true;
      return persistProgress();
    },
    [recordAnswer, persistProgress]
  );

  const markCompleted = useCallback(() => {
    latest.current = {
      ...latest.current,
      status: "completed",
    };
    sessionDirty.current = true;
    void persistProgress();
    if (projectId) void notifyProjectComplete();
  }, [persistProgress, projectId, notifyProjectComplete]);

  return {
    loaded: loaded && studentReady && !!studentId,
    hasSavedProgress,
    canSave: !!studentId,
    activeStudentName: activeStudent?.name ?? null,
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
    recordAnswer,
    recordAnswerAndSave,
    save,
    markCompleted,
  };
}
