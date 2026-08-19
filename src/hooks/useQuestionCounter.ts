"use client";

import { useCallback, useState } from "react";

/** Simple 1..total question counter for endless games. */
export function useQuestionCounter(total: number, startAt = 1) {
  const [current, setCurrent] = useState(startAt);

  const reset = useCallback(() => setCurrent(1), []);

  const advance = useCallback(() => {
    setCurrent((n) => (n >= total ? 1 : n + 1));
  }, [total]);

  return { current, setCurrent, reset, advance };
}
