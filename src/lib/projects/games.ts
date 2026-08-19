import { subjects } from "@/lib/subjects";
import type { EnglishSubjectId } from "./types";

const MATH_GAMES = subjects.find((s) => s.id === "math")!.games.map((g) => g.id);
const HEBREW_GAMES = subjects.find((s) => s.id === "hebrew")!.games.map((g) => g.id);

export function englishGamesFor(subjectId: EnglishSubjectId): string[] {
  const subject = subjects.find((s) => s.id === subjectId);
  return subject?.games.map((g) => g.id) ?? [];
}

export function pickRandomGame(gameIds: string[], seed: number): string {
  if (gameIds.length === 0) return "";
  const idx = Math.abs(seed) % gameIds.length;
  return gameIds[idx]!;
}

/** Stable pseudo-random per student + day + slot. */
export function projectGameSeed(studentId: string, dayNumber: number, slot: string): number {
  let h = 0;
  const s = `${studentId}:${dayNumber}:${slot}`;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return h;
}

export function randomMathGame(studentId: string, dayNumber: number): string {
  return pickRandomGame(MATH_GAMES, projectGameSeed(studentId, dayNumber, "math"));
}

export function randomHebrewGame(studentId: string, dayNumber: number): string {
  return pickRandomGame(HEBREW_GAMES, projectGameSeed(studentId, dayNumber, "hebrew"));
}

export function randomEnglishGame(
  studentId: string,
  dayNumber: number,
  englishSubjectId: EnglishSubjectId
): string {
  return pickRandomGame(
    englishGamesFor(englishSubjectId),
    projectGameSeed(studentId, dayNumber, "english")
  );
}

export function subjectForSlot(
  slot: "math" | "hebrew" | "english",
  englishSubjectId: EnglishSubjectId
): string {
  if (slot === "math") return "math";
  if (slot === "hebrew") return "hebrew";
  return englishSubjectId;
}

export function gameIdsForSubject(subjectId: string): string[] {
  return subjects.find((s) => s.id === subjectId)?.games.map((g) => g.id) ?? [];
}
