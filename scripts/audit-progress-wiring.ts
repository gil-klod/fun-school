/**
 * Static audit: every game answer handler must use recordAnswerAndSave (not stale progress.save stats).
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.join(__dirname, "..", "src");

const GAME_FILES = [
  "app/hebrew/fix-sentence/page.tsx",
  "app/hebrew/comprehension/page.tsx",
  "app/hebrew/scramble/page.tsx",
  "app/math/multiplication/page.tsx",
  "app/math/mystery/page.tsx",
  "app/math/shuk/page.tsx",
  "app/english-beginners/vocabulary/page.tsx",
  "app/english-beginners/sentences/page.tsx",
  "app/english-beginners/colors-numbers/page.tsx",
  "app/english-natives/comprehension/page.tsx",
  "components/QuizGame.tsx",
];

const BAD_PATTERNS = [
  /progress\.score \+/,
  /correct: progress\.correct \+/,
  /wrong: progress\.wrong \+/,
  /markCompleted\(\);\s*\n\s*progress\.save\(\{\s*\n\s*state:.*status: "completed"/s,
  /progress\.setCorrect\(\(c\) => c \+ 1\)/,
];

let failed = 0;
for (const rel of GAME_FILES) {
  const file = path.join(ROOT, rel);
  const src = fs.readFileSync(file, "utf8");
  if (!src.includes("recordAnswerAndSave")) {
    console.error(`FAIL ${rel}: missing recordAnswerAndSave`);
    failed += 1;
    continue;
  }
  for (const pattern of BAD_PATTERNS) {
    if (pattern.test(src)) {
      console.error(`FAIL ${rel}: matched stale pattern ${pattern}`);
      failed += 1;
    }
  }
  if (!failed) console.log(`OK  ${rel}`);
}

const hook = fs.readFileSync(path.join(ROOT, "hooks/useGameProgress.ts"), "utf8");
if (/score,\s*\n\s*streak,\s*\n\s*round,\s*\n\s*correct,\s*\n\s*wrong,\s*\n\s*gameState/.test(hook)) {
  console.error("FAIL useGameProgress.ts: markCompleted still copies React state");
  failed += 1;
} else {
  console.log("OK  useGameProgress.ts markCompleted uses latest.current only");
}

if (failed > 0) {
  process.exit(1);
}
console.log(`\nAll ${GAME_FILES.length + 1} cross-game progress wiring checks passed.`);
