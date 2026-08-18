export interface MultiplicationQuestion {
  a: number;
  b: number;
}

export const TABLES = [2, 3, 4, 5, 10] as const;

export function generateMultiplication(table?: number): MultiplicationQuestion {
  const t = table ?? TABLES[Math.floor(Math.random() * TABLES.length)];
  const b = Math.floor(Math.random() * 9) + 1;
  return { a: t, b };
}

export interface ShukItem {
  name: string;
  nameHe: string;
  price: number;
  emoji: string;
}

export function getShukItemName(item: ShukItem, locale: "he" | "en"): string {
  return locale === "he" ? item.nameHe : item.name;
}

export const SHUK_ITEMS: ShukItem[] = [
  { name: "Apple", nameHe: "תפוח", price: 3, emoji: "🍎" },
  { name: "Bread", nameHe: "לחם", price: 8, emoji: "🍞" },
  { name: "Juice", nameHe: "מיץ", price: 6, emoji: "🧃" },
  { name: "Banana", nameHe: "בננה", price: 2, emoji: "🍌" },
  { name: "Cookie", nameHe: "עוגייה", price: 4, emoji: "🍪" },
  { name: "Water", nameHe: "מים", price: 5, emoji: "💧" },
  { name: "Orange", nameHe: "תפוז", price: 3, emoji: "🍊" },
  { name: "Chips", nameHe: "חטיף", price: 7, emoji: "🥔" },
];

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

export const MYSTERY_TEMPLATES: Omit<MysteryQuestion, "answer">[] = [
  {
    text: "I multiplied a number by {n} and got {result}. What is the number?",
    textHe: "הכפלתי מספר ב-{n} וקיבלתי {result}. מה המספר?",
    hint: "Divide {result} by {n}",
    hintHe: "חלק {result} ב-{n}",
  },
  {
    text: "I added {n} to a number and got {result}. What is the number?",
    textHe: "הוספתי {n} למספר וקיבלתי {result}. מה המספר?",
    hint: "Subtract {n} from {result}",
    hintHe: "חסר {n} מ-{result}",
  },
  {
    text: "I subtracted {n} from a number and got {result}. What is the number?",
    textHe: "חיסרתי {n} ממספר וקיבלתי {result}. מה המספר?",
    hint: "Add {n} to {result}",
    hintHe: "הוסף {n} ל-{result}",
  },
];

export function getMysteryText(question: MysteryQuestion, locale: "he" | "en"): string {
  return locale === "he" ? question.textHe : question.text;
}

export function getMysteryHint(question: MysteryQuestion, locale: "he" | "en"): string {
  return locale === "he" ? (question.hintHe ?? question.hint) : question.hint;
}

export function generateMystery(): MysteryQuestion {
  const template = MYSTERY_TEMPLATES[Math.floor(Math.random() * MYSTERY_TEMPLATES.length)];
  const n = Math.floor(Math.random() * 8) + 2;
  let answer: number;
  let result: number;

  if (template.text.includes("multiplied")) {
    answer = Math.floor(Math.random() * 9) + 1;
    result = answer * n;
  } else if (template.text.includes("added")) {
    answer = Math.floor(Math.random() * 50) + 10;
    result = answer + n;
  } else {
    answer = Math.floor(Math.random() * 50) + 20;
    result = answer - n;
  }

  const fill = (s: string) => s.replace(/\{n\}/g, String(n)).replace(/\{result\}/g, String(result));

  return {
    text: fill(template.text),
    textHe: fill(template.textHe),
    answer,
    hint: fill(template.hint),
    hintHe: fill(template.hintHe),
  };
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
