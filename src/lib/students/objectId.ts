import mongoose from "mongoose";

export function toStudentObjectId(studentId: string): mongoose.Types.ObjectId | null {
  if (!mongoose.Types.ObjectId.isValid(studentId)) return null;
  return new mongoose.Types.ObjectId(studentId);
}
