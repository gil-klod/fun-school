"use client";

import { useEffect, useRef } from "react";

/** Restore game UI state from saved progress (async to satisfy React lint rules). */
export function useRestoreGameState(
  loaded: boolean,
  resumed: boolean,
  gameState: Record<string, unknown>,
  restore: (state: Record<string, unknown>) => void
) {
  const restoredRef = useRef(false);
  const restoreRef = useRef(restore);

  useEffect(() => {
    restoreRef.current = restore;
  });

  useEffect(() => {
    if (!loaded || restoredRef.current) return;
    restoredRef.current = true;
    if (resumed && Object.keys(gameState).length > 0) {
      queueMicrotask(() => restoreRef.current(gameState));
    }
  }, [loaded, resumed, gameState]);
}
