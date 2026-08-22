/**
 * Generates src/lib/data/division-riddles.ts (~100+ story riddles).
 * Run: npx tsx scripts/generate-division-riddles.ts
 */
import { writeFileSync } from "fs";
import { join } from "path";

type DivisionMode = "share" | "groups" | "symbol";
type Difficulty = 1 | 2 | 3;

interface ItemKind {
  emoji: string;
  en: string;
  he: string;
}

interface Template {
  mode: DivisionMode;
  minDifficulty: Difficulty;
  en: string;
  he: string;
}

const ITEMS: ItemKind[] = [
  { emoji: "🍬", en: "candies", he: "ממתקים" },
  { emoji: "🍪", en: "cookies", he: "עוגיות" },
  { emoji: "⭐", en: "stickers", he: "מדבקות" },
  { emoji: "🎈", en: "balloons", he: "בלונים" },
  { emoji: "🍎", en: "apples", he: "תפוחים" },
  { emoji: "🖍️", en: "crayons", he: "עפרונות" },
  { emoji: "🧸", en: "toys", he: "צעצועים" },
  { emoji: "⚽", en: "balls", he: "כדורים" },
];

const TEMPLATES: Template[] = [
  {
    mode: "share",
    minDifficulty: 1,
    en: "I have {total} {item}. I want to give the same amount to {groups} friends. How many does each friend get?",
    he: "יש לי {total} {itemHe}. אני רוצה לחלק ל-{groups} חברים — אותה כמות לכל אחד. כמה כל חבר מקבל?",
  },
  {
    mode: "share",
    minDifficulty: 1,
    en: "There are {total} {item} on the table. We put them on {groups} plates, the same on each. How many on each plate?",
    he: "יש {total} {itemHe} על השולחן. שמים אותם על {groups} צלחות — שווה בכל צלחת. כמה בכל צלחת?",
  },
  {
    mode: "share",
    minDifficulty: 1,
    en: "Milo has {total} {item}. He shares them equally with {groups} friends. How many for each?",
    he: "למיילו יש {total} {itemHe}. הוא מחלק ל-{groups} חברים — שווה בשווה. כמה לכל חבר?",
  },
  {
    mode: "share",
    minDifficulty: 1,
    en: "Grandma gave me {total} {item}. I split them equally between {groups} kids. How many does each kid get?",
    he: "סבתא נתנה לי {total} {itemHe}. אני מחלק/ת בין {groups} ילדים — שווה. כמה לכל ילד?",
  },
  {
    mode: "share",
    minDifficulty: 2,
    en: "Our class got {total} {item}. The teacher gives the same amount to {groups} groups. How many in each group?",
    he: "בכיתה קיבלנו {total} {itemHe}. המורה מחלקת ל-{groups} קבוצות — אותו מספר בכל קבוצה. כמה בכל קבוצה?",
  },
  {
    mode: "share",
    minDifficulty: 2,
    en: "At a birthday party there are {total} {item} for {groups} kids. Everyone gets the same. How many each?",
    he: "במסיבת יום הולדת יש {total} {itemHe} ל-{groups} ילדים. לכולם אותו דבר. כמה לכל אחד?",
  },
  {
    mode: "share",
    minDifficulty: 2,
    en: "I saved {total} {item}. Now I want to share them with {groups} friends fairly. How many for each friend?",
    he: "חסכתי {total} {itemHe}. עכשיו אני רוצה לחלק ל-{groups} חברים — הוגן. כמה לכל חבר?",
  },
  {
    mode: "share",
    minDifficulty: 2,
    en: "We picked {total} {item} in the garden. We divide them equally into {groups} baskets. How many in each basket?",
    he: "קטפנו {total} {itemHe} בגינה. מחלקים ל-{groups} סלים — שווה. כמה בכל סל?",
  },
  {
    mode: "share",
    minDifficulty: 3,
    en: "A pirate found {total} {item} and shares them with {groups} crew mates. Same for everyone! How many each?",
    he: "שודד ים מצא {total} {itemHe} ומחלק ל-{groups} אנשי צוות — שווה לכולם! כמה לכל אחד?",
  },
  {
    mode: "share",
    minDifficulty: 3,
    en: "There are {total} {item} and {groups} hungry friends. Split them equally — how many per friend?",
    he: "יש {total} {itemHe} ו-{groups} חברים רעבים. חולקים שווה — כמה לכל חבר?",
  },
  {
    mode: "groups",
    minDifficulty: 3,
    en: "I have {total} {item}. I put {size} in each bag. How many bags can I fill?",
    he: "יש לי {total} {itemHe}. שמתי {size} בכל שקית. כמה שקיות אפשר למלא?",
  },
  {
    mode: "groups",
    minDifficulty: 3,
    en: "We pack {size} {item} in each box. We have {total} {item} total. How many boxes?",
    he: "אנחנו שמים {size} {itemHe} בכל קופסה. יש {total} בסך הכל. כמה קופסאות?",
  },
  {
    mode: "groups",
    minDifficulty: 3,
    en: "Each team gets {size} {item}. There are {total} {item} altogether. How many teams?",
    he: "כל קבוצה מקבלת {size} {itemHe}. יש {total} בסך הכל. כמה קבוצות?",
  },
  {
    mode: "groups",
    minDifficulty: 3,
    en: "Milo puts {size} {item} on each plate. He has {total} {item}. How many plates?",
    he: "מיילו שם {size} {itemHe} על כל צלחת. יש לו {total}. כמה צלחות?",
  },
  {
    mode: "symbol",
    minDifficulty: 3,
    en: "Quick riddle: {total} ÷ {groups} = ?",
    he: "חידה מהירה: {total} ÷ {groups} = ?",
  },
  {
    mode: "symbol",
    minDifficulty: 3,
    en: "Math puzzle! Split {total} into {groups} equal parts. How big is each part?",
    he: "חידת חשבון! מחלקים {total} ל-{groups} חלקים שווים. מה גודל כל חלק?",
  },
];

function divisorsFor(difficulty: Difficulty): number[] {
  if (difficulty === 1) return [2];
  if (difficulty === 2) return [2, 3, 4];
  return [2, 3, 4, 5];
}

function maxQuotient(difficulty: Difficulty): number {
  return difficulty === 3 ? 6 : 5;
}

function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? `{${key}}`));
}

interface Riddle {
  id: string;
  mode: DivisionMode;
  minDifficulty: Difficulty;
  total: number;
  divisor: number;
  answer: number;
  emoji: string;
  textEn: string;
  textHe: string;
}

const riddles: Riddle[] = [];
const seen = new Set<string>();

for (const difficulty of [1, 2, 3] as Difficulty[]) {
  const divisors = divisorsFor(difficulty);
  const maxQ = maxQuotient(difficulty);

  for (const template of TEMPLATES) {
    if (template.minDifficulty > difficulty) continue;

    for (let itemIdx = 0; itemIdx < ITEMS.length; itemIdx++) {
      const item = ITEMS[itemIdx]!;

      if (template.mode === "groups") {
        for (const size of divisors) {
          for (let answer = 2; answer <= maxQ; answer++) {
            const total = size * answer;
            const key = `${template.mode}:${total}:${size}:${item.emoji}`;
            if (seen.has(key)) continue;
            seen.add(key);

            riddles.push({
              id: `d-${riddles.length + 1}`,
              mode: template.mode,
              minDifficulty: template.minDifficulty,
              total,
              divisor: size,
              answer,
              emoji: item.emoji,
              textEn: fill(template.en, {
                total,
                size,
                groups: answer,
                item: item.en,
                itemHe: item.he,
              }),
              textHe: fill(template.he, {
                total,
                size,
                groups: answer,
                item: item.en,
                itemHe: item.he,
              }),
            });
          }
        }
        continue;
      }

      for (const groups of divisors) {
        for (let answer = 2; answer <= maxQ; answer++) {
          const total = groups * answer;
          const key = `${template.mode}:${total}:${groups}:${item.emoji}`;
          if (seen.has(key)) continue;
          seen.add(key);

          riddles.push({
            id: `d-${riddles.length + 1}`,
            mode: template.mode,
            minDifficulty: template.minDifficulty,
            total,
            divisor: groups,
            answer,
            emoji: item.emoji,
            textEn: fill(template.en, {
              total,
              groups,
              size: groups,
              item: item.en,
              itemHe: item.he,
            }),
            textHe: fill(template.he, {
              total,
              groups,
              size: groups,
              item: item.en,
              itemHe: item.he,
            }),
          });
        }
      }
    }
  }
}

// Trim to ~120 well-spread riddles per difficulty band for gameplay variety
function pickSpread(pool: Riddle[], target: number): Riddle[] {
  if (pool.length <= target) return pool;
  const step = pool.length / target;
  const out: Riddle[] = [];
  for (let i = 0; i < target; i++) {
    out.push(pool[Math.floor(i * step)]!);
  }
  return out;
}

const byDiff = (d: Difficulty) => riddles.filter((r) => r.minDifficulty <= d && r.mode !== "symbol" || (d === 3));
const easy = pickSpread(riddles.filter((r) => r.minDifficulty === 1), 35);
const medium = pickSpread(
  riddles.filter((r) => r.minDifficulty <= 2 && !easy.includes(r)),
  35
);
const hard = pickSpread(
  riddles.filter((r) => !easy.includes(r) && !medium.includes(r)),
  35
);

const final = [...easy, ...medium, ...hard];
// Re-id sequentially
final.forEach((r, i) => {
  r.id = `d-${i + 1}`;
});

const outPath = join(process.cwd(), "src/lib/data/division-riddles.ts");
const body = `/** Auto-generated by scripts/generate-division-riddles.ts — do not edit by hand. */
export type DivisionRiddleMode = "share" | "groups" | "symbol";

export interface DivisionRiddle {
  id: string;
  mode: DivisionRiddleMode;
  minDifficulty: 1 | 2 | 3;
  total: number;
  divisor: number;
  answer: number;
  emoji: string;
  textEn: string;
  textHe: string;
}

export const DIVISION_RIDDLES: DivisionRiddle[] = ${JSON.stringify(final, null, 2)} as DivisionRiddle[];

export function divisionRiddlesForDifficulty(difficulty: 1 | 2 | 3): DivisionRiddle[] {
  return DIVISION_RIDDLES.filter((r) => r.minDifficulty <= difficulty);
}
`;

writeFileSync(outPath, body);
console.log(`Wrote ${final.length} riddles to ${outPath}`);
