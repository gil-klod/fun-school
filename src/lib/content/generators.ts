import type {
  MysteryConfig,
  MultiplicationConfig,
  ShukConfig,
} from "./types";

export interface MultiplicationQuestion {
  a: number;
  b: number;
}

export interface ShukItem {
  name: string;
  nameHe: string;
  price: number;
  emoji: string;
}

export interface MysteryQuestion {
  text: string;
  textHe: string;
  answer: number;
  hint: string;
  hintHe: string;
}

export interface MysteryTemplate {
  text: string;
  textHe: string;
  hint: string;
  hintHe: string;
  op: "multiply" | "add" | "subtract";
}

export function getShukItemName(item: ShukItem, locale: "he" | "en"): string {
  return locale === "he" ? item.nameHe : item.name;
}

export function getMysteryText(question: MysteryQuestion, locale: "he" | "en"): string {
  return locale === "he" ? question.textHe : question.text;
}

export function getMysteryHint(question: MysteryQuestion, locale: "he" | "en"): string {
  return locale === "he" ? (question.hintHe ?? question.hint) : question.hint;
}

export function generateMultiplication(
  config: MultiplicationConfig,
  table?: number
): MultiplicationQuestion {
  const tables = config.tables.length > 0 ? config.tables : [2, 3, 4, 5];
  const t = table ?? tables[Math.floor(Math.random() * tables.length)];
  const b = Math.floor(Math.random() * config.maxMultiplier) + 1;
  return { a: t, b };
}

export function generateShukChallenge(items: ShukItem[], config: ShukConfig) {
  const count =
    config.minItems +
    Math.floor(Math.random() * (config.maxItems - config.minItems + 1));
  const shuffled = [...items].sort(() => Math.random() - 0.5);
  const picked = shuffled.slice(0, Math.min(count, items.length));
  const total = picked.reduce((sum, item) => sum + item.price, 0);
  const paid = total + (Math.floor(Math.random() * 3) + 1) * 5;
  return { items: picked, total, paid, change: paid - total };
}

export function generateMystery(
  templates: MysteryTemplate[],
  config: MysteryConfig
): MysteryQuestion {
  const template = templates[Math.floor(Math.random() * templates.length)];
  const n = Math.floor(Math.random() * config.maxN) + 2;
  let answer: number;
  let result: number;

  if (template.op === "multiply") {
    answer = Math.floor(Math.random() * config.maxAnswer) + 1;
    result = answer * n;
  } else if (template.op === "add") {
    answer = Math.floor(Math.random() * config.maxResult) + 5;
    result = answer + n;
  } else {
    answer = Math.floor(Math.random() * config.maxResult) + 10;
    result = answer - n;
  }

  const fill = (s: string) =>
    s.replace(/\{n\}/g, String(n)).replace(/\{result\}/g, String(result));

  return {
    text: fill(template.text),
    textHe: fill(template.textHe),
    answer,
    hint: fill(template.hint),
    hintHe: fill(template.hintHe),
  };
}

export function generateWrongAnswers(correct: number, count = 3): number[] {
  const wrong = new Set<number>();
  while (wrong.size < count) {
    const offset = Math.floor(Math.random() * 10) - 5;
    const candidate = correct + (offset === 0 ? 1 : offset);
    if (candidate > 0 && candidate !== correct) wrong.add(candidate);
  }
  return Array.from(wrong);
}

export function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function buildOptions(correct: number, count = 3): number[] {
  return shuffleArray([correct, ...generateWrongAnswers(correct, count)]);
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
