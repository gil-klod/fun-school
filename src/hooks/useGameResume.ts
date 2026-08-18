"use client";

import { useEffect, useRef } from "react";

/**
 * Restore mid-question state, or advance to next question if the last one was already answered.
 */
export function useGameResume(
  loaded: boolean,
  hasSavedProgress: boolean,
  gameState: Record<string, unknown>,
  onRestore: (state: Record<string, unknown>) => void,
  onAdvance: () => void
) {
  const doneRef = useRef(false);
  const onRestoreRef = useRef(onRestore);
  const onAdvanceRef = useRef(onAdvance);

  useEffect(() => {
    onRestoreRef.current = onRestore;
    onAdvanceRef.current = onAdvance;
  });

  useEffect(() => {
    if (!loaded || doneRef.current || !hasSavedProgress) return;
    doneRef.current = true;

    queueMicrotask(() => {
      if (gameState.answered === true) {
        onAdvanceRef.current();
      } else if (Object.keys(gameState).length > 0) {
        onRestoreRef.current(gameState);
      }
    });
  }, [loaded, hasSavedProgress, gameState]);
}
