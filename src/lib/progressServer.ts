import mongoose from "mongoose";
import { GameProgress } from "@/models/GameProgress";
import { Student } from "@/models/Student";
import { toStudentObjectId } from "@/lib/students/objectId";

let indexesEnsured = false;

export async function ensureGameProgressIndexes() {
  if (indexesEnsured) return;
  await connectIndexes();
}

async function connectIndexes() {
  try {
    const indexes = await GameProgress.collection.indexes();
    for (const index of indexes) {
      const keys = Object.keys(index.key ?? {});
      if (keys.includes("userId") && !keys.includes("studentId") && index.name) {
        try {
          await GameProgress.collection.dropIndex(index.name);
        } catch {
          // Index may already be gone.
        }
      }
    }
    await GameProgress.syncIndexes();
  } catch (err) {
    console.error("GameProgress index sync failed:", err);
  } finally {
    indexesEnsured = true;
  }
}

export interface SaveGameProgressInput {
  studentId: string;
  userId: string;
  subjectId: string;
  gameId: string;
  difficulty: 1 | 2 | 3;
  score: number;
  streak: number;
  round: number;
  correct: number;
  wrong: number;
  state: Record<string, unknown>;
  status: "in_progress" | "completed";
}

export async function saveGameProgress(input: SaveGameProgressInput) {
  await ensureGameProgressIndexes();

  const studentObjectId = toStudentObjectId(input.studentId);
  const userObjectId = toStudentObjectId(input.userId);
  if (!studentObjectId || !userObjectId) {
    throw new Error("Invalid student or user id");
  }

  const payload = {
    studentId: studentObjectId,
    subjectId: input.subjectId,
    gameId: input.gameId,
    difficulty: input.difficulty,
    score: input.score,
    streak: input.streak,
    round: input.round,
    correct: input.correct,
    wrong: input.wrong,
    state: input.state,
    status: input.status,
    lastPlayedAt: new Date(),
  };

  // Upgrade old account-level rows (userId only) from before student profiles.
  const legacy = await GameProgress.findOneAndUpdate(
    {
      userId: userObjectId,
      subjectId: input.subjectId,
      gameId: input.gameId,
      studentId: { $exists: false },
    },
    { $set: payload, $unset: { userId: "" } },
    { new: true }
  );
  if (legacy) return legacy;

  return GameProgress.findOneAndUpdate(
    {
      studentId: studentObjectId,
      subjectId: input.subjectId,
      gameId: input.gameId,
      difficulty: input.difficulty,
    },
    payload,
    { upsert: true, new: true }
  );
}

/** Load progress for a student, including legacy userId-only rows for single-student accounts. */
export async function listGameProgressForStudent(studentId: string, userId: string) {
  await ensureGameProgressIndexes();

  const studentObjectId = toStudentObjectId(studentId);
  const userObjectId = toStudentObjectId(userId);
  if (!studentObjectId || !userObjectId) return [];

  const owned = await Student.findOne({ _id: studentObjectId, userId: userObjectId }).lean();
  if (!owned) return [];

  const studentCount = await Student.countDocuments({ userId: userObjectId });
  if (studentCount === 1) {
    await GameProgress.updateMany(
      { userId: userObjectId, studentId: { $exists: false } },
      { $set: { studentId: studentObjectId }, $unset: { userId: "" } }
    );
  }

  const byStudent = await GameProgress.find({ studentId: studentObjectId }).sort({ lastPlayedAt: -1 }).lean();
  if (byStudent.length > 0 || studentCount !== 1) {
    return byStudent;
  }

  return GameProgress.find({ userId: userObjectId, studentId: { $exists: false } })
    .sort({ lastPlayedAt: -1 })
    .lean();
}
