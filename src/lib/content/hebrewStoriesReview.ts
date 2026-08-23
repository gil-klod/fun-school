import type { HebrewStory } from "@/lib/data/hebrew";
import { HEBREW_STORIES_BY_LEVEL } from "@/lib/data/hebrew-stories";

export type HebrewStoriesReviewStatus = "good" | "bad";

export const HEBREW_STORIES_REVIEW_STORAGE_KEY = "fun-school-hebrew-stories-review";

export type HebrewStoryLevel = 1 | 2 | 3;

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

export function exportBadStories(
  rows: HebrewStoriesReviewRow[],
  reviews: Record<string, HebrewStoriesReviewStatus>
): HebrewStoriesReviewRow[] {
  return rows.filter((row) => reviews[row.key] === "bad");
}
