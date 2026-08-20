/**
 * Generates src/lib/data/english-beginner-sentences.ts — 150 kid-friendly sentence challenges.
 *
 * Run from repo root:
 *   npx tsx scripts/generate-english-beginner-sentences.ts
 */
import { writeFileSync } from "fs";
import { join } from "path";

type SentenceDef = [correct: string, translation: string];

const EXPECTED_COUNT = 150;

/** [correct English sentence, Hebrew translation] */
const RAW: SentenceDef[] = [
  // I + verb (20)
  ["I read a book", "אני קורא ספר"],
  ["I like apples", "אני אוהב תפוחים"],
  ["I go to school", "אני הולך לבית ספר"],
  ["I eat an apple", "אני אוכל תפוח"],
  ["I drink water", "אני שותה מים"],
  ["I play with a ball", "אני משחק עם כדור"],
  ["I see a cat", "אני רואה חתול"],
  ["I have a dog", "יש לי כלב"],
  ["I love my mom", "אני אוהב את אמא"],
  ["I write a letter", "אני כותב מכתב"],
  ["I run fast", "אני רץ מהר"],
  ["I swim well", "אני שוחה טוב"],
  ["I sing a song", "אני שר שיר"],
  ["I draw a picture", "אני מצייר תמונה"],
  ["I wash my hands", "אני שוטף את הידיים"],
  ["I open the door", "אני פותח את הדלת"],
  ["I close the window", "אני סוגר את החלון"],
  ["I sit on a chair", "אני יושב על כיסא"],
  ["I sleep in my bed", "אני ישן במיטה שלי"],
  ["I watch TV", "אני רואה טלוויזיה"],

  // She / He (15)
  ["She is happy", "היא שמחה"],
  ["He is tall", "הוא גבוה"],
  ["She is kind", "היא נחמדה"],
  ["He is strong", "הוא חזק"],
  ["She likes music", "היא אוהבת מוזיקה"],
  ["He plays football", "הוא משחק כדורגל"],
  ["She reads books", "היא קוראת ספרים"],
  ["He eats lunch", "הוא אוכל צהריים"],
  ["She has a cat", "יש לה חתול"],
  ["He goes home", "הוא הולך הביתה"],
  ["She runs fast", "היא רצה מהר"],
  ["He helps me", "הוא עוזר לי"],
  ["She sings well", "היא שרה יפה"],
  ["He writes stories", "הוא כותב סיפורים"],
  ["She loves animals", "היא אוהבת חיות"],

  // The + noun + is + adjective (20)
  ["The dog is big", "הכלב גדול"],
  ["The cat is small", "החתול קטן"],
  ["The sun is hot", "השמש חמה"],
  ["The sky is blue", "השמיים כחולים"],
  ["The flower is red", "הפרח אדום"],
  ["The book is new", "הספר חדש"],
  ["The car is fast", "המכונית מהירה"],
  ["The baby is cute", "התינוק חמוד"],
  ["The tree is tall", "העץ גבוה"],
  ["The house is big", "הבית גדול"],
  ["The fish can swim", "הדג יודע לשחות"],
  ["The bird can fly", "הציפור יודעת לעוף"],
  ["The cake is sweet", "העוגה מתוקה"],
  ["The milk is cold", "החלב קר"],
  ["The park is fun", "הפארק כיפי"],
  ["The dog is brown", "הכלב חום"],
  ["The apple is green", "התפוח ירוק"],
  ["The sea is deep", "הים עמוק"],
  ["The moon is bright", "הירח בהיר"],
  ["The school is near here", "בית הספר קרוב מכאן"],

  // We / They (15)
  ["We play together", "אנחנו משחקים ביחד"],
  ["We go to the park", "אנחנו הולכים לפארק"],
  ["We like pizza", "אנחנו אוהבים פיצה"],
  ["We read stories", "אנחנו קוראים סיפורים"],
  ["We eat lunch", "אנחנו אוכלים צהריים"],
  ["We sing songs", "אנחנו שרים שירים"],
  ["We help our friends", "אנחנו עוזרים לחברים שלנו"],
  ["We run fast", "אנחנו רצים מהר"],
  ["We swim today", "אנחנו שוחים היום"],
  ["They are friends", "הם חברים"],
  ["They play with a ball", "הם משחקים עם כדור"],
  ["They go to school", "הם הולכים לבית ספר"],
  ["They like cats", "הם אוהבים חתולים"],
  ["They eat fruit", "הם אוכלים פירות"],
  ["They read books", "הם קוראים ספרים"],

  // You (10)
  ["You are nice", "את/ה נחמד/ה"],
  ["You can run", "את/ה יכול/ה לרוץ"],
  ["You like dogs", "את/ה אוהב/ת כלבים"],
  ["You have talent", "יש לך כישרון"],
  ["You sing well", "את/ה שר/ה יפה"],
  ["You read fast", "את/ה קורא/ת מהר"],
  ["You play well", "את/ה משחק/ת טוב"],
  ["You are smart", "את/ה חכם/ה"],
  ["You help me", "את/ה עוזר/ת לי"],
  ["You eat apples", "את/ה אוכל/ת תפוחים"],

  // My / Your / His / Her (15)
  ["My name is Dan", "קוראים לי דן"],
  ["My dog is big", "הכלב שלי גדול"],
  ["My book is here", "הספר שלי כאן"],
  ["My mom is kind", "אמא שלי נחמדה"],
  ["Your cat is cute", "החתול שלך חמוד"],
  ["Your house is big", "הבית שלך גדול"],
  ["His ball is red", "הכדור שלו אדום"],
  ["Her dress is blue", "השמלה שלה כחולה"],
  ["My friend is here", "החבר שלי כאן"],
  ["My room is clean", "החדר שלי נקי"],
  ["Your hat is green", "הכובע שלך ירוק"],
  ["His bike is new", "האופניים שלו חדשים"],
  ["Her bag is pink", "התיק שלה ורוד"],
  ["My dad is tall", "אבא שלי גבוה"],
  ["Your shoes are nice", "הנעליים שלך יפות"],

  // This / That / It (10)
  ["This is my book", "זה הספר שלי"],
  ["That is a cat", "זה חתול"],
  ["This is fun", "זה כיף"],
  ["That is big", "זה גדול"],
  ["It is cold today", "קר היום"],
  ["It is sunny today", "שמשי היום"],
  ["This is my house", "זה הבית שלי"],
  ["That is a tree", "זה עץ"],
  ["It is very hot", "חם מאוד"],
  ["This is my friend", "זה החבר שלי"],

  // There is / are (10)
  ["There is a cat", "יש חתול"],
  ["There is a dog", "יש כלב"],
  ["There are two birds", "יש שני ציפורים"],
  ["There are three books", "יש שלושה ספרים"],
  ["There is one apple", "יש תפוח אחד"],
  ["There are many flowers", "יש הרבה פרחים"],
  ["There is a park here", "יש פארק כאן"],
  ["There are five cats", "יש חמישה חתולים"],
  ["There are two dogs", "יש שני כלבים"],
  ["There is a ball", "יש כדור"],

  // Can / have / want (15)
  ["I can swim", "אני יכול לשחות"],
  ["I can read", "אני יכול לקרוא"],
  ["She can sing", "היא יכולה לשיר"],
  ["He can run", "הוא יכול לרוץ"],
  ["We can play now", "אנחנו יכולים לשחק עכשיו"],
  ["I want water", "אני רוצה מים"],
  ["She wants cake", "היא רוצה עוגה"],
  ["He has a bike", "יש לו אופניים"],
  ["I have a pen", "יש לי עט"],
  ["They have fun", "הם נהנים"],
  ["You can jump", "את/ה יכול/ה לקפוץ"],
  ["I want an apple", "אני רוצה תפוח"],
  ["He wants milk", "הוא רוצה חלב"],
  ["We have time", "יש לנו זמן"],
  ["She has friends", "יש לה חברים"],

  // Go to / at / in (10)
  ["I go to bed", "אני הולך לישון"],
  ["She goes to school", "היא הולכת לבית ספר"],
  ["He goes to the park", "הוא הולך לפארק"],
  ["We go to the beach", "אנחנו הולכים לחוף"],
  ["They go home", "הם הולכים הביתה"],
  ["I am at school", "אני בבית הספר"],
  ["She is at home", "היא בבית"],
  ["He is in class", "הוא בכיתה"],
  ["We are in the park", "אנחנו בפארק"],
  ["They are at the beach", "הם בחוף הים"],

  // Daily phrases & misc (10)
  ["Good morning everyone", "בוקר טוב לכולם"],
  ["Thank you very much", "תודה רבה"],
  ["See you tomorrow", "נתראה מחר"],
  ["I am hungry now", "אני רעב עכשיו"],
  ["She is tired today", "היא עייפה היום"],
  ["The food is good", "האוכל טוב"],
  ["I like my teacher", "אני אוהב את המורה"],
  ["We love our school", "אנחנו אוהבים את בית הספר"],
  ["The bus is here", "האוטובוס כאן"],
  ["My cat is sleeping", "החתול שלי ישן"],
];

interface SentenceChallenge {
  words: string[];
  correct: string;
  translation: string;
}

function wordsFromCorrect(correct: string): string[] {
  return correct.trim().split(/\s+/);
}

function validate(entries: SentenceDef[]): void {
  if (entries.length !== EXPECTED_COUNT) {
    throw new Error(`Expected ${EXPECTED_COUNT} entries, got ${entries.length}`);
  }

  const seen = new Set<string>();
  for (const [correct, translation] of entries) {
    if (!correct.trim() || !translation.trim()) {
      throw new Error(`Empty field: ${JSON.stringify([correct, translation])}`);
    }
    const key = correct.toLowerCase();
    if (seen.has(key)) {
      throw new Error(`Duplicate sentence: ${correct}`);
    }
    seen.add(key);

    const words = wordsFromCorrect(correct);
    if (words.length < 3 || words.length > 7) {
      throw new Error(`Sentence must be 3–7 words: "${correct}" (${words.length})`);
    }
    if (words.join(" ") !== correct.trim()) {
      throw new Error(`Words mismatch for: ${correct}`);
    }
  }
}

function toChallenges(entries: SentenceDef[]): SentenceChallenge[] {
  return entries.map(([correct, translation]) => ({
    words: wordsFromCorrect(correct),
    correct,
    translation,
  }));
}

function generateTs(challenges: SentenceChallenge[]): string {
  const lines = challenges.map(
    (c) =>
      `  {\n    words: ${JSON.stringify(c.words)},\n    correct: ${JSON.stringify(c.correct)},\n    translation: ${JSON.stringify(c.translation)},\n  },`,
  );

  return `/** Auto-generated by scripts/generate-english-beginner-sentences.ts — do not edit manually. */

export interface SentenceChallenge {
  words: string[];
  correct: string;
  translation: string;
}

export const ENGLISH_BEGINNER_SENTENCES: SentenceChallenge[] = [
${lines.join("\n")}
];
`;
}

function main(): void {
  validate(RAW);
  const challenges = toChallenges(RAW);
  const outPath = join(process.cwd(), "src/lib/data/english-beginner-sentences.ts");
  writeFileSync(outPath, generateTs(challenges), "utf8");
  console.log(`Wrote ${challenges.length} sentence challenges to ${outPath}`);
}

main();
