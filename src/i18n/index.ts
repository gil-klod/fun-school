import { he } from "./he";
import { en } from "./en";
import type { Dictionary, Locale } from "./types";

export const dictionaries: Record<Locale, Dictionary> = { he, en };

export function getNestedValue(obj: unknown, path: string): string | undefined {
  const keys = path.split(".");
  let current: unknown = obj;
  for (const key of keys) {
    if (current == null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return typeof current === "string" ? current : undefined;
}

export function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, key) => String(params[key] ?? `{${key}}`));
}

export function translate(
  locale: Locale,
  key: string,
  params?: Record<string, string | number>
): string {
  const dict = dictionaries[locale];
  const value = getNestedValue(dict, key);
  if (value) return interpolate(value, params);
  // Fallback to English
  const fallback = getNestedValue(dictionaries.en, key);
  return fallback ? interpolate(fallback, params) : key;
}

export function getSubjectTitle(locale: Locale, subjectId: string): string {
  return dictionaries[locale].subjects[subjectId]?.title ?? subjectId;
}

export function getGameTitle(locale: Locale, subjectId: string, gameId: string): string {
  return dictionaries[locale].subjects[subjectId]?.games[gameId]?.title ?? gameId;
}

export function getGameDescription(locale: Locale, subjectId: string, gameId: string): string {
  return dictionaries[locale].subjects[subjectId]?.games[gameId]?.description ?? "";
}
