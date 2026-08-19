/**
 * Adds titleNikud + textNikud to all Hebrew comprehension stories via Dicta Nakdan.
 * Run: npx tsx scripts/generate-hebrew-story-nikud.ts
 */
import { writeFileSync } from "fs";
import { join } from "path";
import { vocalize } from "dicta-nakdan";
import { HEBREW_STORIES_EASY } from "../src/lib/data/hebrew-stories/easy";
import { HEBREW_STORIES_MEDIUM } from "../src/lib/data/hebrew-stories/medium";
import { HEBREW_STORIES_HARD } from "../src/lib/data/hebrew-stories/hard";
import type { HebrewStory } from "../src/lib/data/hebrew";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function vocalizeText(text: string): Promise<string> {
  const pointed = await vocalize(text, { genre: "modern" });
  return pointed.replace(/\|/g, "");
}

async function addNikud(stories: HebrewStory[]): Promise<HebrewStory[]> {
  const out: HebrewStory[] = [];
  for (let i = 0; i < stories.length; i++) {
    const s = stories[i];
    process.stdout.write(`  [${i + 1}/${stories.length}] ${s.title.slice(0, 30)}...\n`);
    const titleNikud = await vocalizeText(s.title);
    await sleep(400);
    const textNikud = await vocalizeText(s.text);
    await sleep(400);
    out.push({ ...s, titleNikud, textNikud });
  }
  return out;
}

function escapeStr(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
}

function storyToTs(s: HebrewStory, indent: string): string {
  const lines: string[] = [`${indent}{`, `${indent}  title: "${escapeStr(s.title)}",`];
  if (s.titleNikud) lines.push(`${indent}  titleNikud: "${escapeStr(s.titleNikud)}",`);
  lines.push(`${indent}  text: "${escapeStr(s.text)}",`);
  if (s.textNikud) lines.push(`${indent}  textNikud: "${escapeStr(s.textNikud)}",`);
  lines.push(`${indent}  questions: [`);
  for (const q of s.questions) {
    const opts = q.options.map((o) => `"${escapeStr(o)}"`).join(", ");
    lines.push(
      `${indent}    { question: "${escapeStr(q.question)}", options: [${opts}], correctIndex: ${q.correctIndex} },`
    );
  }
  lines.push(`${indent}  ],`, `${indent}},`);
  return lines.join("\n");
}

function writeStoriesFile(
  path: string,
  exportName: string,
  comment: string,
  stories: HebrewStory[]
) {
  const body = stories.map((s) => storyToTs(s, "  ")).join("\n");
  const content = `import type { HebrewStory } from "../hebrew";

${comment}
export const ${exportName}: HebrewStory[] = [
${body}
];
`;
  writeFileSync(path, content, "utf-8");
}

async function main() {
  console.log("Generating nikud for EASY (15)...");
  const easy = await addNikud(HEBREW_STORIES_EASY);
  console.log("Generating nikud for MEDIUM (15)...");
  const medium = await addNikud(HEBREW_STORIES_MEDIUM);
  console.log("Generating nikud for HARD (15)...");
  const hard = await addNikud(HEBREW_STORIES_HARD);

  const base = join(process.cwd(), "src/lib/data/hebrew-stories");
  writeStoriesFile(
    join(base, "easy.ts"),
    "HEBREW_STORIES_EASY",
    "/** Level 1 — short stories (~4–5 sentences), 3 questions each */",
    easy
  );
  writeStoriesFile(
    join(base, "medium.ts"),
    "HEBREW_STORIES_MEDIUM",
    "/** Level 2 — medium stories (~6–7 sentences), 3–4 questions each */",
    medium
  );
  writeStoriesFile(
    join(base, "hard.ts"),
    "HEBREW_STORIES_HARD",
    "/** Level 3 — longer stories (~8–10 sentences), 4 questions each */",
    hard
  );
  console.log("Done — all 45 stories now have titleNikud + textNikud.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
