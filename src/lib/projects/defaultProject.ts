import type { DifficultyLevel } from "@/lib/content/types";
import type { ProjectDay, ProjectDaySlot } from "./types";
import { randomEnglishGame, randomHebrewGame, randomMathGame } from "./games";
import type { EnglishSubjectId } from "./types";

export const DEFAULT_PROJECT_DAYS = 10;
export const DEFAULT_PROJECT_DIFFICULTY: DifficultyLevel = 3;

export const DEFAULT_PROJECT_NAME = {
  en: "10 days before school starts",
  he: "תרגול יומי - הכנה לכיתה ג'",
};

export function defaultProjectName(locale: "en" | "he"): string {
  return DEFAULT_PROJECT_NAME[locale];
}

function randomSlot(
  studentId: string,
  dayNumber: number,
  slot: "math" | "hebrew" | "english",
  englishSubjectId: EnglishSubjectId
): ProjectDaySlot {
  const gameId =
    slot === "math"
      ? randomMathGame(studentId, dayNumber)
      : slot === "hebrew"
        ? randomHebrewGame(studentId, dayNumber)
        : randomEnglishGame(studentId, dayNumber, englishSubjectId);
  return { gameId, random: true };
}

export function buildProjectDays(
  studentId: string,
  totalDays: number,
  englishSubjectId: EnglishSubjectId
): ProjectDay[] {
  return Array.from({ length: totalDays }, (_, i) => {
    const dayNumber = i + 1;
    return {
      dayNumber,
      math: randomSlot(studentId, dayNumber, "math", englishSubjectId),
      hebrew: randomSlot(studentId, dayNumber, "hebrew", englishSubjectId),
      english: randomSlot(studentId, dayNumber, "english", englishSubjectId),
    };
  });
}
