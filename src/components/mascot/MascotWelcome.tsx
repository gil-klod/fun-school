"use client";

import { useEffect } from "react";
import { useMascot } from "./MascotProvider";

/** Shows the mascot welcome once per browser (first homepage visit). */
export function MascotWelcome() {
  const { welcome } = useMascot();

  useEffect(() => {
    const timer = setTimeout(welcome, 800);
    return () => clearTimeout(timer);
  }, [welcome]);

  return null;
}
