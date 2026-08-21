export interface DemoQuestion {
  id: string;
  subjectId: string;
  gameId: string;
  promptEn: string;
  promptHe: string;
  /** Large visual — emoji, math, or scrambled letters */
  display: string;
  displayDir?: "ltr" | "rtl";
  options: string[];
  answer: string;
  optionsDir?: "ltr" | "rtl";
}

/** Five fixed demo questions — one from each of five different games. */
export const HOME_DEMO_QUESTIONS: DemoQuestion[] = [
  {
    id: "vocab",
    subjectId: "english-beginners",
    gameId: "vocabulary",
    promptEn: "What is this in English?",
    promptHe: "מה זה באנגלית?",
    display: "🦁",
    options: ["Lion", "Tiger", "Bear", "Elephant"],
    answer: "Lion",
    optionsDir: "ltr",
  },
  {
    id: "colors",
    subjectId: "english-beginners",
    gameId: "colors-numbers",
    promptEn: "What is this?",
    promptHe: "מה זה?",
    display: "🍎",
    options: ["Apple", "Banana", "Grape", "Bread"],
    answer: "Apple",
    optionsDir: "ltr",
  },
  {
    id: "multiply",
    subjectId: "math",
    gameId: "multiplication",
    promptEn: "What is the answer?",
    promptHe: "מה התשובה?",
    display: "3 × 4 = ?",
    options: ["7", "10", "12", "15"],
    answer: "12",
    optionsDir: "ltr",
  },
  {
    id: "scramble",
    subjectId: "hebrew",
    gameId: "scramble",
    promptEn: "Unscramble the letters — what word is this?",
    promptHe: "סדרו את האותיות — מה המילה?",
    display: "בלכ",
    displayDir: "rtl",
    options: ["כלב", "חתול", "סוס", "פרה"],
    answer: "כלב",
    optionsDir: "rtl",
  },
  {
    id: "mystery",
    subjectId: "math",
    gameId: "mystery",
    promptEn: "Danny has 5 apples. He gets 3 more. How many apples does he have?",
    promptHe: "לדני יש 5 תפוחים. הוא מקבל עוד 3. כמה תפוחים יש לו?",
    display: "🍎 + 🍎 = ?",
    options: ["6", "7", "8", "9"],
    answer: "8",
    optionsDir: "ltr",
  },
];
