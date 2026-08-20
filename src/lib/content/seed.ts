import { connectDB } from "@/lib/db";
import { GameContent } from "@/models/GameContent";
import type { DifficultyLevel } from "@/lib/content/types";
import { GRAMMAR_QUESTIONS, VOCAB_QUESTIONS, ENGLISH_STORIES } from "@/lib/data/english-natives";
import {
  BEGINNER_VOCAB,
  SENTENCE_CHALLENGES,
  COLORS_NUMBERS,
} from "@/lib/data/english-beginners";
import { HEBREW_WORDS, FIX_SENTENCES } from "@/lib/data/hebrew";
import { HEBREW_STORIES_BY_LEVEL } from "@/lib/data/hebrew-stories";
import { SHUK_ITEMS, MYSTERY_TEMPLATES } from "@/lib/data/math";

const EXTRA_GRAMMAR_HARD = [
  {
    question: "We ___ to the beach every summer.",
    options: ["goes", "go", "going", "went"],
    correctIndex: 1,
    explanation: "We + go in present simple",
  },
  {
    question: "The bird ___ in the sky.",
    options: ["fly", "flies", "flying", "flied"],
    correctIndex: 1,
    explanation: "Singular bird → flies",
  },
];

const EXTRA_VOCAB_HARD = [
  {
    question: "What does 'ancient' mean?",
    options: ["Very new", "Very old", "Very big", "Very small"],
    correctIndex: 1,
    explanation: "Ancient = very old",
  },
  {
    question: "What is the opposite of 'expand'?",
    options: ["Grow", "Shrink", "Build", "Open"],
    correctIndex: 1,
    explanation: "Expand ↔ Shrink",
  },
];

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

  const docs: SeedDoc[] = [];
  for (const { subjectId, gameId } of games) {
    for (const difficulty of [1, 2, 3] as DifficultyLevel[]) {
      let data: Record<string, unknown>;
      if (gameId === "multiplication") data = multConfigs[difficulty];
      else if (gameId === "shuk") data = shukConfigs[difficulty];
      else data = mysteryConfigs[difficulty];

      docs.push({
        subjectId,
        gameId,
        difficulty,
        itemType: "config",
        data,
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
      ...sliceByDifficulty(
        SENTENCE_CHALLENGES,
        difficulty,
        "english-beginners",
        "sentences",
        "sentence",
        (s) => ({ ...s })
      ),
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

    if (difficulty === 3) {
      EXTRA_GRAMMAR_HARD.forEach((q, i) => {
        docs.push({
          subjectId: "english-natives",
          gameId: "grammar",
          difficulty: 3,
          itemType: "quiz",
          data: { ...q },
          sortOrder: GRAMMAR_QUESTIONS.length + i + 1,
        });
      });
      EXTRA_VOCAB_HARD.forEach((q, i) => {
        docs.push({
          subjectId: "english-natives",
          gameId: "vocabulary",
          difficulty: 3,
          itemType: "quiz",
          data: { ...q },
          sortOrder: VOCAB_QUESTIONS.length + i + 1,
        });
      });
    }
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
    return null;
  }

  const configRow = rows.find((r) => r.itemType === "config");
  let config: Record<string, unknown> | null = configRow
    ? (configRow.data as Record<string, unknown>)
    : null;
  if (gameId === "shuk" && difficulty === 3 && config) {
    config = { maxQuantityPerItem: 3, ...config };
  }
  const items = rows
    .filter((r) => r.itemType !== "config")
    .map((r) => ({
      itemType: r.itemType,
      data: r.data as Record<string, unknown>,
    }));

  const sessionSize =
    gameId === "multiplication" ||
    gameId === "shuk" ||
    gameId === "mystery" ||
    gameId === "scramble" ||
    gameId === "vocabulary" ||
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
