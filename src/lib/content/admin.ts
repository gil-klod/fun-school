import { connectDB } from "@/lib/db";
import { GameContent } from "@/models/GameContent";
import { parseImportPayload, type ImportResult } from "@/lib/content/import";
import type { DifficultyLevel } from "@/lib/content/types";

export async function importGameContent(raw: unknown): Promise<ImportResult> {
  const items = parseImportPayload(raw);
  await connectDB();

  const errors: string[] = [];
  let inserted = 0;

  for (const item of items) {
    try {
      await GameContent.create(item);
      inserted += 1;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      errors.push(`${item.subjectId}/${item.gameId} #${item.sortOrder}: ${message}`);
    }
  }

  return { inserted, errors };
}

export async function replaceGameContent(
  subjectId: string,
  gameId: string,
  difficulty: DifficultyLevel,
  raw: unknown
): Promise<ImportResult> {
  const payload = Array.isArray(raw)
    ? raw
    : typeof raw === "object" && raw !== null && Array.isArray((raw as { items?: unknown }).items)
      ? (raw as { items: unknown[] }).items
      : raw;

  const enriched = (Array.isArray(payload) ? payload : [payload]).map((item, index) => ({
    ...(typeof item === "object" && item !== null ? item : {}),
    subjectId,
    gameId,
    difficulty,
    sortOrder:
      typeof (item as { sortOrder?: unknown })?.sortOrder === "number"
        ? (item as { sortOrder: number }).sortOrder
        : index + 1,
  }));

  const items = parseImportPayload(enriched);

  await connectDB();
  await GameContent.deleteMany({ subjectId, gameId, difficulty });

  const errors: string[] = [];
  let inserted = 0;

  for (const item of items) {
    try {
      await GameContent.create(item);
      inserted += 1;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      errors.push(`#${item.sortOrder}: ${message}`);
    }
  }

  return { inserted, errors };
}

export async function listGameContent(
  subjectId: string,
  gameId: string,
  difficulty: DifficultyLevel
) {
  await connectDB();
  return GameContent.find({ subjectId, gameId, difficulty, active: true })
    .sort({ itemType: 1, sortOrder: 1 })
    .lean();
}

export async function getContentStats() {
  await connectDB();

  const total = await GameContent.countDocuments({ active: true });
  const byGame = await GameContent.aggregate([
    { $match: { active: true } },
    {
      $group: {
        _id: { subjectId: "$subjectId", gameId: "$gameId" },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.subjectId": 1, "_id.gameId": 1 } },
  ]);

  return {
    total,
    games: byGame.map((row) => ({
      subjectId: row._id.subjectId as string,
      gameId: row._id.gameId as string,
      count: row.count as number,
    })),
  };
}

export async function getContentStatsForGame(subjectId: string, gameId: string) {
  await connectDB();
  const rows = await GameContent.aggregate([
    { $match: { subjectId, gameId, active: true } },
    { $group: { _id: "$difficulty", count: { $sum: 1 } } },
  ]);
  return {
    1: rows.find((r) => r._id === 1)?.count ?? 0,
    2: rows.find((r) => r._id === 2)?.count ?? 0,
    3: rows.find((r) => r._id === 3)?.count ?? 0,
  } as Record<DifficultyLevel, number>;
}
