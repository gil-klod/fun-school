"use client";

import type { MascotAnimation } from "./types";

interface MascotCharacterProps {
  animation: MascotAnimation;
}

/** Friendly school mascot — CSS-animated (no external assets). */
export function MascotCharacter({ animation }: MascotCharacterProps) {
  return (
    <div
      className={`mascot-character mascot-${animation} relative w-20 h-20 sm:w-24 sm:h-24 shrink-0`}
      aria-hidden
    >
      <div className="absolute inset-0 rounded-full bg-amber-300 border-4 border-amber-500 shadow-md" />
      <div className="absolute top-[22%] left-[22%] w-[18%] h-[18%] rounded-full bg-gray-800" />
      <div className="absolute top-[22%] right-[22%] w-[18%] h-[18%] rounded-full bg-gray-800" />
      <div className="absolute top-[48%] left-1/2 -translate-x-1/2 w-[12%] h-[8%] rounded-full bg-orange-400" />
      <div className="absolute -bottom-1 left-[8%] mascot-hand origin-top-right w-[28%] h-[32%] rounded-full bg-amber-400 border-2 border-amber-600" />
      <div className="absolute -bottom-1 right-[8%] mascot-hand origin-top-left w-[28%] h-[32%] rounded-full bg-amber-400 border-2 border-amber-600" />
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-xl sm:text-2xl">🎒</div>
    </div>
  );
}
