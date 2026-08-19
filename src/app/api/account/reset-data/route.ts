import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { Student } from "@/models/Student";
import { DailyProject } from "@/models/DailyProject";
import { GameProgress } from "@/models/GameProgress";
import { UserAnalytics } from "@/models/UserAnalytics";

/** Clear all game progress and analytics for every student on this account. */
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const students = await Student.find({ userId: session.user.id }).select("_id");
  const studentIds = students.map((s) => String(s._id));

  if (studentIds.length === 0) {
    return NextResponse.json({ ok: true, cleared: 0 });
  }

  const [progressResult, analyticsResult, projectResult] = await Promise.all([
    GameProgress.deleteMany({ studentId: { $in: studentIds } }),
    UserAnalytics.deleteMany({ studentId: { $in: studentIds } }),
    DailyProject.deleteMany({ studentId: { $in: studentIds } }),
  ]);

  return NextResponse.json({
    ok: true,
    students: studentIds.length,
    progressDeleted: progressResult.deletedCount ?? 0,
    analyticsDeleted: analyticsResult.deletedCount ?? 0,
  });
}
