export type DifficultyLevel = 1 | 2 | 3;

export const DIFFICULTY_LEVELS: DifficultyLevel[] = [1, 2, 3];

export type ContentItemType =
  | "quiz"
  | "word"
  | "vocab"
  | "sentence"
  | "story"
  | "fix-sentence"
  | "color-number"
  | "shuk-item"
  | "mystery-template"
  | "config";

export interface GameContentItem {
  itemType: ContentItemType;
  data: Record<string, unknown>;
}

export interface GameContentBundle {
  subjectId: string;
  gameId: string;
  difficulty: DifficultyLevel;
  config: Record<string, unknown> | null;
  items: GameContentItem[];
  sessionSize: number;
}

export interface MultiplicationConfig {
  tables: number[];
  maxMultiplier: number;
}

export interface ShukConfig {
  minItems: number;
  maxItems: number;
  /** Max units per product (hard level). Defaults to 1. */
  maxQuantityPerItem?: number;
}

export interface ShukItem {
  name: string;
  nameHe: string;
  price: number;
  emoji: string;
}

export interface MysteryConfig {
  maxN: number;
  maxAnswer: number;
  maxResult: number;
}

export interface ClockConfig {
  /** Minutes between valid times (60 = whole hours only). */
  minuteStep: 5 | 15 | 30 | 60;
}

export interface SequencesConfig {
  minStart: number;
  maxStart: number;
  stepMin: number;
  stepMax: number;
  /** How many slots appear in the sequence (including gaps). */
  slotCount: number;
  /** Chance (0–1) of two missing numbers instead of one. */
  twoGapChance?: number;
  /** @deprecated legacy field — use slotCount */
  visibleCount?: number;
}

export interface DivisionConfig {
  divisors: number[];
  maxQuotient: number;
  /** Ask "how many groups?" (inverse). */
  includeGroupCount?: boolean;
  /** Show ÷ symbol questions. */
  includeSymbol?: boolean;
}
