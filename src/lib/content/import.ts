import type { ContentItemType, DifficultyLevel } from "@/lib/content/types";
import { DIFFICULTY_LEVELS } from "@/lib/content/types";

const VALID_ITEM_TYPES: ContentItemType[] = [
  "quiz",
  "word",
  "vocab",
  "sentence",
  "story",
  "fix-sentence",
  "color-number",
  "shuk-item",
  "mystery-template",
  "division-riddle",
  "config",
];

export interface ImportContentItem {
  subjectId: string;
  gameId: string;
  difficulty: DifficultyLevel;
  itemType: ContentItemType;
  data: Record<string, unknown>;
  sortOrder?: number;
  active?: boolean;
}

export interface ImportResult {
  inserted: number;
  errors: string[];
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseImportPayload(raw: unknown): ImportContentItem[] {
  if (Array.isArray(raw)) {
    return raw.map((item, i) => validateImportItem(item, i));
  }
  if (isObject(raw) && Array.isArray(raw.items)) {
    return raw.items.map((item, i) => validateImportItem(item, i));
  }
  throw new Error("JSON must be an array of items or { \"items\": [...] }");
}

function validateImportItem(raw: unknown, index: number): ImportContentItem {
  if (!isObject(raw)) {
    throw new Error(`Item ${index + 1}: must be an object`);
  }

  const subjectId = raw.subjectId;
  const gameId = raw.gameId;
  const difficulty = raw.difficulty;
  const itemType = raw.itemType;
  const data = raw.data;

  if (typeof subjectId !== "string" || !subjectId.trim()) {
    throw new Error(`Item ${index + 1}: subjectId is required`);
  }
  if (typeof gameId !== "string" || !gameId.trim()) {
    throw new Error(`Item ${index + 1}: gameId is required`);
  }
  if (!DIFFICULTY_LEVELS.includes(difficulty as DifficultyLevel)) {
    throw new Error(`Item ${index + 1}: difficulty must be 1, 2, or 3`);
  }
  if (typeof itemType !== "string" || !VALID_ITEM_TYPES.includes(itemType as ContentItemType)) {
    throw new Error(
      `Item ${index + 1}: itemType must be one of: ${VALID_ITEM_TYPES.join(", ")}`
    );
  }
  if (!isObject(data)) {
    throw new Error(`Item ${index + 1}: data must be an object`);
  }

  return {
    subjectId: subjectId.trim(),
    gameId: gameId.trim(),
    difficulty: difficulty as DifficultyLevel,
    itemType: itemType as ContentItemType,
    data,
    sortOrder: typeof raw.sortOrder === "number" ? raw.sortOrder : index + 1,
    active: raw.active !== false,
  };
}

export const EXAMPLE_IMPORT_JSON = `[
  {
    "subjectId": "hebrew",
    "gameId": "scramble",
    "difficulty": 2,
    "itemType": "word",
    "sortOrder": 99,
    "data": {
      "word": "גשם",
      "hintHe": "יורד מהשמיים",
      "hintEn": "Falls from the sky",
      "categoryHe": "טבע",
      "categoryEn": "nature"
    }
  },
  {
    "subjectId": "english-natives",
    "gameId": "grammar",
    "difficulty": 2,
    "itemType": "quiz",
    "sortOrder": 99,
    "data": {
      "question": "They ___ football every Sunday.",
      "options": ["play", "plays", "playing", "played"],
      "correctIndex": 0,
      "explanation": "They + play in present simple"
    }
  }
]`;
