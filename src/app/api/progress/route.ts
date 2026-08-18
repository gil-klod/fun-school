import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { GameProgress } from "@/models/GameProgress";
import { computeAnalytics } from "@/lib/analytics";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const { searchParams } = new URL(request.url);
  const subjectId = searchParams.get("subjectId");
  const gameId = searchParams.get("gameId");
  const recent = searchParams.get("recent");

  if (recent === "true") {
    const last = await GameProgress.findOne({
      userId: session.user.id,
      status: "in_progress",
    }).sort({ lastPlayedAt: -1 });

    return NextResponse.json({ progress: last });
  }

  if (subjectId && gameId) {
    const progress = await GameProgress.findOne({
      userId: session.user.id,
      subjectId,
      gameId,
    });
    return NextResponse.json({ progress });
  }

  const all = await GameProgress.find({ userId: session.user.id }).sort({ lastPlayedAt: -1 });
  return NextResponse.json({ progresses: all });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { subjectId, gameId, score, streak, round, correct, wrong, state, status } = body;

    if (!subjectId || !gameId) {
      return NextResponse.json({ error: "subjectId and gameId required" }, { status: 400 });
    }

    await connectDB();

    const progress = await GameProgress.findOneAndUpdate(
      { userId: session.user.id, subjectId, gameId },
      {
        score: score ?? 0,
        streak: streak ?? 0,
        round: round ?? 1,
        correct: correct ?? 0,
        wrong: wrong ?? 0,
        state: state ?? {},
        status: status ?? "in_progress",
        lastPlayedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    // Refresh analytics in background (don't block save)
    computeAnalytics(session.user.id).catch(console.error);

    return NextResponse.json({ progress });
  } catch (err) {
    console.error("Progress save error:", err);
    return NextResponse.json({ error: "Failed to save progress" }, { status: 500 });
  }
}
