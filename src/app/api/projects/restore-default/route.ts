import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { requireOwnedStudent } from "@/lib/students/server";
import { restoreDefaultProject, serializeProject } from "@/lib/projects/server";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { studentId, locale } = (await request.json()) as {
      studentId?: string;
      locale?: "en" | "he";
    };

    if (!studentId) {
      return NextResponse.json({ error: "studentId required" }, { status: 400 });
    }

    const student = await requireOwnedStudent(studentId, session.user.id);
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const project = await restoreDefaultProject(student, locale === "en" ? "en" : "he");
    return NextResponse.json({ project: serializeProject(project) });
  } catch (err) {
    console.error("Restore project error:", err);
    return NextResponse.json({ error: "Failed to restore default project" }, { status: 500 });
  }
}
