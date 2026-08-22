import type { ColorNumberQuestion } from "@/lib/data/english-colors-numbers";
import { ENGLISH_COLORS_NUMBERS } from "@/lib/data/english-colors-numbers";

export type ColorsNumbersReviewStatus = "good" | "bad";

export const COLORS_NUMBERS_REVIEW_STORAGE_KEY = "fun-school-colors-numbers-review";

export function colorsNumbersQuestionKey(item: Pick<ColorNumberQuestion, "type" | "answer">): string {
  return `${item.type}::${item.answer}`;
}

export interface ColorsNumbersReviewRow extends ColorNumberQuestion {
  key: string;
  index: number;
}

export function getColorsNumbersReviewRows(): ColorsNumbersReviewRow[] {
  return ENGLISH_COLORS_NUMBERS.map((item, index) => ({
    ...item,
    key: colorsNumbersQuestionKey(item),
    index: index + 1,
  }));
}

export function exportBadQuestions(
  rows: ColorsNumbersReviewRow[],
  reviews: Record<string, ColorsNumbersReviewStatus>
): ColorsNumbersReviewRow[] {
  return rows.filter((row) => reviews[row.key] === "bad");
}
