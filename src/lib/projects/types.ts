import type { DifficultyLevel } from "@/lib/content/types";

export type ProjectSlot = "math" | "hebrew" | "english";
export type EnglishSubjectId = "english-beginners" | "english-natives";

export interface ProjectDaySlot {
  gameId: string;
  random: boolean;
}

export interface ProjectDay {
  dayNumber: number;
  math: ProjectDaySlot;
  hebrew: ProjectDaySlot;
  english: ProjectDaySlot;
  mathCompletedAt?: string | null;
  hebrewCompletedAt?: string | null;
  englishCompletedAt?: string | null;
}

export interface DailyProjectPayload {
  id: string;
  studentId: string;
  name: string;
  totalDays: number;
  difficulty: DifficultyLevel;
  currentDay: number;
  status: "active" | "completed";
  days: ProjectDay[];
}

export const PROJECT_SLOTS: ProjectSlot[] = ["math", "hebrew", "english"];
