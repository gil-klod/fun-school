import type { DailyProjectPayload, ProjectDay, ProjectSlot } from "@/lib/projects/types";
import { PROJECT_SLOTS } from "@/lib/projects/types";

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
