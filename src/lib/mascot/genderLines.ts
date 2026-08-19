import type { Locale } from "@/i18n/types";
import type { UserGender } from "@/lib/gender";
import { MASCOT_LINES, pickContextLine as pickContextLineBase, resolveMascotContext } from "./lines";

/** Hebrew Milo speech with masculine / feminine second-person forms. */
const MASCOT_SPEECH_HE: Record<string, Record<UserGender, string>> = {
  "mascot.welcome": {
    male: "היי! אני מילו 🎒 בחר נושא ובוא נשחק!",
    female: "היי! אני מילו 🎒 בחרי נושא ובואי נשחק!",
  },
  "mascot.correct0": {
    male: "מדהים! כפיים כפיים! 👏",
    female: "מדהימה! כפיים כפיים! 👏",
  },
  "mascot.correct1": {
    male: "אתה בוער! המשך כך!",
    female: "את בוערת! המשיכי כך!",
  },
  "mascot.correct2": {
    male: "מבריק! ידעתי שתצליח!",
    female: "מבריקה! ידעתי שתצליחי!",
  },
  "mascot.correct3": {
    male: "כוכב על! ⭐",
    female: "כוכבת על! ⭐",
  },
  "mascot.wrong0": {
    male: "כמעט! נסה שוב — אתה יכול!",
    female: "כמעט! נסי שוב — את יכולה!",
  },
  "mascot.wrong1": {
    male: "לא נורא! מכל טעות לומדים.",
    female: "לא נורא! מכל טעות לומדים.",
  },
  "mascot.wrong2": {
    male: "קרוב! נעיף את השאלה הבאה!",
    female: "קרוב! נעיף את השאלה הבאה!",
  },
};

export function getMascotSpeechLine(
  locale: Locale,
  key: string,
  gender: UserGender,
  t: (key: string) => string
): string {
  if (locale !== "he") return t(key);
  return MASCOT_SPEECH_HE[key]?.[gender] ?? t(key);
}

export function pickContextLine(locale: Locale, context: string, gender: UserGender): string {
  if (locale !== "he") {
    return pickContextLineBase(locale, context);
  }

  const bucket =
    MASCOT_LINES.he[context] ??
    MASCOT_LINES.he.default;
  const lines = Array.isArray(bucket) ? bucket : bucket[gender];
  return lines[Math.floor(Math.random() * lines.length)]!;
}

export { resolveMascotContext };
