import { connectDB } from "@/lib/db";
import type { EnglishSubjectId } from "@/models/Student";
import { Student, type IStudent } from "@/models/Student";

export async function requireOwnedStudent(
  studentId: string,
  userId: string
): Promise<IStudent | null> {
  await connectDB();
  return Student.findOne({ _id: studentId, userId });
}

export function serializeStudent(student: IStudent) {
  return {
    id: student._id.toString(),
    name: student.name,
    age: student.age,
    gender: student.gender,
    avatar: student.avatar,
    englishSubjectId: (student.englishSubjectId ?? "english-beginners") as EnglishSubjectId,
    createdAt: student.createdAt,
  };
}
