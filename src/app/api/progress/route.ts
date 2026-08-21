import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { requireOwnedStudent } from "@/lib/students/server";
import { GameProgress } from "@/models/GameProgress";
import { computeAnalytics } from "@/lib/analytics";

async function resolveStudentId(request: Request, userId: string): Promise<string | null> {
  const url = new URL(request.url);
  const studentId = url.searchParams.get("studentId");
  if (!studentId) return null;
  const owned = await requireOwnedStudent(studentId, userId);
  return owned ? studentId : null;
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const studentId = await resolveStudentId(request, session.user.id);
  if (!studentId) {
    return NextResponse.json({ error: "studentId required" }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const subjectId = searchParams.get("subjectId");
  const gameId = searchParams.get("gameId");
  const difficultyParam = searchParams.get("difficulty");

  if (subjectId && gameId) {
    const query: Record<string, unknown> = {
      studentId,
      subjectId,
      gameId,
    };
    if (difficultyParam) {
      const d = Number(difficultyParam);
      if ([1, 2, 3].includes(d)) query.difficulty = d;
    } else {
      query.difficulty = 2;
    }

    const progress = await GameProgress.findOne(query);
    return NextResponse.json({ progress });
  }

  const all = await GameProgress.find({ studentId }).sort({ lastPlayedAt: -1 });
  return NextResponse.json({ progresses: all });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { studentId, subjectId, gameId, difficulty, score, streak, round, correct, wrong, state, status } =
      body;

    if (!studentId || !subjectId || !gameId) {
      return NextResponse.json({ error: "studentId, subjectId and gameId required" }, { status: 400 });
    }

    const owned = await requireOwnedStudent(String(studentId), session.user.id);
    if (!owned) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const diff = [1, 2, 3].includes(Number(difficulty)) ? Number(difficulty) : 2;

    await connectDB();

    const progress = await GameProgress.findOneAndUpdate(
      { studentId, subjectId, gameId, difficulty: diff },
      {
        difficulty: diff,
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

    await computeAnalytics(studentId);

    return NextResponse.json({ progress });
  } catch (err) {
    console.error("Progress save error:", err);
    return NextResponse.json({ error: "Failed to save progress" }, { status: 500 });
  }
}
