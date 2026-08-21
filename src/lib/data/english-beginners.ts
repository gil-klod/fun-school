export type { VocabPair } from "./english-beginner-vocab";
export { ENGLISH_BEGINNER_VOCAB as BEGINNER_VOCAB } from "./english-beginner-vocab";

export type { SentenceChallenge } from "./english-beginner-sentences";
export { ENGLISH_BEGINNER_SENTENCES as SENTENCE_CHALLENGES } from "./english-beginner-sentences";

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
