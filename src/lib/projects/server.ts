import type { IDailyProject, IProjectDay } from "@/models/DailyProject";
import type { IStudent } from "@/models/Student";
import { DailyProject } from "@/models/DailyProject";
import { connectDB } from "@/lib/db";
import {
  DEFAULT_PROJECT_DAYS,
  DEFAULT_PROJECT_DIFFICULTY,
  buildProjectDays,
  defaultProjectName,
} from "@/lib/projects/defaultProject";
import {
  daySlotsDone,
  isWaitingForNextDay,
} from "@/lib/projects/dayProgress";
import type { EnglishSubjectId, ProjectDay, ProjectSlot } from "@/lib/projects/types";
import { PROJECT_SLOTS } from "@/lib/projects/types";

export function defaultEnglishSubjectForAge(age: number): EnglishSubjectId {
  return age >= 10 ? "english-natives" : "english-beginners";
}

export function serializeProject(project: IDailyProject) {
  return {
    id: project._id.toString(),
    studentId: project.studentId.toString(),
    name: project.name,
    totalDays: project.totalDays,
    difficulty: project.difficulty,
    currentDay: project.currentDay,
    status: project.status,
    days: project.days.map((day) => ({
      dayNumber: day.dayNumber,
      math: { gameId: day.math.gameId, random: day.math.random },
      hebrew: { gameId: day.hebrew.gameId, random: day.hebrew.random },
      english: { gameId: day.english.gameId, random: day.english.random },
      mathCompletedAt: day.mathCompletedAt?.toISOString() ?? null,
      hebrewCompletedAt: day.hebrewCompletedAt?.toISOString() ?? null,
      englishCompletedAt: day.englishCompletedAt?.toISOString() ?? null,
    })),
  };
}

export async function createDefaultProject(
  student: IStudent,
  name?: string
): Promise<IDailyProject> {
  await connectDB();
  const englishSubjectId = student.englishSubjectId ?? defaultEnglishSubjectForAge(student.age);
  const days = buildProjectDays(student._id.toString(), DEFAULT_PROJECT_DAYS, englishSubjectId);
  return DailyProject.create({
    studentId: student._id,
    name: name ?? defaultProjectName("he"),
    totalDays: DEFAULT_PROJECT_DAYS,
    difficulty: DEFAULT_PROJECT_DIFFICULTY,
    currentDay: 1,
    status: "active",
    days,
  });
}

export async function getOrCreateProject(student: IStudent): Promise<IDailyProject> {
  await connectDB();
  let project = await DailyProject.findOne({ studentId: student._id });
  if (!project) {
    project = await createDefaultProject(student);
  }
  return project;
}

function isDayComplete(day: IProjectDay): boolean {
  return !!(day.mathCompletedAt && day.hebrewCompletedAt && day.englishCompletedAt);
}

function slotCompletedAt(day: IDailyProject["days"][0], slot: ProjectSlot): Date | null | undefined {
  if (slot === "math") return day.mathCompletedAt;
  if (slot === "hebrew") return day.hebrewCompletedAt;
  return day.englishCompletedAt;
}

export async function completeProjectSlot(
  projectId: string,
  studentId: string,
  dayNumber: number,
  slot: ProjectSlot
): Promise<IDailyProject | null> {
  await connectDB();
  const project = await DailyProject.findOne({ _id: projectId, studentId });
  if (!project || project.status === "completed") return null;

  const day = project.days.find((d: IProjectDay) => d.dayNumber === dayNumber);
  if (!day) return null;

  const projectDays = project.days.map((d: IProjectDay) => ({
    dayNumber: d.dayNumber,
    math: d.math,
    hebrew: d.hebrew,
    english: d.english,
    mathCompletedAt: d.mathCompletedAt?.toISOString() ?? null,
    hebrewCompletedAt: d.hebrewCompletedAt?.toISOString() ?? null,
    englishCompletedAt: d.englishCompletedAt?.toISOString() ?? null,
  }));

  if (
    dayNumber === project.currentDay &&
    daySlotsDone(projectDays.find((d: ProjectDay) => d.dayNumber === dayNumber)!) === 0 &&
    isWaitingForNextDay(projectDays, project.currentDay)
  ) {
    return null;
  }

  const now = new Date();
  if (slot === "math" && !day.mathCompletedAt) day.mathCompletedAt = now;
  if (slot === "hebrew" && !day.hebrewCompletedAt) day.hebrewCompletedAt = now;
  if (slot === "english" && !day.englishCompletedAt) day.englishCompletedAt = now;

  if (isDayComplete(day)) {
    if (project.currentDay === dayNumber && project.currentDay < project.totalDays) {
      project.currentDay = dayNumber + 1;
    }
    if (
      project.currentDay >= project.totalDays &&
      project.days.every((d: IProjectDay) => isDayComplete(d))
    ) {
      project.status = "completed";
    }
  }

  project.markModified("days");
  await project.save();
  return project;
}

export function restoreDefaultProject(
  student: IStudent,
  locale: "en" | "he" = "he"
): Promise<IDailyProject> {
  const englishSubjectId = student.englishSubjectId ?? defaultEnglishSubjectForAge(student.age);
  const days = buildProjectDays(student._id.toString(), DEFAULT_PROJECT_DAYS, englishSubjectId);
  return DailyProject.findOneAndUpdate(
    { studentId: student._id },
    {
      name: defaultProjectName(locale),
      totalDays: DEFAULT_PROJECT_DAYS,
      difficulty: DEFAULT_PROJECT_DIFFICULTY,
      currentDay: 1,
      status: "active",
      days,
    },
    { upsert: true, new: true }
  ).then((doc) => doc!);
}

export function applyProjectUpdate(
  project: IDailyProject,
  input: {
    name?: string;
    totalDays?: number;
    days?: ProjectDay[];
  },
  student: IStudent
): void {
  if (input.name?.trim()) project.name = input.name.trim();

  if (input.totalDays && input.totalDays !== project.totalDays) {
    const englishSubjectId = student.englishSubjectId ?? defaultEnglishSubjectForAge(student.age);
    project.totalDays = input.totalDays;
    project.days = buildProjectDays(
      student._id.toString(),
      input.totalDays,
      englishSubjectId
    ) as unknown as IProjectDay[];
    project.currentDay = 1;
    project.status = "active";
  } else if (input.days) {
    project.days = input.days.map((d) => ({
      dayNumber: d.dayNumber,
      math: { gameId: d.math.gameId, random: d.math.random },
      hebrew: { gameId: d.hebrew.gameId, random: d.hebrew.random },
      english: { gameId: d.english.gameId, random: d.english.random },
      mathCompletedAt: d.mathCompletedAt ? new Date(d.mathCompletedAt) : null,
      hebrewCompletedAt: d.hebrewCompletedAt ? new Date(d.hebrewCompletedAt) : null,
      englishCompletedAt: d.englishCompletedAt ? new Date(d.englishCompletedAt) : null,
    })) as IProjectDay[];
  }

  if (project.currentDay > project.totalDays) {
    project.currentDay = project.totalDays;
  }
}

export function isSlotComplete(project: IDailyProject, dayNumber: number, slot: ProjectSlot): boolean {
  const day = project.days.find((d: IProjectDay) => d.dayNumber === dayNumber);
  if (!day) return false;
  return !!slotCompletedAt(day, slot);
}

export { PROJECT_SLOTS };
