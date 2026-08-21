import mongoose from "mongoose";
import { GameProgress } from "@/models/GameProgress";
import { toStudentObjectId } from "@/lib/students/objectId";

/** Load progress for a student, migrating legacy userId-only rows when present. */
export async function listGameProgressForStudent(studentId: string, userId: string) {
  const studentObjectId = toStudentObjectId(studentId);
  if (!studentObjectId) return [];

  const userObjectId = mongoose.Types.ObjectId.isValid(userId)
    ? new mongoose.Types.ObjectId(userId)
    : null;

  if (userObjectId) {
    await GameProgress.updateMany(
      { userId: userObjectId, studentId: { $exists: false } },
      { $set: { studentId: studentObjectId }, $unset: { userId: "" } }
    );
  }

  return GameProgress.find({ studentId: studentObjectId }).sort({ lastPlayedAt: -1 }).lean();
}
