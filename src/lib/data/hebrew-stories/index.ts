import type { HebrewStory } from "../hebrew";
import { HEBREW_STORIES_EASY } from "./easy";
import { HEBREW_STORIES_MEDIUM } from "./medium";
import { HEBREW_STORIES_HARD } from "./hard";

export const HEBREW_STORIES_BY_LEVEL: Record<1 | 2 | 3, HebrewStory[]> = {
  1: HEBREW_STORIES_EASY,
  2: HEBREW_STORIES_MEDIUM,
  3: HEBREW_STORIES_HARD,
};
