import { connectDB } from "@/lib/db";
import { GameContent } from "@/models/GameContent";
import { parseImportPayload, type ImportResult } from "@/lib/content/import";

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
