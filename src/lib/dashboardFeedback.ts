type Translate = (key: string, params?: Record<string, string | number>) => string;

export function buildDashboardFeedback(
  t: Translate,
  strengths: string[],
  weaknesses: string[],
  hasSubjectStats: boolean
): string {
  if (!hasSubjectStats) {
    return t("dashboard.feedbackEmpty");
  }

  const parts: string[] = [];
  if (strengths.length > 0) {
    parts.push(t("dashboard.feedbackGreatIn", { list: strengths.join(", ") }));
  }
  if (weaknesses.length > 0) {
    parts.push(t("dashboard.feedbackPractice", { list: weaknesses.join(", ") }));
  }
  if (parts.length === 0) {
    parts.push(t("dashboard.feedbackProgress"));
  }
  return parts.join(" ");
}

export function buildDashboardRecommendations(t: Translate, weaknesses: string[]): string[] {
  if (weaknesses.length === 0) {
    return [t("dashboard.recTryNew"), t("dashboard.recStreak")];
  }
  return weaknesses.map((game) => t("dashboard.recPractice", { game }));
}
