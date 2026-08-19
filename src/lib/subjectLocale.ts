import type { Locale } from "@/i18n/types";
import type { EnglishSubjectId } from "@/lib/projects/types";

/** UI/content locale for a subject regardless of global app language. */
export function subjectContentLocale(subjectId: string): Locale | null {
  if (subjectId === "hebrew") return "he";
  if (subjectId === "english-natives") return "en";
  return null;
}

export function projectSlotContentLocale(
  slot: "math" | "hebrew" | "english",
  englishSubjectId: EnglishSubjectId
): Locale | null {
  if (slot === "hebrew") return "he";
  if (slot === "english" && englishSubjectId === "english-natives") return "en";
  return null;
}

/** Milo + route-aware content locale (Hebrew games, advanced English). */
export function effectiveContentLocale(pathname: string, globalLocale: Locale): Locale {
  if (pathname.startsWith("/hebrew")) return "he";
  if (pathname.startsWith("/english-natives")) return "en";
  return globalLocale;
}
