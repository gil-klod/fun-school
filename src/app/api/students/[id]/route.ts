import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { requireOwnedStudent } from "@/lib/students/server";
import { Student } from "@/models/Student";
import { GameProgress } from "@/models/GameProgress";
import { UserAnalytics } from "@/models/UserAnalytics";

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
    Student.deleteOne({ _id: id }),
  ]);

  return NextResponse.json({ ok: true });
}
