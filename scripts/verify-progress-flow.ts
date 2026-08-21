/**
 * Cross-system progress save verification (no DB required).
 * Simulates useGameProgress invariants: answer → save → complete → dashboard stats.
 */
import { buildStatsFromProgressRecords, hasAnsweredGames } from "../src/lib/progressStats";

type ProgressData = {
  score: number;
  streak: number;
  round: number;
  correct: number;
  wrong: number;
  state: Record<string, unknown>;
  status?: "in_progress" | "completed";
  difficulty?: number;
};

function emptyProgress(): ProgressData {
  return { score: 0, streak: 0, round: 1, correct: 0, wrong: 0, state: {}, status: "in_progress" };
}

function recordAnswer(latest: ProgressData, wasCorrect: boolean): ProgressData {
  const prev = latest;
  const nextStreak = wasCorrect ? prev.streak + 1 : 0;
  const points = wasCorrect ? 10 + prev.streak : 0;
  return {
    ...prev,
    score: wasCorrect ? prev.score + points : prev.score,
    streak: nextStreak,
    correct: prev.correct + (wasCorrect ? 1 : 0),
    wrong: prev.wrong + (wasCorrect ? 0 : 1),
  };
}

/** Old buggy markCompleted copied stale React state over latest.current */
function oldMarkCompleted(latest: ProgressData, staleReact: ProgressData): ProgressData {
  return { ...latest, ...staleReact, status: "completed" };
}

function newMarkCompleted(latest: ProgressData): ProgressData {
  return { ...latest, status: "completed" };
}

function simulateSerializedSaves(
  steps: Array<(latest: ProgressData) => ProgressData>
): ProgressData {
  let latest = emptyProgress();
  for (const step of steps) {
    latest = step(latest);
  }
  return latest;
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`FAIL: ${message}`);
  }
}

function testFirstSessionStatsNotWiped() {
  let latest = emptyProgress();
  latest = recordAnswer(latest, true);
  latest = recordAnswer(latest, true);
  latest = recordAnswer(latest, false);

  const staleReact = { ...emptyProgress(), correct: 0, wrong: 0, score: 0 };
  const buggy = oldMarkCompleted(latest, staleReact);
  assert(buggy.correct === 0 && buggy.wrong === 0, "old markCompleted must reproduce first-session wipe");

  const fixed = newMarkCompleted(latest);
  assert(fixed.correct === 2 && fixed.wrong === 1, "new markCompleted keeps answer counts");
  assert(fixed.score === 10 + 11, "new markCompleted keeps score");
  assert(fixed.status === "completed", "new markCompleted sets completed");
}

function testAllGamesPersistToDashboard() {
  const games = [
    { subjectId: "hebrew", gameId: "fix-sentence", correct: 8, wrong: 2, score: 95 },
    { subjectId: "hebrew", gameId: "comprehension", correct: 3, wrong: 0, score: 36 },
    { subjectId: "math", gameId: "multiplication", correct: 10, wrong: 0, score: 145 },
    { subjectId: "english-beginners", gameId: "vocabulary", correct: 7, wrong: 3, score: 80 },
  ];

  const records = games.map((g) => ({
    ...g,
    status: "completed",
    difficulty: 2,
    lastPlayedAt: new Date().toISOString(),
  }));

  const { subjectStats, gameStats } = buildStatsFromProgressRecords(records);
  assert(hasAnsweredGames(gameStats), "dashboard should detect answered games");
  assert(gameStats.length === 4, "each game appears in dashboard stats");
  assert(subjectStats.length === 3, "three subjects aggregated");

  const hebrew = subjectStats.find((s) => s.subjectId === "hebrew");
  assert(hebrew?.correct === 11 && hebrew?.wrong === 2, "hebrew fix-sentence + comprehension combined");
}

function testSerializedSaveOrder() {
  const final = simulateSerializedSaves([
    (l) => recordAnswer(l, true),
    (l) => recordAnswer(l, false),
    (l) => recordAnswer(l, true),
    newMarkCompleted,
  ]);
  assert(final.correct === 2 && final.wrong === 1, "serialized saves preserve all answers at completion");
}

function testFirstAnswerVisibleBeforeComplete() {
  let latest = emptyProgress();
  latest = recordAnswer(latest, true);
  assert(latest.correct === 1 && latest.status === "in_progress", "first answer saved before session end");
  const midStats = buildStatsFromProgressRecords([
    {
      subjectId: "hebrew",
      gameId: "fix-sentence",
      correct: latest.correct,
      wrong: latest.wrong,
      score: latest.score,
      status: "in_progress",
    },
  ]);
  assert(hasAnsweredGames(midStats.gameStats), "dashboard shows stats after first answer, not only second play");
}

const tests = [
  ["first session stats not wiped on complete", testFirstSessionStatsNotWiped],
  ["all games feed dashboard aggregation", testAllGamesPersistToDashboard],
  ["serialized save order", testSerializedSaveOrder],
  ["first answer visible before complete", testFirstAnswerVisibleBeforeComplete],
] as const;

let passed = 0;
for (const [name, fn] of tests) {
  fn();
  passed += 1;
  console.log(`OK  ${name}`);
}

console.log(`\n${passed}/${tests.length} cross-system progress checks passed.`);
