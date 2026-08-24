import { connectDB } from "@/lib/db";
import { DailyProject } from "@/models/DailyProject";
import { GameProgress } from "@/models/GameProgress";
import { Student } from "@/models/Student";
import { User } from "@/models/User";

export interface AdminStudentRow {
  studentId: string;
  studentName: string;
  age: number;
  parentName: string;
  parentEmail: string;
  registeredAt: string;
  parentRegisteredAt: string | null;
  lastPlayedAt: string | null;
  daysSinceLastPlay: number | null;
  isActive: boolean;
  hasPlayed: boolean;
  totalCorrect: number;
  totalWrong: number;
  accuracy: number;
  gamesWithActivity: number;
  completedGames: number;
  projectStatus: "none" | "active" | "completed";
  projectDay: number | null;
  projectTotalDays: number | null;
}

export interface AdminStudentStatsSummary {
  totalStudents: number;
  totalParents: number;
  activeLast7Days: number;
  activeLast30Days: number;
  neverPlayed: number;
  registeredLast7Days: number;
}

interface ProgressAggRow {
  _id: unknown;
  lastPlayedAt?: Date;
  totalCorrect: number;
  totalWrong: number;
  gamesWithActivity: number;
  completedGames: number;
}

const MS_DAY = 86_400_000;

function accuracy(correct: number, wrong: number) {
  const total = correct + wrong;
  return total === 0 ? 0 : Math.round((correct / total) * 100);
}

export async function getAdminStudentStats(activeDays = 7) {
  await connectDB();

  const [students, progressAgg, projects] = await Promise.all([
    Student.find().lean(),
    GameProgress.aggregate<ProgressAggRow>([
      {
        $group: {
          _id: "$studentId",
          lastPlayedAt: { $max: "$lastPlayedAt" },
          totalCorrect: { $sum: "$correct" },
          totalWrong: { $sum: "$wrong" },
          gamesWithActivity: {
            $sum: {
              $cond: [{ $gt: [{ $add: ["$correct", "$wrong"] }, 0] }, 1, 0],
            },
          },
          completedGames: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
        },
      },
    ]),
    DailyProject.find().select("studentId status currentDay totalDays").lean(),
  ]);

  const userIds = [...new Set(students.map((s) => s.userId.toString()))];
  const users = await User.find({ _id: { $in: userIds } })
    .select("name email createdAt")
    .lean();
  const userMap = new Map(users.map((u) => [u._id.toString(), u]));
  const progressMap = new Map(progressAgg.map((p) => [String(p._id), p]));
  const projectMap = new Map(projects.map((p) => [p.studentId.toString(), p]));

  const now = Date.now();
  const cutoffActive = now - activeDays * MS_DAY;
  const cutoff30 = now - 30 * MS_DAY;
  const cutoffReg7 = now - 7 * MS_DAY;

  let activeLast7Days = 0;
  let activeLast30Days = 0;
  let neverPlayed = 0;
  let registeredLast7Days = 0;

  const rows: AdminStudentRow[] = students.map((student) => {
    const user = userMap.get(student.userId.toString());
    const prog = progressMap.get(student._id.toString());
    const project = projectMap.get(student._id.toString());

    const lastPlayedAt = prog?.lastPlayedAt ? new Date(prog.lastPlayedAt) : null;
    const totalCorrect = prog?.totalCorrect ?? 0;
    const totalWrong = prog?.totalWrong ?? 0;
    const hasPlayed = totalCorrect + totalWrong > 0;

    if (!hasPlayed) neverPlayed += 1;
    if (lastPlayedAt) {
      const ts = lastPlayedAt.getTime();
      if (ts >= cutoffActive) activeLast7Days += 1;
      if (ts >= cutoff30) activeLast30Days += 1;
    }

    const studentCreated = new Date(student.createdAt);
    if (studentCreated.getTime() >= cutoffReg7) registeredLast7Days += 1;

    const daysSinceLastPlay = lastPlayedAt
      ? Math.floor((now - lastPlayedAt.getTime()) / MS_DAY)
      : null;

    return {
      studentId: student._id.toString(),
      studentName: student.name,
      age: student.age,
      parentName: user?.name ?? "—",
      parentEmail: user?.email ?? "—",
      registeredAt: studentCreated.toISOString(),
      parentRegisteredAt: user?.createdAt ? new Date(user.createdAt).toISOString() : null,
      lastPlayedAt: lastPlayedAt?.toISOString() ?? null,
      daysSinceLastPlay,
      isActive: lastPlayedAt ? lastPlayedAt.getTime() >= cutoffActive : false,
      hasPlayed,
      totalCorrect,
      totalWrong,
      accuracy: accuracy(totalCorrect, totalWrong),
      gamesWithActivity: prog?.gamesWithActivity ?? 0,
      completedGames: prog?.completedGames ?? 0,
      projectStatus: project ? project.status : "none",
      projectDay: project?.currentDay ?? null,
      projectTotalDays: project?.totalDays ?? null,
    };
  });

  rows.sort((a, b) => {
    if (a.lastPlayedAt && b.lastPlayedAt) {
      return new Date(b.lastPlayedAt).getTime() - new Date(a.lastPlayedAt).getTime();
    }
    if (a.lastPlayedAt) return -1;
    if (b.lastPlayedAt) return 1;
    return a.studentName.localeCompare(b.studentName, "he");
  });

  const summary: AdminStudentStatsSummary = {
    totalStudents: students.length,
    totalParents: userIds.length,
    activeLast7Days,
    activeLast30Days,
    neverPlayed,
    registeredLast7Days,
  };

  return { summary, students: rows, activeDays };
}
