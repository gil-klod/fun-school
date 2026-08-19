import { getGameHref } from "@/lib/gamePaths";
import type { ProjectSlot } from "./types";
import { subjectForSlot } from "./games";
import type { EnglishSubjectId } from "./types";

export function projectGameHref(
  englishSubjectId: EnglishSubjectId,
  slot: ProjectSlot,
  gameId: string,
  projectId: string,
  day: number,
  difficulty = 3
): string {
  const subjectId = subjectForSlot(slot, englishSubjectId);
  const base = getGameHref(subjectId, gameId);
  const params = new URLSearchParams({
    projectId,
    day: String(day),
    slot,
    difficulty: String(difficulty),
  });
  return `${base}?${params.toString()}`;
}
