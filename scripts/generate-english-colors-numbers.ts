/**
 * Generates src/lib/data/english-colors-numbers.ts — 150 beginner English quiz items.
 *
 * Run from repo root:
 *   npx tsx scripts/generate-english-colors-numbers.ts
 */
import { writeFileSync } from "fs";
import { join } from "path";

type Category =
  | "color"
  | "number"
  | "shape"
  | "food"
  | "vehicle"
  | "animal"
  | "body"
  | "clothing"
  | "school"
  | "weather"
  | "home"
  | "sport";

type ItemDef = {
  type: Category;
  answer: string;
  emoji: string;
};

const EXPECTED_COUNT = 150;

const PROMPTS: Record<
  Category,
  { prompt: string; promptHe: string }
> = {
  color: { prompt: "What color is this?", promptHe: "מה הצבע?" },
  number: { prompt: "What number is this?", promptHe: "מה המספר?" },
  shape: { prompt: "What shape is this?", promptHe: "מה הצורה?" },
  food: { prompt: "What is this?", promptHe: "מה זה?" },
  vehicle: { prompt: "What is this?", promptHe: "מה זה?" },
  animal: { prompt: "What is this?", promptHe: "מה זה?" },
  body: { prompt: "What is this?", promptHe: "מה זה?" },
  clothing: { prompt: "What is this?", promptHe: "מה זה?" },
  school: { prompt: "What is this?", promptHe: "מה זה?" },
  weather: { prompt: "What is this?", promptHe: "מה זה?" },
  home: { prompt: "What is this?", promptHe: "מה זה?" },
  sport: { prompt: "What is this?", promptHe: "מה זה?" },
};

/** [type, answer, emoji] — 150 unique beginner quiz items */
const RAW: ItemDef[] = [
  // color (13)
  { type: "color", answer: "Red", emoji: "🔴" },
  { type: "color", answer: "Blue", emoji: "🔵" },
  { type: "color", answer: "Green", emoji: "🟢" },
  { type: "color", answer: "Yellow", emoji: "🟡" },
  { type: "color", answer: "Orange", emoji: "🟠" },
  { type: "color", answer: "Purple", emoji: "🟣" },
  { type: "color", answer: "Pink", emoji: "🩷" },
  { type: "color", answer: "Brown", emoji: "🤎" },
  { type: "color", answer: "Black", emoji: "⚫" },
  { type: "color", answer: "White", emoji: "⚪" },
  { type: "color", answer: "Gray", emoji: "🩶" },
  { type: "color", answer: "Gold", emoji: "🥇" },
  { type: "color", answer: "Silver", emoji: "🥈" },

  // number (13)
  { type: "number", answer: "One", emoji: "1️⃣" },
  { type: "number", answer: "Two", emoji: "2️⃣" },
  { type: "number", answer: "Three", emoji: "3️⃣" },
  { type: "number", answer: "Four", emoji: "4️⃣" },
  { type: "number", answer: "Five", emoji: "5️⃣" },
  { type: "number", answer: "Six", emoji: "6️⃣" },
  { type: "number", answer: "Seven", emoji: "7️⃣" },
  { type: "number", answer: "Eight", emoji: "8️⃣" },
  { type: "number", answer: "Nine", emoji: "9️⃣" },
  { type: "number", answer: "Ten", emoji: "🔟" },
  { type: "number", answer: "Eleven", emoji: "1️⃣1️⃣" },
  { type: "number", answer: "Twelve", emoji: "1️⃣2️⃣" },
  { type: "number", answer: "Twenty", emoji: "2️⃣0️⃣" },

  // shape (12)
  { type: "shape", answer: "Circle", emoji: "⭕" },
  { type: "shape", answer: "Square", emoji: "🟧" },
  { type: "shape", answer: "Triangle", emoji: "🔺" },
  { type: "shape", answer: "Rectangle", emoji: "📐" },
  { type: "shape", answer: "Star", emoji: "⭐" },
  { type: "shape", answer: "Heart", emoji: "❤️" },
  { type: "shape", answer: "Oval", emoji: "🥚" },
  { type: "shape", answer: "Diamond", emoji: "💎" },
  { type: "shape", answer: "Pentagon", emoji: "🔶" },
  { type: "shape", answer: "Hexagon", emoji: "🔷" },
  { type: "shape", answer: "Crescent", emoji: "🌙" },
  { type: "shape", answer: "Cross", emoji: "➕" },

  // food (13)
  { type: "food", answer: "Apple", emoji: "🍎" },
  { type: "food", answer: "Banana", emoji: "🍌" },
  { type: "food", answer: "Grape", emoji: "🍇" },
  { type: "food", answer: "Bread", emoji: "🍞" },
  { type: "food", answer: "Milk", emoji: "🥛" },
  { type: "food", answer: "Cheese", emoji: "🧀" },
  { type: "food", answer: "Egg", emoji: "🥚" },
  { type: "food", answer: "Pizza", emoji: "🍕" },
  { type: "food", answer: "Cake", emoji: "🎂" },
  { type: "food", answer: "Cookie", emoji: "🍪" },
  { type: "food", answer: "Water", emoji: "💧" },
  { type: "food", answer: "Juice", emoji: "🧃" },
  { type: "food", answer: "Ice cream", emoji: "🍦" },

  // vehicle (12)
  { type: "vehicle", answer: "Car", emoji: "🚗" },
  { type: "vehicle", answer: "Bus", emoji: "🚌" },
  { type: "vehicle", answer: "Train", emoji: "🚂" },
  { type: "vehicle", answer: "Bicycle", emoji: "🚲" },
  { type: "vehicle", answer: "Plane", emoji: "✈️" },
  { type: "vehicle", answer: "Boat", emoji: "⛵" },
  { type: "vehicle", answer: "Truck", emoji: "🚚" },
  { type: "vehicle", answer: "Helicopter", emoji: "🚁" },
  { type: "vehicle", answer: "Motorcycle", emoji: "🏍️" },
  { type: "vehicle", answer: "Ship", emoji: "🚢" },
  { type: "vehicle", answer: "Taxi", emoji: "🚕" },
  { type: "vehicle", answer: "Ambulance", emoji: "🚑" },

  // animal (13)
  { type: "animal", answer: "Dog", emoji: "🐕" },
  { type: "animal", answer: "Cat", emoji: "🐱" },
  { type: "animal", answer: "Bird", emoji: "🐦" },
  { type: "animal", answer: "Fish", emoji: "🐟" },
  { type: "animal", answer: "Horse", emoji: "🐴" },
  { type: "animal", answer: "Cow", emoji: "🐄" },
  { type: "animal", answer: "Pig", emoji: "🐷" },
  { type: "animal", answer: "Rabbit", emoji: "🐰" },
  { type: "animal", answer: "Duck", emoji: "🦆" },
  { type: "animal", answer: "Lion", emoji: "🦁" },
  { type: "animal", answer: "Elephant", emoji: "🐘" },
  { type: "animal", answer: "Bear", emoji: "🐻" },
  { type: "animal", answer: "Frog", emoji: "🐸" },

  // body (13)
  { type: "body", answer: "Head", emoji: "🙂" },
  { type: "body", answer: "Hand", emoji: "✋" },
  { type: "body", answer: "Foot", emoji: "🦶" },
  { type: "body", answer: "Eye", emoji: "👁️" },
  { type: "body", answer: "Ear", emoji: "👂" },
  { type: "body", answer: "Nose", emoji: "👃" },
  { type: "body", answer: "Mouth", emoji: "👄" },
  { type: "body", answer: "Tooth", emoji: "🦷" },
  { type: "body", answer: "Hair", emoji: "💇" },
  { type: "body", answer: "Arm", emoji: "💪" },
  { type: "body", answer: "Leg", emoji: "🦵" },
  { type: "body", answer: "Finger", emoji: "👆" },
  { type: "body", answer: "Knee", emoji: "🦿" },

  // clothing (12)
  { type: "clothing", answer: "Shirt", emoji: "👕" },
  { type: "clothing", answer: "Pants", emoji: "👖" },
  { type: "clothing", answer: "Dress", emoji: "👗" },
  { type: "clothing", answer: "Shoes", emoji: "👟" },
  { type: "clothing", answer: "Hat", emoji: "🎩" },
  { type: "clothing", answer: "Coat", emoji: "🧥" },
  { type: "clothing", answer: "Socks", emoji: "🧦" },
  { type: "clothing", answer: "Skirt", emoji: "👚" },
  { type: "clothing", answer: "Gloves", emoji: "🧤" },
  { type: "clothing", answer: "Glasses", emoji: "👓" },
  { type: "clothing", answer: "Scarf", emoji: "🧣" },
  { type: "clothing", answer: "Boots", emoji: "🥾" },

  // school (13)
  { type: "school", answer: "Book", emoji: "📚" },
  { type: "school", answer: "Pen", emoji: "🖊️" },
  { type: "school", answer: "Pencil", emoji: "✏️" },
  { type: "school", answer: "Paper", emoji: "📄" },
  { type: "school", answer: "Desk", emoji: "🪑" },
  { type: "school", answer: "Chair", emoji: "💺" },
  { type: "school", answer: "Backpack", emoji: "🎒" },
  { type: "school", answer: "Eraser", emoji: "🧽" },
  { type: "school", answer: "Ruler", emoji: "📏" },
  { type: "school", answer: "Notebook", emoji: "📓" },
  { type: "school", answer: "Library", emoji: "📖" },
  { type: "school", answer: "Homework", emoji: "📝" },
  { type: "school", answer: "School", emoji: "🏫" },

  // weather (12)
  { type: "weather", answer: "Sun", emoji: "☀️" },
  { type: "weather", answer: "Moon", emoji: "🌙" },
  { type: "weather", answer: "Rain", emoji: "🌧️" },
  { type: "weather", answer: "Cloud", emoji: "☁️" },
  { type: "weather", answer: "Snow", emoji: "❄️" },
  { type: "weather", answer: "Wind", emoji: "💨" },
  { type: "weather", answer: "Storm", emoji: "⛈️" },
  { type: "weather", answer: "Rainbow", emoji: "🌈" },
  { type: "weather", answer: "Lightning", emoji: "⚡" },
  { type: "weather", answer: "Fog", emoji: "🌫️" },
  { type: "weather", answer: "Thunder", emoji: "🌩️" },
  { type: "weather", answer: "Hail", emoji: "🧊" },

  // home (13)
  { type: "home", answer: "House", emoji: "🏠" },
  { type: "home", answer: "Door", emoji: "🚪" },
  { type: "home", answer: "Window", emoji: "🪟" },
  { type: "home", answer: "Bed", emoji: "🛏️" },
  { type: "home", answer: "Table", emoji: "🪑" },
  { type: "home", answer: "Kitchen", emoji: "🍳" },
  { type: "home", answer: "Sofa", emoji: "🛋️" },
  { type: "home", answer: "Lamp", emoji: "💡" },
  { type: "home", answer: "Clock", emoji: "🕐" },
  { type: "home", answer: "Key", emoji: "🔑" },
  { type: "home", answer: "Phone", emoji: "📱" },
  { type: "home", answer: "Garden", emoji: "🌻" },

  // sport (12)
  { type: "sport", answer: "Ball", emoji: "⚽" },
  { type: "sport", answer: "Soccer", emoji: "⚽" },
  { type: "sport", answer: "Basketball", emoji: "🏀" },
  { type: "sport", answer: "Tennis", emoji: "🎾" },
  { type: "sport", answer: "Swimming", emoji: "🏊" },
  { type: "sport", answer: "Running", emoji: "🏃" },
  { type: "sport", answer: "Baseball", emoji: "⚾" },
  { type: "sport", answer: "Hockey", emoji: "🏒" },
  { type: "sport", answer: "Golf", emoji: "⛳" },
  { type: "sport", answer: "Volleyball", emoji: "🏐" },
  { type: "sport", answer: "Skiing", emoji: "⛷️" },
  { type: "sport", answer: "Cycling", emoji: "🚴" },
];

type GeneratedItem = {
  type: Category;
  prompt: string;
  promptHe: string;
  answer: string;
  options: [string, string, string, string];
  emoji: string;
};

/** Deterministic shuffle so generated output is stable across runs. */
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const copy = [...arr];
  let s = seed;
  for (let i = copy.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildCategoryPools(items: ItemDef[]): Map<Category, string[]> {
  const pools = new Map<Category, string[]>();
  for (const item of items) {
    const list = pools.get(item.type) ?? [];
    list.push(item.answer);
    pools.set(item.type, list);
  }
  return pools;
}

function buildOptions(
  answer: string,
  pool: string[],
  index: number,
): [string, string, string, string] {
  const distractors = pool.filter((w) => w !== answer);
  const picked = seededShuffle(distractors, index * 7919 + 42).slice(0, 3);
  const options = seededShuffle([answer, ...picked], index * 104729 + 17);
  if (options.length !== 4) {
    throw new Error(`Expected 4 options for "${answer}", got ${options.length}`);
  }
  if (!options.includes(answer)) {
    throw new Error(`Answer "${answer}" missing from options`);
  }
  return options as [string, string, string, string];
}

function buildItems(raw: ItemDef[]): GeneratedItem[] {
  const pools = buildCategoryPools(raw);
  return raw.map((item, index) => {
    const pool = pools.get(item.type);
    if (!pool || pool.length < 4) {
      throw new Error(`Category "${item.type}" needs at least 4 items, got ${pool?.length ?? 0}`);
    }
    const { prompt, promptHe } = PROMPTS[item.type];
    return {
      type: item.type,
      prompt,
      promptHe,
      answer: item.answer,
      options: buildOptions(item.answer, pool, index),
      emoji: item.emoji,
    };
  });
}

function validate(items: GeneratedItem[]): void {
  if (items.length !== EXPECTED_COUNT) {
    throw new Error(`Expected ${EXPECTED_COUNT} items, got ${items.length}`);
  }

  const answers = new Set<string>();
  for (const item of items) {
    const key = item.answer.toLowerCase();
    if (answers.has(key)) {
      throw new Error(`Duplicate answer: ${item.answer}`);
    }
    answers.add(key);

    if (item.options.length !== 4) {
      throw new Error(`Item "${item.answer}" must have 4 options`);
    }
    if (!item.options.includes(item.answer)) {
      throw new Error(`Item "${item.answer}" options must include the answer`);
    }
    const uniqueOptions = new Set(item.options.map((o) => o.toLowerCase()));
    if (uniqueOptions.size !== 4) {
      throw new Error(`Item "${item.answer}" has duplicate options`);
    }
  }
}

function generateTs(items: GeneratedItem[]): string {
  const lines = items.map(
    (item) =>
      `  { type: ${JSON.stringify(item.type)}, prompt: ${JSON.stringify(item.prompt)}, promptHe: ${JSON.stringify(item.promptHe)}, answer: ${JSON.stringify(item.answer)}, options: ${JSON.stringify(item.options)}, emoji: ${JSON.stringify(item.emoji)} },`,
  );

  return `/** Auto-generated by scripts/generate-english-colors-numbers.ts — do not edit manually. */

export interface ColorNumberQuestion {
  type: string;
  prompt: string;
  promptHe: string;
  answer: string;
  options: string[];
  emoji: string;
}

export const ENGLISH_COLORS_NUMBERS: ColorNumberQuestion[] = [
${lines.join("\n")}
];
`;
}

function main(): void {
  const items = buildItems(RAW);
  validate(items);

  const outPath = join(process.cwd(), "src/lib/data/english-colors-numbers.ts");
  writeFileSync(outPath, generateTs(items), "utf8");
  console.log(`Wrote ${items.length} color/number quiz items to ${outPath}`);
}

main();
