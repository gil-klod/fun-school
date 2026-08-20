/**
 * Generates src/lib/data/english-beginner-vocab.ts — 150 kid-friendly English↔Hebrew word pairs.
 *
 * Run from repo root:
 *   npx tsx scripts/generate-english-beginner-vocab.ts
 */
import { writeFileSync } from "fs";
import { join } from "path";

type VocabDef = [english: string, hebrew: string, emoji: string];

const EXPECTED_COUNT = 150;

/** [english, hebrew, emoji] — 3rd-grade beginner vocabulary */
const RAW: VocabDef[] = [
  // Animals (21)
  ["Dog", "כלב", "🐕"],
  ["Cat", "חתול", "🐱"],
  ["Bird", "ציפור", "🐦"],
  ["Fish", "דג", "🐟"],
  ["Horse", "סוס", "🐴"],
  ["Cow", "פרה", "🐄"],
  ["Pig", "חזיר", "🐷"],
  ["Sheep", "כבש", "🐑"],
  ["Rabbit", "ארנב", "🐰"],
  ["Duck", "ברווז", "🦆"],
  ["Hen", "תרנגולת", "🐔"],
  ["Lion", "אריה", "🦁"],
  ["Tiger", "נמר", "🐯"],
  ["Elephant", "פיל", "🐘"],
  ["Monkey", "קוף", "🐵"],
  ["Bear", "דוב", "🐻"],
  ["Frog", "צפרדע", "🐸"],
  ["Butterfly", "פרפר", "🦋"],
  ["Bee", "דבורה", "🐝"],
  ["Mouse", "עכבר", "🐭"],
  ["Turtle", "צב", "🐢"],

  // Food & drink (25)
  ["Apple", "תפוח", "🍎"],
  ["Banana", "בננה", "🍌"],
  ["Orange", "תפוז", "🍊"],
  ["Bread", "לחם", "🍞"],
  ["Milk", "חלב", "🥛"],
  ["Cheese", "גבינה", "🧀"],
  ["Egg", "ביצה", "🥚"],
  ["Rice", "אורז", "🍚"],
  ["Pizza", "פיצה", "🍕"],
  ["Cake", "עוגה", "🎂"],
  ["Cookie", "עוגייה", "🍪"],
  ["Soup", "מרק", "🍲"],
  ["Salad", "סלט", "🥗"],
  ["Water", "מים", "💧"],
  ["Juice", "מיץ", "🧃"],
  ["Tea", "תה", "🍵"],
  ["Chocolate", "שוקולד", "🍫"],
  ["Strawberry", "תות", "🍓"],
  ["Grape", "ענב", "🍇"],
  ["Lemon", "לימון", "🍋"],
  ["Tomato", "עגבניה", "🍅"],
  ["Potato", "תפוח אדמה", "🥔"],
  ["Carrot", "גזר", "🥕"],
  ["Honey", "דבש", "🍯"],
  ["Ice cream", "גלידה", "🍦"],

  // School (15)
  ["Book", "ספר", "📚"],
  ["Pen", "עט", "🖊️"],
  ["Pencil", "עיפרון", "✏️"],
  ["Paper", "נייר", "📄"],
  ["Desk", "שולחן כתיבה", "🪑"],
  ["Chair", "כיסא", "💺"],
  ["Teacher", "מורה", "👩‍🏫"],
  ["Student", "תלמיד", "🧑‍🎓"],
  ["Backpack", "תיק", "🎒"],
  ["Eraser", "מחק", "🧽"],
  ["Ruler", "סרגל", "📏"],
  ["Notebook", "מחברת", "📓"],
  ["Library", "ספרייה", "📖"],
  ["Homework", "שיעורי בית", "📝"],
  ["School", "בית ספר", "🏫"],

  // Home (15)
  ["House", "בית", "🏠"],
  ["Door", "דלת", "🚪"],
  ["Window", "חלון", "🪟"],
  ["Bed", "מיטה", "🛏️"],
  ["Table", "שולחן", "🪑"],
  ["Kitchen", "מטבח", "🍳"],
  ["Bathroom", "חדר אמבטיה", "🛁"],
  ["Sofa", "ספה", "🛋️"],
  ["Lamp", "מנורה", "💡"],
  ["Clock", "שעון", "🕐"],
  ["Mirror", "מראה", "🪞"],
  ["Key", "מפתח", "🔑"],
  ["Phone", "טלפון", "📱"],
  ["Television", "טלוויזיה", "📺"],
  ["Garden", "גינה", "🌻"],

  // Family (10)
  ["Mother", "אמא", "👩"],
  ["Father", "אבא", "👨"],
  ["Sister", "אחות", "👧"],
  ["Brother", "אח", "👦"],
  ["Baby", "תינוק", "👶"],
  ["Grandmother", "סבתא", "👵"],
  ["Grandfather", "סבא", "👴"],
  ["Family", "משפחה", "👨‍👩‍👧‍👦"],
  ["Boy", "ילד", "🧒"],
  ["Girl", "ילדה", "👧"],

  // Body (12)
  ["Head", "ראש", "🙂"],
  ["Hand", "יד", "✋"],
  ["Foot", "רגל", "🦶"],
  ["Eye", "עין", "👁️"],
  ["Ear", "אוזן", "👂"],
  ["Nose", "אף", "👃"],
  ["Mouth", "פה", "👄"],
  ["Tooth", "שן", "🦷"],
  ["Hair", "שיער", "💇"],
  ["Heart", "לב", "❤️"],
  ["Arm", "זרוע", "💪"],
  ["Leg", "רגל", "🦵"],

  // Nature & weather (15)
  ["Sun", "שמש", "☀️"],
  ["Moon", "ירח", "🌙"],
  ["Star", "כוכב", "⭐"],
  ["Tree", "עץ", "🌳"],
  ["Flower", "פרח", "🌸"],
  ["Grass", "דשא", "🌿"],
  ["Rain", "גשם", "🌧️"],
  ["Cloud", "ענן", "☁️"],
  ["Snow", "שלג", "❄️"],
  ["Wind", "רוח", "💨"],
  ["Mountain", "הר", "⛰️"],
  ["River", "נהר", "🏞️"],
  ["Sea", "ים", "🌊"],
  ["Beach", "חוף", "🏖️"],
  ["Sky", "שמיים", "🌤️"],

  // Clothes (10)
  ["Shirt", "חולצה", "👕"],
  ["Pants", "מכנסיים", "👖"],
  ["Dress", "שמלה", "👗"],
  ["Shoes", "נעליים", "👟"],
  ["Hat", "כובע", "🎩"],
  ["Coat", "מעיל", "🧥"],
  ["Socks", "גרביים", "🧦"],
  ["Skirt", "חצאית", "👗"],
  ["Jacket", "ג'קט", "🧥"],
  ["Glasses", "משקפיים", "👓"],

  // Actions (10)
  ["Run", "לרוץ", "🏃"],
  ["Walk", "ללכת", "🚶"],
  ["Jump", "לקפוץ", "🤸"],
  ["Swim", "לשחות", "🏊"],
  ["Read", "לקרוא", "📖"],
  ["Write", "לכתוב", "✍️"],
  ["Eat", "לאכול", "🍽️"],
  ["Drink", "לשתות", "🥤"],
  ["Sleep", "לישון", "😴"],
  ["Play", "לשחק", "🎮"],

  // Adjectives (8)
  ["Big", "גדול", "🐘"],
  ["Small", "קטן", "🐜"],
  ["Hot", "חם", "🔥"],
  ["Cold", "קר", "🧊"],
  ["Happy", "שמח", "😊"],
  ["Sad", "עצוב", "😢"],
  ["Fast", "מהיר", "⚡"],
  ["Slow", "איטי", "🐢"],

  // Transport (5)
  ["Car", "מכונית", "🚗"],
  ["Bus", "אוטובוס", "🚌"],
  ["Train", "רכבת", "🚂"],
  ["Bicycle", "אופניים", "🚲"],
  ["Plane", "מטוס", "✈️"],

  // Places & misc (4)
  ["Park", "פארק", "🏞️"],
  ["Ball", "כדור", "⚽"],
  ["Friend", "חבר", "👫"],
  ["Gift", "מתנה", "🎁"],
];

function validate(entries: VocabDef[]): void {
  if (entries.length !== EXPECTED_COUNT) {
    throw new Error(`Expected ${EXPECTED_COUNT} entries, got ${entries.length}`);
  }

  const english = new Set<string>();
  for (const [en, he, emoji] of entries) {
    if (!en.trim() || !he.trim() || !emoji.trim()) {
      throw new Error(`Empty field in entry: ${JSON.stringify([en, he, emoji])}`);
    }
    const key = en.toLowerCase();
    if (english.has(key)) {
      throw new Error(`Duplicate English word: ${en}`);
    }
    english.add(key);
  }
}

function generateTs(entries: VocabDef[]): string {
  const lines = entries.map(
    ([english, hebrew, emoji]) =>
      `  { english: ${JSON.stringify(english)}, hebrew: ${JSON.stringify(hebrew)}, emoji: ${JSON.stringify(emoji)} },`,
  );

  return `/** Auto-generated by scripts/generate-english-beginner-vocab.ts — do not edit manually. */

export interface VocabPair {
  english: string;
  hebrew: string;
  emoji: string;
}

export const ENGLISH_BEGINNER_VOCAB: VocabPair[] = [
${lines.join("\n")}
];
`;
}

function main(): void {
  validate(RAW);

  const outPath = join(process.cwd(), "src/lib/data/english-beginner-vocab.ts");
  writeFileSync(outPath, generateTs(RAW), "utf8");
  console.log(`Wrote ${RAW.length} vocabulary pairs to ${outPath}`);
}

main();
