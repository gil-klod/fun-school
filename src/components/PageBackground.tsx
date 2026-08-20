"use client";

import { useEffect, useState } from "react";

const BACKGROUNDS = [
  "bg-school-sky",
  "bg-school-sunset",
  "bg-school-mint",
  "bg-school-lavender",
  "bg-school-peach",
  "bg-school-notebook",
] as const;

type BackgroundId = (typeof BACKGROUNDS)[number];

const STORAGE_KEY = "fun-school-bg";

function pickBackground(): BackgroundId {
  const index = Math.floor(Math.random() * BACKGROUNDS.length);
  return BACKGROUNDS[index];
}

export function PageBackground() {
  const [background, setBackground] = useState<BackgroundId | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY) as BackgroundId | null;
    if (stored && BACKGROUNDS.includes(stored)) {
      setBackground(stored);
      return;
    }
    const chosen = pickBackground();
    sessionStorage.setItem(STORAGE_KEY, chosen);
    setBackground(chosen);
  }, []);

  if (!background) return null;

  return (
    <div
      className={`page-background ${background}`}
      aria-hidden
    />
  );
}
