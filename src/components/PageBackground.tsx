"use client";

import { useEffect, useState } from "react";
import {
  getBackgroundById,
  pickRandomBackgroundId,
  PAGE_BACKGROUND_IDS,
  type PageBackgroundId,
} from "@/lib/backgrounds";

const STORAGE_KEY = "fun-school-bg";

export function PageBackground() {
  const [backgroundId, setBackgroundId] = useState<PageBackgroundId | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY) as PageBackgroundId | null;
    if (stored && PAGE_BACKGROUND_IDS.includes(stored)) {
      setBackgroundId(stored);
      return;
    }
    const chosen = pickRandomBackgroundId();
    sessionStorage.setItem(STORAGE_KEY, chosen);
    setBackgroundId(chosen);
  }, []);

  if (!backgroundId) return null;

  const background = getBackgroundById(backgroundId);

  return (
    <div className="page-background" aria-hidden>
      <div
        className="page-background-image"
        style={{ backgroundImage: `url(${background.src})` }}
      />
      <div className="page-background-overlay" />
    </div>
  );
}
