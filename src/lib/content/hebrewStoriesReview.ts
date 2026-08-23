import type { HebrewStory } from "@/lib/data/hebrew";
import { HEBREW_STORIES_BY_LEVEL } from "@/lib/data/hebrew-stories";

export type HebrewStoriesReviewStatus = "good" | "bad";

export const HEBREW_STORIES_REVIEW_STORAGE_KEY = "fun-school-hebrew-stories-review";

export type HebrewStoryLevel = 1 | 2 | 3;

export interface HebrewStoryReviewEntry {
  status?: HebrewStoriesReviewStatus;
  issue?: string;
}

export type HebrewStoriesReviewMap = Record<string, HebrewStoryReviewEntry>;

export interface HebrewStoryExportItem {
  key: string;
  level: HebrewStoryLevel;
  index: number;
  title: string;
  status?: HebrewStoriesReviewStatus;
  issue: string;
}

export function hebrewStoryKey(level: HebrewStoryLevel, title: string): string {
  return `${level}::${title}`;
}

export interface HebrewStoriesReviewRow extends HebrewStory {
  key: string;
  level: HebrewStoryLevel;
  index: number;
  questionCount: number;
  hasNikud: boolean;
}

export function getHebrewStoriesReviewRows(): HebrewStoriesReviewRow[] {
  const rows: HebrewStoriesReviewRow[] = [];
  let index = 0;

  for (const level of [1, 2, 3] as HebrewStoryLevel[]) {
    for (const story of HEBREW_STORIES_BY_LEVEL[level]) {
      index += 1;
      rows.push({
        ...story,
        key: hebrewStoryKey(level, story.title),
        level,
        index,
        questionCount: story.questions.length,
        hasNikud: Boolean(story.titleNikud && story.textNikud),
      });
    }
  }

  return rows;
}

/** Supports legacy storage where values were plain "good" | "bad". */
export function parseHebrewStoriesReviewMap(raw: string | null): HebrewStoriesReviewMap {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const map: HebrewStoriesReviewMap = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (value === "good" || value === "bad") {
        map[key] = { status: value };
        continue;
      }
      if (value && typeof value === "object") {
        const entry = value as HebrewStoryReviewEntry;
        map[key] = {
          status: entry.status,
          issue: typeof entry.issue === "string" ? entry.issue : undefined,
        };
      }
    }
    return map;
  } catch {
    return {};
  }
}

export function exportStoriesForFix(
  rows: HebrewStoriesReviewRow[],
  reviews: HebrewStoriesReviewMap
): HebrewStoryExportItem[] {
  return rows
    .filter((row) => {
      const entry = reviews[row.key];
      const issue = entry?.issue?.trim() ?? "";
      return entry?.status === "bad" || issue.length > 0;
    })
    .map((row) => {
      const entry = reviews[row.key];
      return {
        key: row.key,
        level: row.level,
        index: row.index,
        title: row.title,
        status: entry?.status,
        issue: entry?.issue?.trim() ?? "",
      };
    });
}
