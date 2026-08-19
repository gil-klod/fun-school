import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { requireOwnedStudent } from "@/lib/students/server";
import {
  applyProjectUpdate,
  getOrCreateProject,
  serializeProject,
} from "@/lib/projects/server";
import { DailyProject } from "@/models/DailyProject";
import type { ProjectDay } from "@/lib/projects/types";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get("studentId");
  if (!studentId) {
    return NextResponse.json({ error: "studentId required" }, { status: 400 });
  }

  const student = await requireOwnedStudent(studentId, session.user.id);
  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  const project = await getOrCreateProject(student);
  return NextResponse.json({ project: serializeProject(project) });
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { studentId, name, totalDays, days } = body as {
      studentId?: string;
      name?: string;
      totalDays?: number;
      days?: ProjectDay[];
    };

    if (!studentId) {
      return NextResponse.json({ error: "studentId required" }, { status: 400 });
    }

    const student = await requireOwnedStudent(studentId, session.user.id);
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const project = await getOrCreateProject(student);

    if (totalDays !== undefined) {
      const parsed = Number(totalDays);
      if (!Number.isInteger(parsed) || parsed < 1 || parsed > 60) {
        return NextResponse.json({ error: "totalDays must be 1–60" }, { status: 400 });
      }
    }

    applyProjectUpdate(project, { name, totalDays, days }, student);
    const updated = await DailyProject.findByIdAndUpdate(project._id, {
      name: project.name,
      totalDays: project.totalDays,
      difficulty: project.difficulty,
      currentDay: project.currentDay,
      status: project.status,
      days: project.days,
    }, { new: true });

    return NextResponse.json({ project: serializeProject(updated!) });
  } catch (err) {
    console.error("Update project error:", err);
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }
}
