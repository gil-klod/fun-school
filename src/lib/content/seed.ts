import { connectDB } from "@/lib/db";
import { GameContent } from "@/models/GameContent";
import type { DifficultyLevel } from "@/lib/content/types";
import { GRAMMAR_QUESTIONS, VOCAB_QUESTIONS, ENGLISH_STORIES } from "@/lib/data/english-natives";
import {
  BEGINNER_VOCAB,
  COLORS_NUMBERS,
  sentencesForDifficulty,
} from "@/lib/data/english-beginners";
import { HEBREW_WORDS, FIX_SENTENCES } from "@/lib/data/hebrew";
import { HEBREW_STORIES_BY_LEVEL } from "@/lib/data/hebrew-stories";
import { SHUK_ITEMS, MYSTERY_TEMPLATES } from "@/lib/data/math";
import { CLOCK_CONFIGS, SEQUENCES_CONFIGS } from "@/lib/content/generators";

type SeedDoc = {
  subjectId: string;
  gameId: string;
  difficulty: DifficultyLevel;
  itemType: string;
  data: Record<string, unknown>;
  sortOrder: number;
};

function configs(): SeedDoc[] {
  const games: Array<{ subjectId: string; gameId: string }> = [
    { subjectId: "math", gameId: "multiplication" },
    { subjectId: "math", gameId: "shuk" },
    { subjectId: "math", gameId: "mystery" },
    { subjectId: "math", gameId: "analog-clock" },
    { subjectId: "math", gameId: "sequences" },
  ];

  const multConfigs: Record<DifficultyLevel, Record<string, unknown>> = {
    1: { tables: [2, 3], maxMultiplier: 5 },
    2: { tables: [2, 3, 4, 5], maxMultiplier: 9 },
    3: { tables: [2, 3, 4, 5, 6, 7, 8, 9, 10], maxMultiplier: 12 },
  };

  const shukConfigs: Record<DifficultyLevel, Record<string, unknown>> = {
    1: { minItems: 2, maxItems: 2 },
    2: { minItems: 2, maxItems: 3 },
    3: { minItems: 3, maxItems: 4, maxQuantityPerItem: 3 },
  };

  const mysteryConfigs: Record<DifficultyLevel, Record<string, unknown>> = {
    1: { maxN: 5, maxAnswer: 5, maxResult: 20 },
    2: { maxN: 8, maxAnswer: 9, maxResult: 50 },
    3: { maxN: 12, maxAnswer: 12, maxResult: 99 },
  };

  const clockConfigs: Record<DifficultyLevel, Record<string, unknown>> = {
    1: { minuteStep: 60 },
    2: { minuteStep: 30 },
    3: { minuteStep: 5 },
  };

  const sequencesConfigs: Record<DifficultyLevel, Record<string, unknown>> = {
    1: { minStart: 1, maxStart: 10, stepMin: 1, stepMax: 2, slotCount: 4, twoGapChance: 0.25 },
    2: { minStart: 1, maxStart: 30, stepMin: 2, stepMax: 5, slotCount: 5, twoGapChance: 0.35 },
    3: { minStart: 5, maxStart: 99, stepMin: 3, stepMax: 12, slotCount: 6, twoGapChance: 0.45 },
  };

  const configByGame: Record<string, Record<DifficultyLevel, Record<string, unknown>>> = {
    multiplication: multConfigs,
    shuk: shukConfigs,
    mystery: mysteryConfigs,
    "analog-clock": clockConfigs,
    sequences: sequencesConfigs,
  };

  const docs: SeedDoc[] = [];
  for (const { subjectId, gameId } of games) {
    for (const difficulty of [1, 2, 3] as DifficultyLevel[]) {
      docs.push({
        subjectId,
        gameId,
        difficulty,
        itemType: "config",
        data: configByGame[gameId][difficulty],
        sortOrder: 0,
      });
    }
  }
  return docs;
}

function sliceByDifficulty<T>(
  items: T[],
  difficulty: DifficultyLevel,
  subjectId: string,
  gameId: string,
  itemType: string,
  toData: (item: T) => Record<string, unknown>
): SeedDoc[] {
  let pool: T[];
  if (difficulty === 1) {
    pool = items.slice(0, Math.max(1, Math.ceil(items.length / 2)));
  } else {
    pool = items;
  }

  return pool.map((item, i) => ({
    subjectId,
    gameId,
    difficulty,
    itemType,
    data: toData(item),
    sortOrder: i + 1,
  }));
}

function buildSeedDocs(): SeedDoc[] {
  const docs: SeedDoc[] = [...configs()];

  for (const difficulty of [1, 2, 3] as DifficultyLevel[]) {
    docs.push(
      ...sliceByDifficulty(HEBREW_WORDS, difficulty, "hebrew", "scramble", "word", (w) => ({
        ...w,
      })),
      ...sliceByDifficulty(
        FIX_SENTENCES,
        difficulty,
        "hebrew",
        "fix-sentence",
        "fix-sentence",
        (q) => ({ ...q })
      ),
      ...sliceByDifficulty(
        BEGINNER_VOCAB,
        difficulty,
        "english-beginners",
        "vocabulary",
        "vocab",
        (v) => ({ ...v })
      ),
      ...sentencesForDifficulty(difficulty).map((s, i) => ({
        subjectId: "english-beginners",
        gameId: "sentences",
        difficulty,
        itemType: "sentence",
        data: { ...s },
        sortOrder: i + 1,
      })),
      ...sliceByDifficulty(
        COLORS_NUMBERS,
        difficulty,
        "english-beginners",
        "colors-numbers",
        "color-number",
        (q) => ({ ...q })
      ),
      ...sliceByDifficulty(
        GRAMMAR_QUESTIONS,
        difficulty,
        "english-natives",
        "grammar",
        "quiz",
        (q) => ({ ...q })
      ),
      ...sliceByDifficulty(
        VOCAB_QUESTIONS,
        difficulty,
        "english-natives",
        "vocabulary",
        "quiz",
        (q) => ({ ...q })
      ),
      ...sliceByDifficulty(
        ENGLISH_STORIES,
        difficulty,
        "english-natives",
        "comprehension",
        "story",
        (s) => ({ ...s })
      )
    );

    HEBREW_STORIES_BY_LEVEL[difficulty].forEach((story, i) => {
      docs.push({
        subjectId: "hebrew",
        gameId: "comprehension",
        difficulty,
        itemType: "story",
        data: { ...story },
        sortOrder: i + 1,
      });
    });

    const shukItems =
      difficulty === 1
        ? SHUK_ITEMS.filter((i) => i.price <= 5)
        : difficulty === 2
          ? SHUK_ITEMS
          : SHUK_ITEMS;

    shukItems.forEach((item, i) => {
      docs.push({
        subjectId: "math",
        gameId: "shuk",
        difficulty,
        itemType: "shuk-item",
        data: { ...item },
        sortOrder: i + 1,
      });
    });

    MYSTERY_TEMPLATES.filter((t) => (t.minDifficulty ?? 1) <= difficulty).forEach(
      (item, i) => {
      docs.push({
        subjectId: "math",
        gameId: "mystery",
        difficulty,
        itemType: "mystery-template",
        data: { ...item },
        sortOrder: i + 1,
      });
    }
    );

  }

  return docs;
}

export async function seedGameContent(clearExisting = true): Promise<{ inserted: number }> {
  await connectDB();

  if (clearExisting) {
    await GameContent.deleteMany({});
  }

  const docs = buildSeedDocs();
  await GameContent.insertMany(docs);

  return { inserted: docs.length };
}

export async function fetchGameContentBundle(
  subjectId: string,
  gameId: string,
  difficulty: DifficultyLevel
) {
  await connectDB();

  const rows = await GameContent.find({
    subjectId,
    gameId,
    difficulty,
    active: true,
  }).sort({ itemType: 1, sortOrder: 1 });

  if (rows.length === 0) {
    if (gameId === "analog-clock") {
      return {
        subjectId,
        gameId,
        difficulty,
        config: CLOCK_CONFIGS[difficulty],
        items: [],
        sessionSize: 10,
      };
    }
    if (gameId === "sequences") {
      return {
        subjectId,
        gameId,
        difficulty,
        config: SEQUENCES_CONFIGS[difficulty],
        items: [],
        sessionSize: 10,
      };
    }
    return null;
  }

  const configRow = rows.find((r) => r.itemType === "config");
  let config: Record<string, unknown> | null = configRow
    ? (configRow.data as Record<string, unknown>)
    : null;
  if (gameId === "shuk" && difficulty === 3 && config) {
    config = { maxQuantityPerItem: 3, ...config };
  }
  let items = rows
    .filter((r) => r.itemType !== "config")
    .map((r) => ({
      itemType: r.itemType,
      data: r.data as Record<string, unknown>,
    }));

  if (gameId === "colors-numbers") {
    const colorItems = items.filter((item) => item.itemType === "color-number");
    if (colorItems.length < 50) {
      const pool =
        difficulty === 1
          ? COLORS_NUMBERS.slice(0, Math.max(1, Math.ceil(COLORS_NUMBERS.length / 2)))
          : COLORS_NUMBERS;
      items = pool.map((q) => ({
        itemType: "color-number",
        data: q as unknown as Record<string, unknown>,
      }));
    }
  }

  if (gameId === "sentences") {
    const pool = sentencesForDifficulty(difficulty);
    const configItems = items.filter((item) => item.itemType === "config");
    items = [
      ...configItems,
      ...pool.map((q) => ({
        itemType: "sentence" as const,
        data: q as unknown as Record<string, unknown>,
      })),
    ];
  }

  if (gameId === "fix-sentence") {
    const pool =
      difficulty === 1
        ? FIX_SENTENCES.slice(0, Math.max(1, Math.ceil(FIX_SENTENCES.length / 2)))
        : FIX_SENTENCES;
    const configItems = items.filter((item) => item.itemType === "config");
    items = [
      ...configItems,
      ...pool.map((q) => ({
        itemType: "fix-sentence" as const,
        data: q as unknown as Record<string, unknown>,
      })),
    ];
  }

  if (gameId === "comprehension" && subjectId === "hebrew") {
    const stories = HEBREW_STORIES_BY_LEVEL[difficulty] ?? [];
    const configItems = items.filter((item) => item.itemType === "config");
    items = [
      ...configItems,
      ...stories.map((story) => ({
        itemType: "story" as const,
        data: story as unknown as Record<string, unknown>,
      })),
    ];
  }

  if (gameId === "mystery") {
    const templates = MYSTERY_TEMPLATES.filter((t) => (t.minDifficulty ?? 1) <= difficulty);
    const configItems = items.filter((item) => item.itemType === "config");
    items = [
      ...configItems,
      ...templates.map((t) => ({
        itemType: "mystery-template" as const,
        data: t as unknown as Record<string, unknown>,
      })),
    ];
  }

  if (gameId === "sequences") {
    config = { ...SEQUENCES_CONFIGS[difficulty], ...(config ?? {}) };
  }
  if (gameId === "analog-clock" && !config) {
    config = CLOCK_CONFIGS[difficulty] as unknown as Record<string, unknown>;
  }

  const sessionSize =
    gameId === "multiplication" ||
    gameId === "shuk" ||
    gameId === "mystery" ||
    gameId === "analog-clock" ||
    gameId === "sequences" ||
    gameId === "scramble" ||
    gameId === "fix-sentence" ||
    gameId === "vocabulary" ||
    gameId === "grammar" ||
    gameId === "colors-numbers" ||
    gameId === "sentences"
      ? 10
      : items.length || 10;

  return {
    subjectId,
    gameId,
    difficulty,
    config,
    items,
    sessionSize,
  };
}
