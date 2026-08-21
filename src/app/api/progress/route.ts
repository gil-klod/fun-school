import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { requireOwnedStudent } from "@/lib/students/server";
import { toStudentObjectId } from "@/lib/students/objectId";
import { GameProgress } from "@/models/GameProgress";
import { listGameProgressForStudent, saveGameProgress } from "@/lib/progressServer";
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

  const studentObjectId = toStudentObjectId(studentId);
  if (!studentObjectId) {
    return NextResponse.json({ error: "Invalid studentId" }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const subjectId = searchParams.get("subjectId");
  const gameId = searchParams.get("gameId");
  const difficultyParam = searchParams.get("difficulty");

  if (subjectId && gameId) {
    const query: Record<string, unknown> = {
      studentId: studentObjectId,
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

  const all = await listGameProgressForStudent(studentId, session.user.id);
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

    const studentObjectId = toStudentObjectId(String(studentId));
    if (!studentObjectId) {
      return NextResponse.json({ error: "Invalid studentId" }, { status: 400 });
    }

    const diff = ([1, 2, 3].includes(Number(difficulty)) ? Number(difficulty) : 2) as 1 | 2 | 3;

    await connectDB();

    const progress = await saveGameProgress({
      studentId: String(studentId),
      userId: session.user.id,
      subjectId,
      gameId,
      difficulty: diff,
      score: Number(score ?? 0),
      streak: Number(streak ?? 0),
      round: Number(round ?? 1),
      correct: Number(correct ?? 0),
      wrong: Number(wrong ?? 0),
      state: (state ?? {}) as Record<string, unknown>,
      status: status === "completed" ? "completed" : "in_progress",
    });

    try {
      await computeAnalytics(String(studentId), session.user.id);
    } catch (analyticsErr) {
      console.error("Analytics compute failed after progress save:", analyticsErr);
    }

    return NextResponse.json({ progress });
  } catch (err) {
    console.error("Progress save error:", err);
    return NextResponse.json({ error: "Failed to save progress" }, { status: 500 });
  }
}
