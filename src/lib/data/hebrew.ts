export interface HebrewWord {
  word: string;
  hintHe: string;
  hintEn: string;
  categoryHe: string;
  categoryEn: string;
}

export const HEBREW_WORDS: HebrewWord[] = [
  { word: "ספר", hintHe: "משהו שקוראים", hintEn: "Something you read", categoryHe: "בית ספר", categoryEn: "school" },
  { word: "בית", hintHe: "המקום שגרים בו", hintEn: "Where you live", categoryHe: "בית", categoryEn: "home" },
  { word: "כלב", hintHe: "חיה שמנבחת", hintEn: "A pet that barks", categoryHe: "בעלי חיים", categoryEn: "animals" },
  { word: "שמש", hintHe: "זורחת בשמיים", hintEn: "Shines in the sky", categoryHe: "טבע", categoryEn: "nature" },
  { word: "ילד", hintHe: "אדם צעיר", hintEn: "A young person", categoryHe: "אנשים", categoryEn: "people" },
  { word: "מים", hintHe: "שותים את זה", hintEn: "You drink this", categoryHe: "טבע", categoryEn: "nature" },
  { word: "פרח", hintHe: "גדל בגינה", hintEn: "Grows in a garden", categoryHe: "טבע", categoryEn: "nature" },
  { word: "עוגה", hintHe: "מאכל מתוק ליום הולדת", hintEn: "Sweet birthday food", categoryHe: "אוכל", categoryEn: "food" },
  { word: "חלום", hintHe: "מה שרואים בשנת לילה", hintEn: "What you see when sleeping", categoryHe: "מחשבה", categoryEn: "abstract" },
  { word: "ידיד", hintHe: "מישהו שמשחקים איתו", hintEn: "Someone you play with", categoryHe: "אנשים", categoryEn: "people" },
  { word: "כדור", hintHe: "דבר עגול שבועטים", hintEn: "Round thing you kick", categoryHe: "ספורט", categoryEn: "sports" },
  { word: "מורה", hintHe: "מלמד/ת בבית ספר", hintEn: "Teaches at school", categoryHe: "בית ספר", categoryEn: "school" },
];

export function getWordHint(word: HebrewWord, locale: "he" | "en") {
  return locale === "he" ? word.hintHe : word.hintEn;
}

export function getWordCategory(word: HebrewWord, locale: "he" | "en") {
  return locale === "he" ? word.categoryHe : word.categoryEn;
}

export function pickWord(exclude: string[] = []): HebrewWord {
  const pool = HEBREW_WORDS.filter((w) => !exclude.includes(w.word));
  const list = pool.length > 0 ? pool : HEBREW_WORDS;
  return list[Math.floor(Math.random() * list.length)];
}

export function scrambleWord(word: string): string {
  const chars = word.split("");
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  const scrambled = chars.join("");
  return scrambled === word ? scrambleWord(word) : scrambled;
}

export function newScrambleWord(exclude: string[] = []) {
  const w = pickWord(exclude);
  return { ...w, scrambled: scrambleWord(w.word) };
}

export interface FixSentenceQuestion {
  wrong: string;
  correct: string;
  mistake: string;
  options: string[];
  explanationHe: string;
  explanationEn: string;
}

export function getFixSentenceExplanation(
  question: FixSentenceQuestion,
  locale: "he" | "en"
): string {
  return locale === "he" ? question.explanationHe : question.explanationEn;
}

export const FIX_SENTENCES: FixSentenceQuestion[] = [
  {
    wrong: "הילדה אכלת תפוח.",
    correct: "הילדה אכלה תפוח.",
    mistake: "אכלת",
    options: ["אכלת", "אכל", "אוכל", "אוכלת"],
    explanationHe: "אכלת = את אכלת (לשון נקבה). הנושא הוא הילדה, לכן צריך אכלה.",
    explanationEn: "אכלת = you (f.) ate. The subject is הילדה (she), so we need אכלה.",
  },
  {
    wrong: "הכלבים רץ בגינה.",
    correct: "הכלבים רצים בגינה.",
    mistake: "רץ",
    options: ["רץ", "רצים", "רצה", "רצות"],
    explanationHe: "כלבים הוא רבים, לכן הפועל צריך להיות ברבים: רצים.",
    explanationEn: "כלבים is plural, so the verb needs plural form: רצים.",
  },
  {
    wrong: "יש לי שלושה ספר.",
    correct: "יש לי שלושה ספרים.",
    mistake: "ספר",
    options: ["ספר", "ספרים", "ספריה", "ספרון"],
    explanationHe: "אחרי מספר גדול מ-1, שם העצם בדרך כלל ברבים: ספרים.",
    explanationEn: "After a number greater than 1, nouns are usually plural: ספרים.",
  },
  {
    wrong: "אני הולכת לבית הספר אתמול.",
    correct: "אני הלכתי לבית הספר אתמול.",
    mistake: "הולכת",
    options: ["הולכת", "הלכתי", "הולך", "ילך"],
    explanationHe: "אתמול = אתמול, לכן צריך זמן עבר: הלכתי.",
    explanationEn: "אתמול = yesterday, so we need past tense: הלכתי.",
  },
  {
    wrong: "השמש ירוקה.",
    correct: "השמש צהובה.",
    mistake: "ירוקה",
    options: ["ירוקה", "צהובה", "כחולה", "אדומה"],
    explanationHe: "השמש צהובה, לא ירוקה!",
    explanationEn: "The sun is yellow (צהובה), not green!",
  },
  {
    wrong: "הוא שתית מים.",
    correct: "הוא שתה מים.",
    mistake: "שתית",
    options: ["שתית", "שתה", "שותה", "ישתה"],
    explanationHe: "שתית = את שתית. עבור הוא (זכר) אומרים שתה.",
    explanationEn: "שתית = you drank. For he (הוא) we say שתה.",
  },
];

export interface HebrewStory {
  title: string;
  text: string;
  /** Pre-vocalized title (nikud) — shown when the nikud toggle is on */
  titleNikud?: string;
  /** Pre-vocalized story text (nikud) — shown when the nikud toggle is on */
  textNikud?: string;
  questions: { question: string; options: string[]; correctIndex: number }[];
}

export const HEBREW_STORIES: HebrewStory[] = [
  {
    title: "הכלב של דני",
    titleNikud: "הַכֶּלֶב שֶׁל דָּנִי",
    text: "לדני יש כלב קטן בשם בובי. בובי אוהב לרוץ בגינה ולשחק עם כדור. ביום שישי, דני לקח את בובי לפארק. שם פגשו ילדים אחרים ושיחקו יחד. בובי היה מאושר מאוד!",
    textNikud:
      "לְדָנִי יֵשׁ כֶּלֶב קָטָן בְּשֵׁם בּוֹבִּי. בּוֹבִּי אוֹהֵב לָרוּץ בַּגִּנָּה וּלְשַׂחֵק עִם כַּדּוּר. בְּיוֹם שִׁשִּׁי, דָּנִי לָקַח אֶת בּוֹבִּי לַפַּארְק. שָׁם פָּגְשׁוּ יְלָדִים אֲחֵרִים וְשִׂחֲקוּ יַחַד. בּוֹבִּי הָיָה מְאֻשָּׁר מְאוֹד!",
    questions: [
      {
        question: "מה שם הכלב?",
        options: ["דני", "בובי", "גינה", "פארק"],
        correctIndex: 1,
      },
      {
        question: "מה בובי אוהב לעשות?",
        options: ["לישון", "לרוץ ולשחק", "לאכול", "ללכת לבית ספר"],
        correctIndex: 1,
      },
      {
        question: "לאן דני לקח את בובי?",
        options: ["לבית ספר", "לחנות", "לפארק", "לים"],
        correctIndex: 2,
      },
    ],
  },
  {
    title: "יום הולדת",
    titleNikud: "יוֹם הֻלֶּדֶת",
    text: "למיה יום הולדת היום! אמא שלה אפתה עוגת שוקולד גדולה. אחותה קישטה את הבית בבלונים צבעוניים. בערב הגיעו חברים ושירו 'יום הולדת שמח'. מיה קיבלה מתנה — ספר על דינוזאורים!",
    textNikud:
      "לְמָיָה יוֹם הֻלֶּדֶת הַיּוֹם! אִמָּא שֶׁלָּהּ אָפְתָה עוּגַת שׁוֹקוֹלָד גְּדוֹלָה. אֲחוֹתָהּ קִשְּׁטָה אֶת הַבַּיִת בַּבָּלוֹנִים צִבְעוֹנִיִּים. בָּעֶרֶב הִגִּיעוּ חֲבֵרִים וְשֶׁיָּרוּ 'יוֹם הֻלֶּדֶת שָׂמֵחַ'. מָיָה קִבְּלָה מַתָּנָה — סֵפֶר עַל דִּינוֹזָאוּרִים!",
    questions: [
      {
        question: "מי חוגג/ת יום הולדת?",
        options: ["אמא", "אחות", "מיה", "חברים"],
        correctIndex: 2,
      },
      {
        question: "מה אמא אפתה?",
        options: ["לחם", "עוגת שוקולד", "פיצה", "סלט"],
        correctIndex: 1,
      },
      {
        question: "מה קיבלה מיה במתנה?",
        options: ["כדור", "בלון", "ספר על דינוזאורים", "משחק"],
        correctIndex: 2,
      },
    ],
  },
];
