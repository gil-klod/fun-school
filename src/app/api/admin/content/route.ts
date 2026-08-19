import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { listGameContent, replaceGameContent } from "@/lib/content/admin";
import type { DifficultyLevel } from "@/lib/content/types";
import { DIFFICULTY_LEVELS } from "@/lib/content/types";

function parseDifficulty(value: string | null): DifficultyLevel | null {
  const n = Number(value);
  return DIFFICULTY_LEVELS.includes(n as DifficultyLevel) ? (n as DifficultyLevel) : null;
}

export async function GET(request: Request) {
  const gate = await requireAdmin();
  if (gate.error) return gate.error;

  const url = new URL(request.url);
  const subjectId = url.searchParams.get("subjectId");
  const gameId = url.searchParams.get("gameId");
  const difficulty = parseDifficulty(url.searchParams.get("difficulty"));

  if (!subjectId || !gameId || !difficulty) {
    return NextResponse.json(
      { error: "subjectId, gameId, and difficulty (1–3) required" },
      { status: 400 }
    );
  }

  const items = await listGameContent(subjectId, gameId, difficulty);
  return NextResponse.json({
    items: items.map((item) => ({
      id: String(item._id),
      subjectId: item.subjectId,
      gameId: item.gameId,
      difficulty: item.difficulty,
      itemType: item.itemType,
      data: item.data,
      sortOrder: item.sortOrder,
      active: item.active,
    })),
  });
}

export async function PUT(request: Request) {
  const gate = await requireAdmin();
  if (gate.error) return gate.error;

  try {
    const body = await request.json();
    const { subjectId, gameId, difficulty, items } = body;

    const diff = parseDifficulty(String(difficulty));
    if (!subjectId || !gameId || !diff) {
      return NextResponse.json(
        { error: "subjectId, gameId, and difficulty (1–3) required" },
        { status: 400 }
      );
    }

    const result = await replaceGameContent(subjectId, gameId, diff, items ?? body);
    return NextResponse.json({
      message: `Replaced content with ${result.inserted} item(s).`,
      ...result,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Replace failed" },
      { status: 400 }
    );
  }
}
