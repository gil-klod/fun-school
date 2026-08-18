"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export interface ProgressData {
  score: number;
  streak: number;
  round: number;
  correct: number;
  wrong: number;
  state: Record<string, unknown>;
  status?: "in_progress" | "completed";
}

interface UseGameProgressOptions {
  subjectId: string;
  gameId: string;
  defaultState?: Record<string, unknown>;
}

export function useGameProgress({ subjectId, gameId, defaultState = {} }: UseGameProgressOptions) {
  const [loaded, setLoaded] = useState(false);
  const [resumed, setResumed] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [round, setRound] = useState(1);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [gameState, setGameState] = useState<Record<string, unknown>>(defaultState);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef<ProgressData>({ score: 0, streak: 0, round: 1, correct: 0, wrong: 0, state: defaultState });

  useEffect(() => {
    latest.current = { score, streak, round, correct, wrong, state: gameState };
  }, [score, streak, round, correct, wrong, gameState]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(
          `/api/progress?subjectId=${subjectId}&gameId=${gameId}`
        );
        if (res.ok) {
          const { progress } = await res.json();
          if (progress && progress.status === "in_progress") {
            setScore(progress.score ?? 0);
            setStreak(progress.streak ?? 0);
            setRound(progress.round ?? 1);
            setCorrect(progress.correct ?? 0);
            setWrong(progress.wrong ?? 0);
            setGameState(progress.state ?? defaultState);
            setResumed(true);
          }
        }
      } catch (err) {
        console.error("Failed to load progress:", err);
      } finally {
        setLoaded(true);
      }
    }
    load();
  }, [subjectId, gameId, defaultState]);

  const save = useCallback(
    (overrides?: Partial<ProgressData>) => {
      if (!loaded) return;

      const data: ProgressData = {
        ...latest.current,
        ...overrides,
        status: overrides?.status ?? "in_progress",
      };

      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        try {
          await fetch("/api/progress", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ subjectId, gameId, ...data }),
          });
        } catch (err) {
          console.error("Failed to save progress:", err);
        }
      }, 800);
    },
    [loaded, subjectId, gameId]
  );

  const recordCorrect = useCallback(
    (points: number, newState?: Record<string, unknown>) => {
      setScore((s) => s + points);
      setStreak((s) => s + 1);
      setCorrect((c) => c + 1);
      if (newState) setGameState(newState);
      save({
        score: latest.current.score + points,
        streak: latest.current.streak + 1,
        correct: latest.current.correct + 1,
        state: newState ?? latest.current.state,
      });
    },
    [save]
  );

  const recordWrong = useCallback(
    (newState?: Record<string, unknown>) => {
      setStreak(0);
      setWrong((w) => w + 1);
      if (newState) setGameState(newState);
      save({
        streak: 0,
        wrong: latest.current.wrong + 1,
        state: newState ?? latest.current.state,
      });
    },
    [save]
  );

  const updateState = useCallback(
    (newState: Record<string, unknown>, extra?: Partial<ProgressData>) => {
      setGameState(newState);
      save({ state: newState, ...extra });
    },
    [save]
  );

  const markCompleted = useCallback(() => {
    save({ status: "completed" });
  }, [save]);

  const dismissResume = useCallback(() => setResumed(false), []);

  return {
    loaded,
    resumed,
    dismissResume,
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
    save,
    recordCorrect,
    recordWrong,
    updateState,
    markCompleted,
  };
}
