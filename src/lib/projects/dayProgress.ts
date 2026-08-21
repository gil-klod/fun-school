import type { ProjectDay, ProjectSlot } from "@/lib/projects/types";
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
