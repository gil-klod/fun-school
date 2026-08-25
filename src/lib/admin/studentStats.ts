import {
  APP_TIMEZONE,
  calendarDaysAgo,
  dateKeyInTimeZone,
  isWithinRollingDays,
} from "@/lib/admin/activityDates";
import { connectDB } from "@/lib/db";
import { DailyProject, type IDailyProject } from "@/models/DailyProject";
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
  lastPlayedLabel: string | null;
  lastPlayedDetail: string | null;
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

interface ProgressLean {
  studentId?: unknown;
  userId?: unknown;
  correct?: number;
  wrong?: number;
  status?: string;
  lastPlayedAt?: Date | string;
}

interface StudentLean {
  _id: unknown;
  userId: unknown;
  name: string;
  age: number;
  createdAt: Date | string;
}

function accuracy(correct: number, wrong: number) {
  const total = correct + wrong;
  return total === 0 ? 0 : Math.round((correct / total) * 100);
}

function idStr(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value === "string") return value;
  if (typeof value === "object" && value !== null && "toString" in value) {
    return (value as { toString(): string }).toString();
  }
  return String(value);
}

function maxDate(a: Date | null, b: Date | null): Date | null {
  if (!a) return b;
  if (!b) return a;
  return a.getTime() >= b.getTime() ? a : b;
}

function aggregateProgressRecords(records: ProgressLean[]) {
  let lastPlayedAt: Date | null = null;
  let totalCorrect = 0;
  let totalWrong = 0;
  let gamesWithActivity = 0;
  let completedGames = 0;

  for (const record of records) {
    const correct = Number(record.correct ?? 0);
    const wrong = Number(record.wrong ?? 0);
    totalCorrect += correct;
    totalWrong += wrong;

    if (correct + wrong > 0) {
      gamesWithActivity += 1;
      if (record.lastPlayedAt) {
        lastPlayedAt = maxDate(lastPlayedAt, new Date(record.lastPlayedAt));
      }
    }

    if (record.status === "completed") {
      completedGames += 1;
    }
  }

  return { lastPlayedAt, totalCorrect, totalWrong, gamesWithActivity, completedGames };
}

function projectLastActivity(project: IDailyProject): Date | null {
  let latest: Date | null = project.updatedAt ? new Date(project.updatedAt) : null;

  for (const day of project.days ?? []) {
    for (const key of ["mathCompletedAt", "hebrewCompletedAt", "englishCompletedAt"] as const) {
      const value = day[key];
      if (value) {
        latest = maxDate(latest, new Date(value));
      }
    }
  }

  return latest;
}

/** Assign progress rows to students, including legacy userId-only saves. */
function buildProgressByStudent(students: StudentLean[], allProgress: ProgressLean[]) {
  const studentsByUser = new Map<string, StudentLean[]>();
  for (const student of students) {
    const userId = idStr(student.userId);
    if (!userId) continue;
    const list = studentsByUser.get(userId) ?? [];
    list.push(student);
    studentsByUser.set(userId, list);
  }

  const byStudent = new Map<string, ProgressLean[]>();

  const append = (studentId: string, record: ProgressLean) => {
    const list = byStudent.get(studentId) ?? [];
    list.push(record);
    byStudent.set(studentId, list);
  };

  for (const record of allProgress) {
    const studentId = idStr(record.studentId);
    if (studentId) {
      append(studentId, record);
      continue;
    }

    const userId = idStr(record.userId);
    if (!userId) continue;

    const owned = studentsByUser.get(userId) ?? [];
    if (owned.length === 1) {
      append(idStr(owned[0]._id)!, record);
    }
  }

  return byStudent;
}

function formatLastPlayed(lastPlayedAt: Date | null) {
  if (!lastPlayedAt) {
    return { lastPlayedLabel: null, lastPlayedDetail: null, daysSinceLastPlay: null };
  }

  const iso = lastPlayedAt.toISOString();
  const daysSinceLastPlay = calendarDaysAgo(lastPlayedAt, new Date(), APP_TIMEZONE);
  const detail = lastPlayedAt.toLocaleString("he-IL", {
    timeZone: APP_TIMEZONE,
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  let lastPlayedLabel: string;
  if (daysSinceLastPlay === 0) lastPlayedLabel = "Today";
  else if (daysSinceLastPlay === 1) lastPlayedLabel = "Yesterday";
  else if (daysSinceLastPlay < 7) lastPlayedLabel = `${daysSinceLastPlay} days ago`;
  else lastPlayedLabel = lastPlayedAt.toLocaleDateString("he-IL", { timeZone: APP_TIMEZONE });

  return { lastPlayedLabel, lastPlayedDetail: detail, daysSinceLastPlay, iso };
}

export async function getAdminStudentStats(activeDays = 7) {
  await connectDB();

  const [students, allProgress, projects] = await Promise.all([
    Student.find().lean() as Promise<StudentLean[]>,
    GameProgress.find().lean() as Promise<ProgressLean[]>,
    DailyProject.find().select("studentId status currentDay totalDays days updatedAt").lean(),
  ]);

  const userIds = [...new Set(students.map((s) => idStr(s.userId)).filter(Boolean))] as string[];
  const users = await User.find({ _id: { $in: userIds } })
    .select("name email createdAt")
    .lean();
  const userMap = new Map(users.map((u) => [u._id.toString(), u]));
  const progressByStudent = buildProgressByStudent(students, allProgress);
  const projectMap = new Map(projects.map((p) => [p.studentId.toString(), p]));

  const now = Date.now();
  const cutoffReg7 = now - 7 * 86_400_000;
  const reg7DayKey = dateKeyInTimeZone(new Date(cutoffReg7), APP_TIMEZONE);

  let activeLast7Days = 0;
  let activeLast30Days = 0;
  let neverPlayed = 0;
  let registeredLast7Days = 0;

  const rows: AdminStudentRow[] = students.map((student) => {
    const studentId = idStr(student._id)!;
    const user = userMap.get(idStr(student.userId) ?? "");
    const records = progressByStudent.get(studentId) ?? [];
    const project = projectMap.get(studentId);

    const aggregated = aggregateProgressRecords(records);
    const projectActivity = project ? projectLastActivity(project as IDailyProject) : null;
    const lastPlayedAt = maxDate(aggregated.lastPlayedAt, projectActivity);

    const totalCorrect = aggregated.totalCorrect;
    const totalWrong = aggregated.totalWrong;
    const hasPlayed = totalCorrect + totalWrong > 0;

    if (!hasPlayed) neverPlayed += 1;

    const lastIso = hasPlayed && lastPlayedAt ? lastPlayedAt.toISOString() : null;
    if (lastIso) {
      if (isWithinRollingDays(lastIso, activeDays, now)) activeLast7Days += 1;
      if (isWithinRollingDays(lastIso, 30, now)) activeLast30Days += 1;
    }

    const studentCreated = new Date(student.createdAt);
    if (dateKeyInTimeZone(studentCreated, APP_TIMEZONE) >= reg7DayKey) {
      registeredLast7Days += 1;
    }

    const formatted = hasPlayed && lastPlayedAt ? formatLastPlayed(lastPlayedAt) : null;

    return {
      studentId,
      studentName: student.name,
      age: student.age,
      parentName: user?.name ?? "—",
      parentEmail: user?.email ?? "—",
      registeredAt: studentCreated.toISOString(),
      parentRegisteredAt: user?.createdAt ? new Date(user.createdAt).toISOString() : null,
      lastPlayedAt: formatted?.iso ?? null,
      lastPlayedLabel: formatted?.lastPlayedLabel ?? null,
      lastPlayedDetail: formatted?.lastPlayedDetail ?? null,
      daysSinceLastPlay: formatted?.daysSinceLastPlay ?? null,
      isActive: lastIso ? isWithinRollingDays(lastIso, activeDays, now) : false,
      hasPlayed,
      totalCorrect,
      totalWrong,
      accuracy: accuracy(totalCorrect, totalWrong),
      gamesWithActivity: aggregated.gamesWithActivity,
      completedGames: aggregated.completedGames,
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

  return {
    summary: {
      totalStudents: students.length,
      totalParents: userIds.length,
      activeLast7Days,
      activeLast30Days,
      neverPlayed,
      registeredLast7Days,
    },
    students: rows,
    activeDays,
    timeZone: APP_TIMEZONE,
  };
}
