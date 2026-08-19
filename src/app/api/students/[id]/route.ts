import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { requireOwnedStudent, serializeStudent } from "@/lib/students/server";
import { Student } from "@/models/Student";
import type { EnglishSubjectId } from "@/models/Student";
import { DailyProject } from "@/models/DailyProject";
import { GameProgress } from "@/models/GameProgress";
import { UserAnalytics } from "@/models/UserAnalytics";

function isEnglishSubjectId(value: unknown): value is EnglishSubjectId {
  return value === "english-beginners" || value === "english-natives";
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const student = await requireOwnedStudent(id, session.user.id);
  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  try {
    const { englishSubjectId } = await request.json();
    if (!isEnglishSubjectId(englishSubjectId)) {
      return NextResponse.json({ error: "Invalid englishSubjectId" }, { status: 400 });
    }

    await connectDB();
    await Student.updateOne({ _id: id }, { englishSubjectId });
    student.englishSubjectId = englishSubjectId;

    return NextResponse.json({ student: serializeStudent(student) });
  } catch (err) {
    console.error("Update student error:", err);
    return NextResponse.json({ error: "Failed to update student" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const student = await requireOwnedStudent(id, session.user.id);
  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  await connectDB();
  await Promise.all([
    GameProgress.deleteMany({ studentId: id }),
    UserAnalytics.deleteOne({ studentId: id }),
    DailyProject.deleteOne({ studentId: id }),
    Student.deleteOne({ _id: id }),
  ]);

  return NextResponse.json({ ok: true });
}
