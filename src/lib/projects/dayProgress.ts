import type { DailyProjectPayload, ProjectDay, ProjectSlot } from "@/lib/projects/types";
import { PROJECT_SLOTS } from "@/lib/projects/types";

export const DAY_COOLDOWN_MS = 8 * 60 * 60 * 1000;

export function slotComplete(day: ProjectDay, slot: ProjectSlot): boolean {
  if (slot === "math") return !!day.mathCompletedAt;
  if (slot === "hebrew") return !!day.hebrewCompletedAt;
  return !!day.englishCompletedAt;
}

export function daySlotsDone(day: ProjectDay): number {
  return PROJECT_SLOTS.filter((slot) => slotComplete(day, slot)).length;
}

export function isDayFullyComplete(day: ProjectDay): boolean {
  return daySlotsDone(day) === PROJECT_SLOTS.length;
}

export function dayCompletedAt(day: ProjectDay): Date | null {
  const times = [day.mathCompletedAt, day.hebrewCompletedAt, day.englishCompletedAt]
    .filter(Boolean)
    .map((value) => new Date(value as string).getTime());
  if (times.length !== PROJECT_SLOTS.length) return null;
  return new Date(Math.max(...times));
}

export function isWithinDayCooldown(completedAt: Date | null, now = Date.now()): boolean {
  if (!completedAt) return false;
  return now - completedAt.getTime() < DAY_COOLDOWN_MS;
}

/** True while the next day's tasks stay locked after finishing the previous day. */
export function isWaitingForNextDay(
  days: ProjectDay[],
  currentDay: number,
  now = Date.now()
): boolean {
  if (currentDay <= 1) return false;

  const prevDay = days.find((d) => d.dayNumber === currentDay - 1);
  if (!prevDay || !isDayFullyComplete(prevDay)) return false;

  const today = days.find((d) => d.dayNumber === currentDay);
  if (!today || daySlotsDone(today) > 0) return false;

  return isWithinDayCooldown(dayCompletedAt(prevDay), now);
}

export function projectDaysComplete(project: DailyProjectPayload): number {
  return project.days.filter(isDayFullyComplete).length;
}

export function projectSlotsComplete(project: DailyProjectPayload): number {
  return project.days.reduce((sum, day) => sum + daySlotsDone(day), 0);
}

export function projectTotalSlots(project: DailyProjectPayload): number {
  return project.days.length * PROJECT_SLOTS.length;
}

export function projectProgressPercent(project: DailyProjectPayload): number {
  const total = projectTotalSlots(project);
  if (total === 0) return 0;
  return Math.round((projectSlotsComplete(project) / total) * 100);
}
