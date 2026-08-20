export type { VocabPair } from "./english-beginner-vocab";
export { ENGLISH_BEGINNER_VOCAB as BEGINNER_VOCAB } from "./english-beginner-vocab";

export type { SentenceChallenge } from "./english-beginner-sentences";
export { ENGLISH_BEGINNER_SENTENCES as SENTENCE_CHALLENGES } from "./english-beginner-sentences";

export interface ColorNumberQuestion {
  type: "color" | "number";
  prompt: string;
  promptHe: string;
  answer: string;
  options: string[];
  emoji: string;
}

export const COLORS_NUMBERS: ColorNumberQuestion[] = [
  { type: "color", prompt: "What color is this?", promptHe: "מה הצבע?", answer: "Red", options: ["Red", "Blue", "Green", "Yellow"], emoji: "🔴" },
  { type: "color", prompt: "What color is this?", promptHe: "מה הצבע?", answer: "Blue", options: ["Red", "Blue", "Green", "Yellow"], emoji: "🔵" },
  { type: "color", prompt: "What color is this?", promptHe: "מה הצבע?", answer: "Green", options: ["Red", "Blue", "Green", "Yellow"], emoji: "🟢" },
  { type: "color", prompt: "What color is this?", promptHe: "מה הצבע?", answer: "Yellow", options: ["Red", "Blue", "Green", "Yellow"], emoji: "🟡" },
  { type: "number", prompt: "How many?", promptHe: "כמה?", answer: "Three", options: ["One", "Two", "Three", "Four"], emoji: "3️⃣" },
  { type: "number", prompt: "How many?", promptHe: "כמה?", answer: "Five", options: ["Three", "Four", "Five", "Six"], emoji: "5️⃣" },
  { type: "number", prompt: "How many?", promptHe: "כמה?", answer: "Seven", options: ["Five", "Six", "Seven", "Eight"], emoji: "7️⃣" },
  { type: "number", prompt: "How many?", promptHe: "כמה?", answer: "Ten", options: ["Eight", "Nine", "Ten", "Eleven"], emoji: "🔟" },
];

export function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
