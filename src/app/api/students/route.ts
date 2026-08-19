import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { isUserGender } from "@/lib/gender";
import { createDefaultProject, defaultEnglishSubjectForAge } from "@/lib/projects/server";
import { isStudentAvatarId } from "@/lib/students/avatars";
import { serializeStudent } from "@/lib/students/server";
import { Student } from "@/models/Student";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const students = await Student.find({ userId: session.user.id }).sort({ createdAt: 1 });
  return NextResponse.json({ students: students.map(serializeStudent) });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, age, gender, avatar } = await request.json();
    const trimmedName = String(name ?? "").trim();
    const parsedAge = Number(age);

    if (!trimmedName || !Number.isInteger(parsedAge) || parsedAge < 4 || parsedAge > 14) {
      return NextResponse.json({ error: "Valid name and age (4–14) are required" }, { status: 400 });
    }

    if (!isUserGender(gender)) {
      return NextResponse.json({ error: "Gender is required" }, { status: 400 });
    }

    if (!isStudentAvatarId(avatar)) {
      return NextResponse.json({ error: "Avatar is required" }, { status: 400 });
    }

    await connectDB();
    const englishSubjectId = defaultEnglishSubjectForAge(parsedAge);
    const student = await Student.create({
      userId: session.user.id,
      name: trimmedName,
      age: parsedAge,
      gender,
      avatar,
      englishSubjectId,
    });

    await createDefaultProject(student);

    return NextResponse.json({ student: serializeStudent(student) }, { status: 201 });
  } catch (err) {
    console.error("Create student error:", err);
    return NextResponse.json({ error: "Failed to create student" }, { status: 500 });
  }
}
