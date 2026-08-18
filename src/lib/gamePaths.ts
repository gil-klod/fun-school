export const SUBJECT_BASE: Record<string, string> = {
  math: "/math",
  hebrew: "/hebrew",
  "english-beginners": "/english-beginners",
  "english-natives": "/english-natives",
};

export const GAME_PATHS: Record<string, Record<string, string>> = {
  math: { multiplication: "/multiplication", shuk: "/shuk", mystery: "/mystery" },
  hebrew: { scramble: "/scramble", "fix-sentence": "/fix-sentence", comprehension: "/comprehension" },
  "english-beginners": { vocabulary: "/vocabulary", sentences: "/sentences", "colors-numbers": "/colors-numbers" },
  "english-natives": { grammar: "/grammar", vocabulary: "/vocabulary", comprehension: "/comprehension" },
};

export function getGameHref(subjectId: string, gameId: string): string {
  const base = SUBJECT_BASE[subjectId];
  if (!base) return "/";
  return base + (GAME_PATHS[subjectId]?.[gameId] ?? "");
}
