import type {
  MysteryConfig,
  MultiplicationConfig,
  ShukConfig,
  ShukItem,
} from "./types";

export type { ShukItem };

export interface ShukCartLine {
  item: ShukItem;
  quantity: number;
}

export interface ShukChallenge {
  lines: ShukCartLine[];
  total: number;
  paid: number;
  change: number;
}

export interface MultiplicationQuestion {
  a: number;
  b: number;
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
  op: "multiply" | "add" | "subtract" | "divide" | "double" | "half" | "multiply_add";
  /** Available from this difficulty level upward (1=easy, 2=medium, 3=hard) */
  minDifficulty?: 1 | 2 | 3;
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

export function generateShukChallenge(items: ShukItem[], config: ShukConfig): ShukChallenge {
  const count =
    config.minItems +
    Math.floor(Math.random() * (config.maxItems - config.minItems + 1));
  const shuffled = [...items].sort(() => Math.random() - 0.5);
  const picked = shuffled.slice(0, Math.min(count, items.length));
  const maxQuantity = config.maxQuantityPerItem ?? 1;
  const lines: ShukCartLine[] = picked.map((item) => ({
    item,
    quantity:
      maxQuantity === 1
        ? 1
        : Math.floor(Math.random() * maxQuantity) + 1,
  }));
  const total = lines.reduce((sum, line) => sum + line.item.price * line.quantity, 0);
  const paid = total + (Math.floor(Math.random() * 3) + 1) * 5;
  return { lines, total, paid, change: paid - total };
}

export function generateMystery(
  templates: MysteryTemplate[],
  config: MysteryConfig
): MysteryQuestion {
  const pool = templates.length > 0 ? templates : [];
  const template = pool[Math.floor(Math.random() * pool.length)];
  const n = Math.floor(Math.random() * config.maxN) + 2;
  const m = Math.floor(Math.random() * 4) + 1;
  let answer: number;
  let result: number;

  switch (template.op) {
    case "multiply":
      answer = Math.floor(Math.random() * config.maxAnswer) + 1;
      result = answer * n;
      break;
    case "add":
      answer = Math.floor(Math.random() * (config.maxResult - n - 4)) + 5;
      result = answer + n;
      break;
    case "subtract":
      answer = Math.floor(Math.random() * (config.maxResult - n - 10)) + n + 10;
      result = answer - n;
      break;
    case "divide":
      result = Math.floor(Math.random() * config.maxAnswer) + 1;
      answer = result * n;
      break;
    case "double":
      answer = Math.floor(Math.random() * config.maxAnswer) + 1;
      result = answer * 2;
      break;
    case "half":
      result = Math.floor(Math.random() * config.maxAnswer) + 1;
      answer = result * 2;
      break;
    case "multiply_add":
      answer = Math.floor(Math.random() * config.maxAnswer) + 1;
      result = answer * n + m;
      break;
    default:
      answer = 1;
      result = 1;
  }

  const fill = (s: string) =>
    s
      .replace(/\{n\}/g, String(n))
      .replace(/\{m\}/g, String(m))
      .replace(/\{result\}/g, String(result));

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

export function normalizeShukChallenge(raw: unknown): ShukChallenge | null {
  if (!raw || typeof raw !== "object") return null;
  const c = raw as Record<string, unknown>;
  if (Array.isArray(c.lines) && typeof c.total === "number") {
    return c as unknown as ShukChallenge;
  }
  if (Array.isArray(c.items) && typeof c.total === "number") {
    const items = c.items as ShukItem[];
    return {
      lines: items.map((item) => ({ item, quantity: 1 })),
      total: c.total as number,
      paid: c.paid as number,
      change: c.change as number,
    };
  }
  return null;
}

export function normalizeShukRound(
  raw: unknown,
  items: ShukItem[],
  config: ShukConfig
): { challenge: ShukChallenge; options: number[] } {
  if (raw && typeof raw === "object") {
    const r = raw as { challenge?: unknown; options?: number[] };
    const challenge = normalizeShukChallenge(r.challenge);
    if (challenge) {
      return {
        challenge,
        options:
          Array.isArray(r.options) && r.options.length > 0
            ? r.options
            : buildOptions(challenge.change),
      };
    }
  }
  const challenge = generateShukChallenge(items, config);
  return { challenge, options: buildOptions(challenge.change) };
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
