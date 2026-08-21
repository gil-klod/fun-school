import type { ShukItem } from "./shuk-items";
import { SHUK_ITEMS } from "./shuk-items";

export interface MultiplicationQuestion {
  a: number;
  b: number;
}

export type { ShukItem };
export { SHUK_ITEMS };

export function getShukItemName(item: ShukItem, locale: "he" | "en"): string {
  return locale === "he" ? item.nameHe : item.name;
}

export const TABLES = [2, 3, 4, 5, 10] as const;

export function generateMultiplication(table?: number): MultiplicationQuestion {
  const t = table ?? TABLES[Math.floor(Math.random() * TABLES.length)];
  const b = Math.floor(Math.random() * 9) + 1;
  return { a: t, b };
}

export function generateShukChallenge() {
  const count = Math.floor(Math.random() * 2) + 2;
  const shuffled = [...SHUK_ITEMS].sort(() => Math.random() - 0.5);
  const items = shuffled.slice(0, count);
  const total = items.reduce((sum, item) => sum + item.price, 0);
  const paid = total + (Math.floor(Math.random() * 3) + 1) * 5;
  return { items, total, paid, change: paid - total };
}

export interface MysteryQuestion {
  text: string;
  textHe: string;
  answer: number;
  hint: string;
  hintHe: string;
}

export interface MysteryTemplate {
  text: string;
  textHe: string;
  hint: string;
  hintHe: string;
  op: "multiply" | "add" | "subtract" | "divide" | "double" | "half" | "multiply_add";
  minDifficulty?: 1 | 2 | 3;
}

export const MYSTERY_TEMPLATES: MysteryTemplate[] = [
  {
    op: "multiply",
    minDifficulty: 1,
    text: "I multiplied a number by {n} and got {result}. What is the number?",
    textHe: "הכפלתי מספר ב-{n} וקיבלתי {result}. מה המספר?",
    hint: "Divide {result} by {n}",
    hintHe: "חלק {result} ב-{n}",
  },
  {
    op: "add",
    minDifficulty: 1,
    text: "I added {n} to a number and got {result}. What is the number?",
    textHe: "הוספתי {n} למספר וקיבלתי {result}. מה המספר?",
    hint: "Subtract {n} from {result}",
    hintHe: "חסר {n} מ-{result}",
  },
  {
    op: "subtract",
    minDifficulty: 1,
    text: "I subtracted {n} from a number and got {result}. What is the number?",
    textHe: "חיסרתי {n} ממספר וקיבלתי {result}. מה המספר?",
    hint: "Add {n} to {result}",
    hintHe: "הוסף {n} ל-{result}",
  },
  {
    op: "add",
    minDifficulty: 1,
    text: "Danny had some candies. He got {n} more. Now he has {result}. How many did he start with?",
    textHe: "לדני היו ממתקים. הוא קיבל עוד {n}. עכשיו יש לו {result}. כמה היו לו בהתחלה?",
    hint: "Subtract {n} from {result}",
    hintHe: "חסר {n} מ-{result}",
  },
  {
    op: "subtract",
    minDifficulty: 1,
    text: "There were some balls in the classroom. {n} went outside to play. {result} stayed inside. How many were there at first?",
    textHe: "בכיתה היו כדורים. {n} יצאו לשחק בחצר. {result} נשארו בפנים. כמה כדורים היו בהתחלה?",
    hint: "Add {n} to {result}",
    hintHe: "הוסף {n} ל-{result}",
  },
  {
    op: "multiply",
    minDifficulty: 1,
    text: "Each row has {n} chairs. There are {result} chairs in all. How many rows?",
    textHe: "בכל שורה {n} כיסאות. יש בסך הכל {result} כיסאות. כמה שורות?",
    hint: "Divide {result} by {n}",
    hintHe: "חלק {result} ב-{n}",
  },
  {
    op: "divide",
    minDifficulty: 2,
    text: "I divided a number by {n} and got {result}. What is the number?",
    textHe: "חילקתי מספר ב-{n} וקיבלתי {result}. מה המספר?",
    hint: "Multiply {result} by {n}",
    hintHe: "הכפל {result} ב-{n}",
  },
  {
    op: "divide",
    minDifficulty: 2,
    text: "Maya shared cookies equally among {n} friends. Each friend got {result}. How many cookies did Maya have?",
    textHe: "מאיה חילקה עוגיות בין {n} חברים. כל אחד קיבל {result}. כמה עוגיות היו לה?",
    hint: "Multiply {result} by {n}",
    hintHe: "הכפל {result} ב-{n}",
  },
  {
    op: "double",
    minDifficulty: 2,
    text: "I doubled a number and got {result}. What was the number?",
    textHe: "הכפלתי מספר ב-2 וקיבלתי {result}. מה המספר?",
    hint: "Divide {result} by 2",
    hintHe: "חלק {result} ב-2",
  },
  {
    op: "half",
    minDifficulty: 2,
    text: "Half of a number is {result}. What is the number?",
    textHe: "חצי ממספר הוא {result}. מה המספר?",
    hint: "Multiply {result} by 2",
    hintHe: "הכפל {result} ב-2",
  },
  {
    op: "subtract",
    minDifficulty: 2,
    text: "A library had some books. {n} books were borrowed. {result} books remain. How many books were there?",
    textHe: "בספרייה היו ספרים. {n} ספרים הושאלו. נשארו {result}. כמה ספרים היו?",
    hint: "Add {n} to {result}",
    hintHe: "הוסף {n} ל-{result}",
  },
  {
    op: "multiply",
    minDifficulty: 2,
    text: "Every pack has {n} stickers. In total there are {result} stickers. How many packs?",
    textHe: "בכל חבילה {n} מדבקות. יש בסך הכל {result} מדבקות. כמה חבילות?",
    hint: "Divide {result} by {n}",
    hintHe: "חלק {result} ב-{n}",
  },
  {
    op: "multiply_add",
    minDifficulty: 3,
    text: "I thought of a number, multiplied it by {n}, added {m}, and got {result}. What is the number?",
    textHe: "חשבתי על מספר, הכפלתי אותו ב-{n}, הוספתי {m}, ויצא {result}. מה המספר?",
    hint: "Subtract {m} from {result}, then divide by {n}",
    hintHe: "חסר {m} מ-{result}, ואז חלק ב-{n}",
  },
  {
    op: "divide",
    minDifficulty: 3,
    text: "A farmer packed eggs into {n} boxes. Each box had {result} eggs. How many eggs in total?",
    textHe: "חקלאי סידר ביצים ב-{n} ארגזים. בכל ארגז היו {result} ביצים. כמה ביצים בסך הכל?",
    hint: "Multiply {result} by {n}",
    hintHe: "הכפל {result} ב-{n}",
  },
];

export function getMysteryText(question: MysteryQuestion, locale: "he" | "en"): string {
  return locale === "he" ? question.textHe : question.text;
}

export function getMysteryHint(question: MysteryQuestion, locale: "he" | "en"): string {
  return locale === "he" ? (question.hintHe ?? question.hint) : question.hint;
}

export function generateWrongAnswers(correct: number, count = 3): number[] {
  const wrong = new Set<number>();
  while (wrong.size < count) {
    const offset = Math.floor(Math.random() * 10) - 5;
    const candidate = correct + (offset === 0 ? 1 : offset);
    if (candidate > 0 && candidate !== correct) wrong.add(candidate);
  }
  return Array.from(wrong);
}

export function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function buildOptions(correct: number, count = 3): number[] {
  return shuffleArray([correct, ...generateWrongAnswers(correct, count)]);
}
