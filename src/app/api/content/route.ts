import { NextResponse } from "next/server";
import { fetchGameContentBundle } from "@/lib/content/seed";
import type { DifficultyLevel } from "@/lib/content/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const subjectId = searchParams.get("subjectId");
  const gameId = searchParams.get("gameId");
  const difficultyParam = searchParams.get("difficulty");

  if (!subjectId || !gameId) {
    return NextResponse.json({ error: "subjectId and gameId required" }, { status: 400 });
  }

  const difficulty = Number(difficultyParam) as DifficultyLevel;
  if (![1, 2, 3].includes(difficulty)) {
    return NextResponse.json({ error: "difficulty must be 1, 2, or 3" }, { status: 400 });
  }

  try {
    let content = await fetchGameContentBundle(subjectId, gameId, difficulty);
    if (!content && process.env.NODE_ENV === "development") {
      const { seedGameContent } = await import("@/lib/content/seed");
      await seedGameContent(false);
      content = await fetchGameContentBundle(subjectId, gameId, difficulty);
    }
    if (!content) {
      return NextResponse.json(
        { error: "Content not found. Run POST /api/seed to populate the database." },
        { status: 404 }
      );
    }
    return NextResponse.json({ content });
  } catch (err) {
    console.error("Content fetch error:", err);
    return NextResponse.json({ error: "Failed to load content" }, { status: 500 });
  }
}
