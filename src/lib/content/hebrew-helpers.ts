import { scrambleWord } from "./generators";

export interface HebrewWord {
  word: string;
  hintHe: string;
  hintEn: string;
  categoryHe: string;
  categoryEn: string;
}

export function getWordHint(word: HebrewWord, locale: "he" | "en") {
  return locale === "he" ? word.hintHe : word.hintEn;
}

export function getWordCategory(word: HebrewWord, locale: "he" | "en") {
  return locale === "he" ? word.categoryHe : word.categoryEn;
}

export function pickWord(words: HebrewWord[], exclude: string[] = []): HebrewWord {
  const pool = words.filter((w) => !exclude.includes(w.word));
  const list = pool.length > 0 ? pool : words;
  return list[Math.floor(Math.random() * list.length)];
}

export function newScrambleWord(words: HebrewWord[], exclude: string[] = []) {
  const w = pickWord(words, exclude);
  return { ...w, scrambled: scrambleWord(w.word) };
}
