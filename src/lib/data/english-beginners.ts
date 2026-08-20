export type { VocabPair } from "./english-beginner-vocab";
export { ENGLISH_BEGINNER_VOCAB as BEGINNER_VOCAB } from "./english-beginner-vocab";

export interface SentenceChallenge {
  words: string[];
  correct: string;
  translation: string;
}

export const SENTENCE_CHALLENGES: SentenceChallenge[] = [
  {
    words: ["I", "a", "book", "read"],
    correct: "I read a book",
    translation: "אני קורא ספר",
  },
  {
    words: ["is", "The", "big", "dog"],
    correct: "The dog is big",
    translation: "הכלב גדול",
  },
  {
    words: ["like", "I", "apples"],
    correct: "I like apples",
    translation: "אני אוהב תפוחים",
  },
  {
    words: ["go", "to", "I", "school"],
    correct: "I go to school",
    translation: "אני הולך לבית ספר",
  },
  {
    words: ["is", "She", "happy"],
    correct: "She is happy",
    translation: "היא שמחה",
  },
  {
    words: ["play", "We", "ball", "a"],
    correct: "We play a ball",
    translation: "אנחנו משחקים בכדור",
  },
];

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
