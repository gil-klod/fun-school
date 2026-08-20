import { HEBREW_SCRAMBLE_WORDS } from "./hebrew-scramble-words";
import { HEBREW_FIX_SENTENCES } from "./hebrew-fix-sentences";

export interface HebrewWord {
  word: string;
  hintHe: string;
  hintEn: string;
  categoryHe: string;
  categoryEn: string;
}

export const HEBREW_WORDS: HebrewWord[] = HEBREW_SCRAMBLE_WORDS;

export function getWordHint(word: HebrewWord, locale: "he" | "en") {
  return locale === "he" ? word.hintHe : word.hintEn;
}

export function getWordCategory(word: HebrewWord, locale: "he" | "en") {
  return locale === "he" ? word.categoryHe : word.categoryEn;
}

export function pickWord(exclude: string[] = []): HebrewWord {
  const pool = HEBREW_WORDS.filter((w) => !exclude.includes(w.word));
  const list = pool.length > 0 ? pool : HEBREW_WORDS;
  return list[Math.floor(Math.random() * list.length)];
}

export function scrambleWord(word: string): string {
  const chars = word.split("");
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  const scrambled = chars.join("");
  return scrambled === word ? scrambleWord(word) : scrambled;
}

export function newScrambleWord(exclude: string[] = []) {
  const w = pickWord(exclude);
  return { ...w, scrambled: scrambleWord(w.word) };
}

export interface FixSentenceQuestion {
  wrong: string;
  correct: string;
  mistake: string;
  options: string[];
  explanationHe: string;
  explanationEn: string;
}

export function getFixSentenceExplanation(
  question: FixSentenceQuestion,
  locale: "he" | "en"
): string {
  return locale === "he" ? question.explanationHe : question.explanationEn;
}

export const FIX_SENTENCES: FixSentenceQuestion[] = HEBREW_FIX_SENTENCES;

export interface HebrewStory {
  title: string;
  text: string;
  /** Pre-vocalized title (nikud) — shown when the nikud toggle is on */
  titleNikud?: string;
  /** Pre-vocalized story text (nikud) — shown when the nikud toggle is on */
  textNikud?: string;
  questions: { question: string; options: string[]; correctIndex: number }[];
}
