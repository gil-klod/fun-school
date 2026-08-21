export { GRAMMAR_QUESTIONS } from "./english-grammar-questions";
export { VOCAB_QUESTIONS } from "./english-vocab-advanced";

export type { EnglishStory } from "./english-stories";
export { ENGLISH_STORIES } from "./english-stories";

export function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
