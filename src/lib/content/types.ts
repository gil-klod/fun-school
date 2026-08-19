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
