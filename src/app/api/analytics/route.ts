import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { requireOwnedStudent } from "@/lib/students/server";
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

  try {
    const analytics = await computeAnalytics(studentId, session.user.id);
    return NextResponse.json({ analytics });
  } catch (err) {
    console.error("Analytics GET error:", err);
    return NextResponse.json({ error: "Failed to load analytics" }, { status: 500 });
  }
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
  try {
    const analytics = await computeAnalytics(studentId, session.user.id);
    return NextResponse.json({ analytics });
  } catch (err) {
    console.error("Analytics POST error:", err);
    return NextResponse.json({ error: "Failed to refresh analytics" }, { status: 500 });
  }
}
