import type { Locale } from "@/i18n/types";
import type { UserGender } from "@/lib/gender";

type LineInput = string | { male: string; female: string };

function genderLines(lines: LineInput[]): Record<UserGender, string[]> {
  return {
    male: lines.map((line) => (typeof line === "string" ? line : line.male)),
    female: lines.map((line) => (typeof line === "string" ? line : line.female)),
  };
}

/** Context id → funny lines Milo can say when tapped. */
export const MASCOT_LINES: Record<
  Locale,
  Record<string, string[] | Record<UserGender, string[]>>
> = {
  he: {
    home: genderLines([
      {
        male: "אני מיילו! בחר נושא, — אני כבר מחזיק את התשובות. סתם, לא באמת.",
        female: "אני מיילו! בחרי נושא, — אני כבר מחזיקה את התשובות. סתם, לא באמת.",
      },
      "ארבעה נושאים, הרבה משחקים, ואפס שיעורי בית משעממים!",
      "טיפ מיילו: התחל מחשבון, — שם המספרים לא מתווכחים. בניגוד לי.",
    ]),
    dashboard: genderLines([
      "הנה ההתקדמות שלך! ממש מרשים, — כמעט כמו שאמא שלך אומרת. כמעט.",
      "סטטיסטיקות! נשמע מבוגר, אבל הגרפים צבעוניים.",
      {
        male: "אם המספרים נמוכים, — זה רק כי לא שיחקת עדיין היום!",
        female: "אם המספרים נמוכים, — זה רק כי לא שיחקת עדיין היום!",
      },
    ]),
    "subject.math": genderLines([
      "חשבון! המקום שבו מספרים לא מתלוננים. בניגוד לי.",
      "כפל, שוק וחידות, — מי אמר שמתמטיקה לא יכולה להיות כיפית?",
      { male: "בוא, נראה אם הכפל יכול לעמוד בקצב שלך!", female: "בואי, נראה אם הכפל יכול לעמוד בקצב שלך!" },
    ]),
    "subject.hebrew": genderLines([
      "עברית! האותיות הולכות לכל הכיוונים, ואני עדיין מבולבל.",
      "ערבוב אותיות, תיקון משפטים, — בלש עברי בדרך!",
      "מילה טובה ביום, שומרת את המורה רחוקה. או משהו כזה.",
    ]),
    "subject.english-beginners": genderLines([
      "זמן אנגלית! אל תדאג, — גם אני מתבלבל לפעמים.",
      "אנגלית למתחילים, — מילים, משפטים, צבעים. קדימה!",
      {
        male: "מילה אחת בכל פעם, — ואתה כבר מדבר אנגלית. כמעט!",
        female: "מילה אחת בכל פעם, — ואת כבר מדברת אנגלית. כמעט!",
      },
    ]),
    "subject.english-natives": genderLines([
      "אנגלית מתקדמת! עכשיו מדברים ברצינות.",
      {
        male: "דקדוק, אוצר מילים, קריאה, — אתה כבר כמעט שם.",
        female: "דקדוק, אוצר מילים, קריאה, — את כבר כמעט שם.",
      },
      "מילה מוזרה? אני ממציא הגדרות. בטוח.",
    ]),
    "game.math.multiplication": genderLines([
      "טבלאות כפל! כמו לחץ, אבל עם מספרים.",
      "בוס הכפל לא מפחיד. רק נראה רציני בגלל החרב.",
      {
        male: "שבע כפול שמונה? קל. שש כפול שבע? תן לי שנייה, אתה קודם!",
        female: "שבע כפול שמונה? קל. שש כפול שבע? תני לי שנייה, את קודם!",
      },
    ]),
    "game.math.shuk": genderLines([
      "שוק! קנה, שלם, קבל עודף, — ואל תשכח לחייך לירקן.",
      "עודף זה לא מתנה. לצערי.",
      "חשבון וקניות, — אתגר שוק!",
    ]),
    "game.math.mystery": genderLines([
      "מספר מסתורי! אני חושב שזה ארבעים ושתיים. תמיד. לא? אוקיי.",
      "רמז: זה מספר. עזרתי?",
      "בלש מספרים, — המשקפיים על!",
    ]),
    "game.math.analog-clock": genderLines([
      "שעון מחוגים! המחוג הקצר — שעות. הארוך — דקות. קל, נכון?",
      "מה השעה? לא, אל תסתכל על הטלפון!",
      "תיקון: זה לא שעון דיגיטלי. אבל כיף!",
    ]),
    "game.math.sequences": genderLines([
      "סדרות מספרים! 2, 4, 6, — מה בא אחר כך?",
      "מצא את הדפוס, — ואז תעוף!",
      "מספרים ברצף, — כמו צעדי ריקוד!",
    ]),
    "game.hebrew.scramble": genderLines([
      "ערבוב אותיות! מ-כ-ח-ו-ל ל... משהו כחול. כנראה.",
      "אותיות מבולבלות? אני מרגיש בבית.",
      { male: "אם נראה לך שזה כלב, — בדוק שוב!", female: "אם נראה לך שזה כלב, — בדקי שוב!" },
    ]),
    "game.hebrew.fix-sentence": genderLines([
      "איזו מילה לא שייכת? כמו חתול במקלחת.",
      { male: "תקן את המשפט, — המורה תגיד וואו. אולי.", female: "תקני את המשפט, — המורה תגיד וואו. אולי." },
      "טעות קטנה, תיקון גדול!",
    ]),
    "game.hebrew.comprehension": genderLines([
      {
        male: "קרא את הסיפור, — יש שאלות. בלי לחשוף את הסוף!",
        female: "קראי את הסיפור, — יש שאלות. בלי לחשוף את הסוף!",
      },
      "בלש סיפורים! מי? מה? איפה?",
      {
        male: "לא ברור? קרא את הסיפור שוב, בקול גבוה. זה עוזר!",
        female: "לא ברור? קראי את הסיפור שוב, בקול גבוה. זה עוזר!",
      },
    ]),
    "game.english-beginners.vocabulary": genderLines([
      "חיבור מילים! תרגום נכון לכל מילה, — ועוד נקודה!",
      "אנגלית ועברית, — מילה אחת בכל פעם.",
      "טעות? זה רק סוף השאלה. הבאה!",
    ]),
    "game.english-beginners.sentences": genderLines([
      {
        male: "הרכב משפט! סדר את המילים נכון, — אני סומך עליך.",
        female: "הרכיבי משפט! סדרי את המילים נכון, — אני סומכת עלייך.",
      },
      "סדר מילים כמו קוביות, — רק בלי לדרוך עליהן.",
      "משפט נכון שווה נקודות וניצחון!",
    ]),
    "game.english-beginners.colors-numbers": genderLines([
      "צבעים ומספרים! אדום, כחול, אחד, שתיים, שלוש.",
      "באיזה צבע השמיים? ...ביום. לא בלילה.",
      "מספרים לא משקרים!",
    ]),
    "game.english-natives.grammar": genderLines([
      "משימת דקדוק! זמנים, רבים, ועוד הפתעות.",
      "עבר, הווה, עתיד, — אני מבולבל בכל הזמנים.",
      "דקדוק נכון נשמע חכם!",
    ]),
    "game.english-natives.vocabulary": genderLines([
      "קוסם המילים! מילים גדולות מרשימות.",
      "מילים נרדפות, הפכים, ומילים שנשמעות מומצאות.",
      { male: "לא יודע? נחש. לפעמים זה עובד!", female: "לא יודעת? נחשי. לפעמים זה עובד!" },
    ]),
    "game.english-natives.comprehension": genderLines([
      "אתגר קריאה! סיפור ארוך, מוח חד.",
      { male: "קרא בעיון. התשובה מסתתרת שם.", female: "קראי בעיון. התשובה מסתתרת שם." },
      "הבנה ותשובה, — זה הניצחון!",
    ]),
    default: genderLines([
      {
        male: "היי! אני מיילו, — לחץ עליי לעוד חוכמה. או צחוק.",
        female: "היי! אני מיילו, — לחצי עליי לעוד חוכמה. או צחוק.",
      },
      "אני כאן בשבילך, — אבל לא עובד במקומך.",
      { male: "יאללה, נתחיל! המוח שלך מודה לי.", female: "יאללה, נתחיל! המוח שלך מודה לי." },
    ]),
  },
  en: {
    home: [
      "I'm Milo! Pick a subject — I totally know all the answers. Just kidding.",
      "Four subjects, tons of games, zero boring homework. Deal?",
      "Milo tip: start with math. Numbers never talk back. Unlike me.",
    ],
    dashboard: [
      "Your progress! I'm proud — almost as proud as your mom. Almost.",
      "Stats! Sounds grown-up, but the charts are colorful.",
      "Numbers look low? You just haven't played today yet!",
    ],
    "subject.math": [
      "Math! Where numbers don't complain. Unlike me.",
      "Multiply, shop, solve mysteries — math is an adventure!",
      "Let's see if the times tables can keep up with you!",
    ],
    "subject.hebrew": [
      "Hebrew! Letters go every direction and I'm still confused.",
      "Scramble, fix sentences, story detective — let's go!",
      "One good word a day keeps the teacher away. Maybe.",
    ],
    "subject.english-beginners": [
      "English time! I still mix up words sometimes. You got this.",
      "Words, sentences, colors — let's go!",
      "One word at a time and you're basically fluent. Almost.",
    ],
    "subject.english-natives": [
      "Advanced English! Now we're talking — literally.",
      "Grammar, vocab, reading — you're basically native. Almost.",
      "Weird word? I invent definitions. Trust me.",
    ],
    "game.math.multiplication": [
      "Times tables! Like a workout, but with numbers.",
      "Multiplication Boss looks tough. It's the sword, not the math.",
      "Seven times eight? Easy. Six times seven? ...you go first!",
    ],
    "game.math.shuk": [
      "Market time! Buy, pay, get change — smile at the vendor.",
      "Change is not a gift. Sadly.",
      "Shopping plus math equals Market Challenge!",
    ],
    "game.math.mystery": [
      "Mystery number! I guess forty-two. It's always forty-two. No? Okay.",
      "Hint: it's a number. Helpful?",
      "Number detective — magnifying glass on!",
    ],
    "game.math.analog-clock": [
      "Analog clock! Short hand = hours. Long hand = minutes. Easy, right?",
      "What time is it? Don't peek at your phone!",
      "Not a digital clock — but more fun!",
    ],
    "game.math.sequences": [
      "Number sequences! 2, 4, 6 — what comes next?",
      "Spot the pattern, then fly!",
      "Numbers in a row — like dance steps!",
    ],
    "game.hebrew.scramble": [
      "Scrambled letters! Mixed up? I feel right at home.",
      "Turn the letters around until they make sense!",
      "Looks like dog? Double-check. Or send it. No judge here.",
    ],
    "game.hebrew.fix-sentence": [
      "Which word is wrong? Like a cat in a shower — something's off.",
      "Fix the sentence — teacher might say wow. Maybe.",
      "Tiny mistake, big fix!",
    ],
    "game.hebrew.comprehension": [
      "Read the story — then answer. I already read it. No spoilers!",
      "Story detective! Who? What? Where?",
      "Didn't get it? Read again. Out loud. Works!",
    ],
    "game.english-beginners.vocabulary": [
      "Word match! Your turn — you've got this.",
      "English and Hebrew — one word at a time.",
      "Wrong? Only the question ends. Next!",
    ],
    "game.english-beginners.sentences": [
      "Build a sentence! Put the words in order — trust me.",
      "Words like building blocks.",
      "Perfect sentence equals points and glory!",
    ],
    "game.english-beginners.colors-numbers": [
      "Colors and numbers! Red, blue, one, two, three.",
      "What color is the sky? ...in the daytime.",
      "Numbers never lie!",
    ],
    "game.english-natives.grammar": [
      "Grammar quest! Tenses and plurals — English is wild.",
      "Past, present, future — confused in all tenses.",
      "Good grammar sounds smart!",
    ],
    "game.english-natives.vocabulary": [
      "Word wizard! Big words impress teachers.",
      "Synonyms, antonyms, and words that sound fake.",
      "Don't know? Guess. Sometimes it works!",
    ],
    "game.english-natives.comprehension": [
      "Reading challenge! Long story, sharp brain.",
      "Read carefully. The answer is hiding.",
      "Understand plus answer equals victory!",
    ],
    default: [
      "Hey! I'm Milo — tap me for wisdom. Or jokes.",
      "I'm here! I won't do your homework though. Sorry.",
      "Let's play! Your brain will thank me.",
    ],
  },
};

export function resolveMascotContext(pathname: string): string {
  if (pathname === "/") return "home";
  if (pathname === "/dashboard") return "dashboard";

  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 1) return `subject.${parts[0]}`;
  if (parts.length >= 2) return `game.${parts[0]}.${parts[1]}`;

  return "default";
}

export function pickContextLine(locale: Locale, context: string): string {
  const bucket = MASCOT_LINES[locale][context] ?? MASCOT_LINES[locale].default ?? MASCOT_LINES.en.default;
  const lines = Array.isArray(bucket) ? bucket : bucket.male;
  return lines[Math.floor(Math.random() * lines.length)]!;
}
