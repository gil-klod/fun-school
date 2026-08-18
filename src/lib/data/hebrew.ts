export interface HebrewWord {
  word: string;
  hint: string;
  category: string;
}

export const HEBREW_WORDS: HebrewWord[] = [
  { word: "ספר", hint: "Something you read", category: "school" },
  { word: "בית", hint: "Where you live", category: "home" },
  { word: "כלב", hint: "A pet that barks", category: "animals" },
  { word: "שמש", hint: "Shines in the sky", category: "nature" },
  { word: "ילד", hint: "A young person", category: "people" },
  { word: "מים", hint: "You drink this", category: "nature" },
  { word: "פרח", hint: "Grows in a garden", category: "nature" },
  { word: "עוגה", hint: "Sweet birthday food", category: "food" },
  { word: "חלום", hint: "What you see when sleeping", category: "abstract" },
  { word: "ידיד", hint: "Someone you play with", category: "people" },
  { word: "כדור", hint: "Round thing you kick", category: "sports" },
  { word: "מורה", hint: "Teaches at school", category: "school" },
];

export function scrambleWord(word: string): string {
  const chars = word.split("");
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  const scrambled = chars.join("");
  return scrambled === word ? scrambleWord(word) : scrambled;
}

export interface FixSentenceQuestion {
  wrong: string;
  correct: string;
  mistake: string;
  options: string[];
  explanation: string;
}

export const FIX_SENTENCES: FixSentenceQuestion[] = [
  {
    wrong: "הילדה אכלת תפוח.",
    correct: "הילדה אכלה תפוח.",
    mistake: "אכלת",
    options: ["אכלת", "אכל", "אוכל", "אוכלת"],
    explanation: "אכלת = you (f.) ate. The subject is הילדה (she), so we need אכלה.",
  },
  {
    wrong: "הכלבים רץ בגינה.",
    correct: "הכלבים רצים בגינה.",
    mistake: "רץ",
    options: ["רץ", "רצים", "רצה", "רצות"],
    explanation: "כלבים is plural, so the verb needs plural form: רצים.",
  },
  {
    wrong: "יש לי שלושה ספר.",
    correct: "יש לי שלושה ספרים.",
    mistake: "ספר",
    options: ["ספר", "ספרים", "ספריה", "ספרון"],
    explanation: "After a number greater than 1, nouns are usually plural: ספרים.",
  },
  {
    wrong: "אני הולכת לבית הספר אתמול.",
    correct: "אני הלכתי לבית הספר אתמול.",
    mistake: "הולכת",
    options: ["הולכת", "הלכתי", "הולך", "ילך"],
    explanation: "אתמול = yesterday, so we need past tense: הלכתי.",
  },
  {
    wrong: "השמש ירוקה.",
    correct: "השמש צהובה.",
    mistake: "ירוקה",
    options: ["ירוקה", "צהובה", "כחולה", "אדומה"],
    explanation: "The sun is yellow (צהובה), not green!",
  },
  {
    wrong: "הוא שתית מים.",
    correct: "הוא שתה מים.",
    mistake: "שתית",
    options: ["שתית", "שתה", "שותה", "ישתה"],
    explanation: "שתית = you drank. For he (הוא) we say שתה.",
  },
];

export interface HebrewStory {
  title: string;
  text: string;
  questions: { question: string; options: string[]; correctIndex: number }[];
}

export const HEBREW_STORIES: HebrewStory[] = [
  {
    title: "הכלב של דני",
    text: "לדני יש כלב קטן בשם בובי. בובי אוהב לרוץ בגינה ולשחק עם כדור. ביום שישי, דני לקח את בובי לפארק. שם פגשו ילדים אחרים ושיחקו יחד. בובי היה מאושר מאוד!",
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
    text: "למיה יום הולדת היום! אמא שלה אפתה עוגת שוקולד גדולה. אחותה קישטה את הבית בבלונים צבעוניים. בערב הגיעו חברים ושירו 'יום הולדת שמח'. מיה קיבלה מתנה — ספר על דינוזאורים!",
    questions: [
      {
        question: "מי חוגג/ת יום הולדת?",
        options: ["אמא", "אחות", "מיה", "חברים"],
        correctIndex: 2,
      },
      {
        question: "מה אמא אפתה?",
        options: ["לחם", "עוגת שוקולד", "פizza", "סלט"],
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
