import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { requireOwnedStudent } from "@/lib/students/server";
import { UserAnalytics } from "@/models/UserAnalytics";
import { computeAnalytics } from "@/lib/analytics";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const studentId = url.searchParams.get("studentId");
  if (!studentId) {
    return NextResponse.json({ error: "studentId required" }, { status: 400 });
  }

  const owned = await requireOwnedStudent(studentId, session.user.id);
  if (!owned) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  await connectDB();

  let analytics = await UserAnalytics.findOne({ studentId });
  if (!analytics) {
    analytics = await computeAnalytics(studentId);
  }

  return NextResponse.json({ analytics });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const studentId = url.searchParams.get("studentId");
  if (!studentId) {
    return NextResponse.json({ error: "studentId required" }, { status: 400 });
  }

  const owned = await requireOwnedStudent(studentId, session.user.id);
  if (!owned) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  await connectDB();
  const analytics = await computeAnalytics(studentId);
  return NextResponse.json({ analytics });
}
