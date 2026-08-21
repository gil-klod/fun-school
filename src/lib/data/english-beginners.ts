export type { VocabPair } from "./english-beginner-vocab";
export { ENGLISH_BEGINNER_VOCAB as BEGINNER_VOCAB } from "./english-beginner-vocab";

export type { SentenceChallenge } from "./english-beginner-sentences";
export { ENGLISH_BEGINNER_SENTENCES as SENTENCE_CHALLENGES } from "./english-beginner-sentences";
import { ENGLISH_BEGINNER_SENTENCES } from "./english-beginner-sentences";
import type { DifficultyLevel } from "@/lib/content/types";

/** Easy → medium → hard thirds (150 items → ~50 per level). */
export function sentencesForDifficulty(difficulty: DifficultyLevel) {
  const all = ENGLISH_BEGINNER_SENTENCES;
  const size = Math.ceil(all.length / 3);
  if (difficulty === 1) return all.slice(0, size);
  if (difficulty === 2) return all.slice(size, size * 2);
  return all.slice(size * 2);
}

export type { ColorNumberQuestion } from "./english-colors-numbers";
export { ENGLISH_COLORS_NUMBERS as COLORS_NUMBERS } from "./english-colors-numbers";

export function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
