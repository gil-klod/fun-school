import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { requireOwnedStudent } from "@/lib/students/server";
import { completeProjectSlot, serializeProject } from "@/lib/projects/server";
import { PROJECT_SLOTS } from "@/lib/projects/types";
import type { ProjectSlot } from "@/lib/projects/types";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { studentId, projectId, day, slot } = (await request.json()) as {
      studentId?: string;
      projectId?: string;
      day?: number;
      slot?: string;
    };

    if (!studentId || !projectId || !day || !slot) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    if (!PROJECT_SLOTS.includes(slot as ProjectSlot)) {
      return NextResponse.json({ error: "Invalid slot" }, { status: 400 });
    }

    const student = await requireOwnedStudent(studentId, session.user.id);
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const project = await completeProjectSlot(
      projectId,
      studentId,
      Number(day),
      slot as ProjectSlot
    );

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ project: serializeProject(project) });
  } catch (err) {
    console.error("Complete slot error:", err);
    return NextResponse.json({ error: "Failed to complete slot" }, { status: 500 });
  }
}
