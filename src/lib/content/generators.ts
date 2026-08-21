import type {
  ClockConfig,
  DifficultyLevel,
  MysteryConfig,
  MultiplicationConfig,
  SequencesConfig,
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

export const CLOCK_CONFIGS: Record<DifficultyLevel, ClockConfig> = {
  1: { minuteStep: 60 },
  2: { minuteStep: 30 },
  3: { minuteStep: 5 },
};

export const SEQUENCES_CONFIGS: Record<DifficultyLevel, SequencesConfig> = {
  1: { minStart: 1, maxStart: 10, stepMin: 1, stepMax: 2, visibleCount: 3 },
  2: { minStart: 1, maxStart: 30, stepMin: 2, stepMax: 5, visibleCount: 4 },
  3: { minStart: 5, maxStart: 99, stepMin: 3, stepMax: 12, visibleCount: 4 },
};

export interface ClockQuestion {
  hour: number;
  minute: number;
  label: string;
}

export interface SequenceQuestion {
  numbers: number[];
  answer: number;
}

export function formatClockTime(hour: number, minute: number): string {
  return `${hour}:${minute.toString().padStart(2, "0")}`;
}

export function generateClock(config: ClockConfig): ClockQuestion {
  const hour = Math.floor(Math.random() * 12) + 1;
  const stepCount = Math.floor(60 / config.minuteStep);
  const minute = (Math.floor(Math.random() * stepCount) * config.minuteStep) % 60;
  return { hour, minute, label: formatClockTime(hour, minute) };
}

export function buildTimeOptions(hour: number, minute: number, minuteStep: number): string[] {
  const correct = formatClockTime(hour, minute);
  const wrong = new Set<string>();
  let guard = 0;
  while (wrong.size < 3 && guard < 40) {
    guard += 1;
    const h = Math.floor(Math.random() * 12) + 1;
    const stepCount = Math.floor(60 / minuteStep);
    const m = (Math.floor(Math.random() * stepCount) * minuteStep) % 60;
    const label = formatClockTime(h, m);
    if (label !== correct) wrong.add(label);
  }
  return shuffleArray([correct, ...Array.from(wrong)]);
}

export function generateSequence(config: SequencesConfig): SequenceQuestion {
  const step =
    Math.floor(Math.random() * (config.stepMax - config.stepMin + 1)) + config.stepMin;
  const span = config.maxStart - config.minStart;
  const start =
    config.minStart + Math.floor(Math.random() * (span + 1));
  const numbers: number[] = [];
  for (let i = 0; i < config.visibleCount; i++) {
    numbers.push(start + step * i);
  }
  const answer = start + step * config.visibleCount;
  return { numbers, answer };
}

export function buildSequenceOptions(correct: number, step: number): number[] {
  const wrong = new Set<number>();
  let guard = 0;
  while (wrong.size < 3 && guard < 40) {
    guard += 1;
    const offset = (Math.floor(Math.random() * 5) + 1) * step * (Math.random() > 0.5 ? 1 : -1);
    const candidate = correct + offset;
    if (candidate > 0 && candidate !== correct) wrong.add(candidate);
  }
  while (wrong.size < 3) {
    const candidate = correct + wrong.size + 1;
    if (candidate !== correct) wrong.add(candidate);
  }
  return shuffleArray([correct, ...Array.from(wrong)]);
}

export function newClockRound(config: ClockConfig) {
  const question = generateClock(config);
  return {
    question,
    options: buildTimeOptions(question.hour, question.minute, config.minuteStep),
  };
}

export function newSequenceRound(config: SequencesConfig) {
  const question = generateSequence(config);
  const step =
    question.numbers.length >= 2
      ? question.numbers[1] - question.numbers[0]
      : config.stepMin;
  return {
    question,
    options: buildSequenceOptions(question.answer, Math.max(1, step)),
  };
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
