import { getGameTitle, getSubjectTitle } from "@/i18n";
import type { Locale } from "@/i18n/types";
import { getAllGames } from "@/lib/games";
import { subjects } from "@/lib/subjects";

export function subjectStrengthKey(subjectId: string): string {
  return `subject:${subjectId}`;
}

export function gameStrengthKey(subjectId: string, gameId: string): string {
  return `game:${subjectId}:${gameId}`;
}

export function parseAnalyticsKey(key: string): {
  type: "subject" | "game" | "legacy";
  subjectId?: string;
  gameId?: string;
  legacy?: string;
} {
  if (key.startsWith("subject:")) {
    return { type: "subject", subjectId: key.slice("subject:".length) };
  }
  if (key.startsWith("game:")) {
    const [, subjectId, gameId] = key.split(":");
    if (subjectId && gameId) return { type: "game", subjectId, gameId };
  }
  return { type: "legacy", legacy: key };
}

/** Resolve old English labels saved before keyed analytics. */
export function resolveLegacyAnalyticsLabel(label: string, locale: Locale): string | null {
  for (const subject of subjects) {
    if (subject.title === label || subject.titleHe === label) {
      return getSubjectTitle(locale, subject.id);
    }
  }
  for (const game of getAllGames()) {
    if (game.title === label || game.titleHe === label) {
      return getGameTitle(locale, game.subjectId, game.gameId);
    }
  }
  return null;
}

export function localizeAnalyticsKey(
  key: string,
  locale: Locale,
  subjectTitle: (id: string) => string,
  gameTitle: (subjectId: string, gameId: string) => string
): string {
  const parsed = parseAnalyticsKey(key);
  if (parsed.type === "subject" && parsed.subjectId) {
    return subjectTitle(parsed.subjectId);
  }
  if (parsed.type === "game" && parsed.subjectId && parsed.gameId) {
    return gameTitle(parsed.subjectId, parsed.gameId);
  }
  return resolveLegacyAnalyticsLabel(key, locale) ?? key;
}
