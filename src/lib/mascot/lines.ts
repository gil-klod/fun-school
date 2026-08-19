import type { Locale } from "@/i18n/types";

/** Context id → funny lines Milo can say when tapped. */
export const MASCOT_LINES: Record<Locale, Record<string, string[]>> = {
  he: {
    home: [
      "אני מילו! בחר נושא — אני כבר מחזיק את התשובות... סתם, לא באמת.",
      "ארבעה נושאים, הרבה משחקים, אפס שיעורי בית משעממים!",
      "טיפ מילו: התחל מחשבון — שם המספרים לא מתווכחים. בניגוד לי.",
    ],
    dashboard: [
      "הנה ההתקדמות שלך! אני גאה — כמעט כמו שאמא שלך גאה. כמעט.",
      "סטטיסטיקות! נשמע מבוגר, אבל הגרפים צבעוניים.",
      "אם המספרים נמוכים — זה רק כי לא שיחקת עדיין היום!",
    ],
    "subject.math": [
      "חשבון! המקום שבו מספרים לא מתלוננים. בניגוד לי.",
      "כפל, שוק וחידות — מי אמר שמתמטיקה לא יכולה להיות כיפית?",
      "בוא נראה אם הכפל יכול לעמוד בקצב שלך!",
    ],
    "subject.hebrew": [
      "עברית! האותיות הולכות לכל הכיוונים ואני עדיין מבולבל.",
      "ערבוב אותיות, תיקון משפטים — בלש עברי בדרך!",
      "מילה טובה ביום שומרת את המורה רחוקה. או משהו כזה.",
    ],
    "subject.english-beginners": [
      "זמן אנגלית! אל תדאג — גם אני מתבלבל לפעמים.",
      "אנגלית למתחילים — מילים, משפטים, צבעים. קדימה!",
      "מילה אחת בכל פעם — ואתה כבר מדבר אנגלית. כמעט!",
    ],
    "subject.english-natives": [
      "אנגלית מתקדמת! עכשיו מדברים ברצינות.",
      "דקדוק, אוצר מילים, קריאה — אתה כבר כמעט שם.",
      "מילה מוזרה? אני ממציא הגדרות. בטוח.",
    ],
    "game.math.multiplication": [
      "טבלאות כפל! כמו לחץ, אבל עם מספרים.",
      "בוס הכפל לא מפחיד. רק נראה רציני בגלל החרב.",
      "שבע כפול שמונה? קל. שש כפול שבע? ...תן לי שנייה. אתה קודם!",
    ],
    "game.math.shuk": [
      "שוק! קנה, שלם, קבל עודף — ואל תשכח לחייך לירקן.",
      "עודף זה לא מתנה. לצערי.",
      "חשבון וקניות — אתגר שוק!",
    ],
    "game.math.mystery": [
      "מספר מסתורי! אני חושב שזה ארבעים ושתיים. תמיד. לא? אוקיי.",
      "רמז: זה מספר. עזרתי?",
      "בלש מספרים — המשקפיים על!",
    ],
    "game.hebrew.scramble": [
      "ערבוב אותיות! מ-כ-ח-ו-ל ל... משהו כחול. כנראה.",
      "אותיות מבולבלות? אני מרגיש בבית.",
      "אם נראה לך שזה כלב — בדוק שוב!",
    ],
    "game.hebrew.fix-sentence": [
      "איזו מילה לא שייכת? כמו חתול במקלחת.",
      "תקן את המשפט — המורה תגיד וואו. אולי.",
      "טעות קטנה, תיקון גדול!",
    ],
    "game.hebrew.comprehension": [
      "קרא את הסיפור — יש שאלות. בלי לחשוף את הסוף!",
      "בלש סיפורים! מי? מה? איפה?",
      "לא הבנת? קרא שוב. בקול. עובד!",
    ],
    "game.english-beginners.vocabulary": [
      "התאמת מילים! חתול באנגלית זה קט. כלב זה...",
      "אנגלית ועברית — מילה אחת בכל פעם.",
      "טעות? זה רק סוף השאלה. הבאה!",
    ],
    "game.english-beginners.sentences": [
      "בנה משפט! סדר את המילים נכון — אני סומך עליך.",
      "סדר מילים כמו קוביות — רק בלי לדרוך עליהן.",
      "משפט מושלם שווה נקודות וכבוד!",
    ],
    "game.english-beginners.colors-numbers": [
      "צבעים ומספרים! אדום, כחול, אחד, שתיים, שלוש.",
      "באיזה צבע השמיים? ...ביום. לא בלילה.",
      "מספרים לא משקרים!",
    ],
    "game.english-natives.grammar": [
      "משימת דקדוק! זמנים, רבים, ועוד הפתעות.",
      "עבר, הווה, עתיד — אני מבולבל בכל הזמנים.",
      "דקדוק נכון נשמע חכם!",
    ],
    "game.english-natives.vocabulary": [
      "קוסם המילים! מילים גדולות מרשימות.",
      "מילים נרדפות, הפכים, ומילים שנשמעות מומצאות.",
      "לא יודע? נחש. לפעמים זה עובד!",
    ],
    "game.english-natives.comprehension": [
      "אתגר קריאה! סיפור ארוך, מוח חד.",
      "קרא בעיון. התשובה מסתתרת שם.",
      "הבנה ותשובה — זה הניצחון!",
    ],
    default: [
      "היי! אני מילו — לחץ עליי לעוד חוכמה. או צחוק.",
      "אני כאן! לא עושה שיעורי בית במקומך.",
      "בוא נשחק! המוח שלך מודה לי.",
    ],
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
      "Shuk time! Buy, pay, get change — smile at the vendor.",
      "Change is not a gift. Sadly.",
      "Shopping plus math equals Shuk Challenge!",
    ],
    "game.math.mystery": [
      "Mystery number! I guess forty-two. It's always forty-two. No? Okay.",
      "Hint: it's a number. Helpful?",
      "Number detective — magnifying glass on!",
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
  const lines =
    MASCOT_LINES[locale][context] ??
    MASCOT_LINES[locale].default ??
    MASCOT_LINES.en.default!;
  return lines[Math.floor(Math.random() * lines.length)]!;
}
