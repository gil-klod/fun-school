import type { Locale } from "@/i18n/types";
import type { UserGender } from "@/lib/gender";
import type { MiloLine } from "@/lib/mascot/audio";
import { contextLineAudioId, speechLineAudioId } from "@/lib/mascot/audio";
import { MASCOT_LINES, resolveMascotContext } from "./lines";

/** Hebrew Milo speech with masculine / feminine second-person forms. */
export const MASCOT_SPEECH_HE: Record<string, Record<UserGender, string>> = {
  "mascot.welcome": {
    male: "היי! אני מיילו. בחר נושא, ובוא נשחק!",
    female: "היי! אני מיילו. בחרי נושא, ובואי נשחק!",
  },
  "mascot.correct0": {
    male: "מדהים! כפיים, כפיים!",
    female: "מדהימה! כפיים, כפיים!",
  },
  "mascot.correct1": {
    male: "אתה בוער! המשך כך!",
    female: "את בוערת! המשיכי כך!",
  },
  "mascot.correct2": {
    male: "מבריק! ידעתי, שתצליח!",
    female: "מבריקה! ידעתי, שתצליחי!",
  },
  "mascot.correct3": {
    male: "כוכב על!",
    female: "כוכבת על!",
  },
  "mascot.wrong0": {
    male: "כמעט! נסה שוב, אתה יכול!",
    female: "כמעט! נסי שוב, את יכולה!",
  },
  "mascot.wrong1": {
    male: "לא נורא! מכל טעות, לומדים.",
    female: "לא נורא! מכל טעות, לומדים.",
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
): MiloLine {
  if (locale !== "he") {
    return {
      text: t(key),
      audioId: speechLineAudioId("en", key),
    };
  }
  return {
    text: MASCOT_SPEECH_HE[key]?.[gender] ?? t(key),
    audioId: speechLineAudioId("he", key, gender),
  };
}

export function pickContextLine(locale: Locale, context: string, gender: UserGender): MiloLine {
  if (locale !== "he") {
    const bucket = MASCOT_LINES.en[context] ?? MASCOT_LINES.en.default;
    const lines = Array.isArray(bucket) ? bucket : bucket.male;
    const index = Math.floor(Math.random() * lines.length);
    return {
      text: lines[index]!,
      audioId: contextLineAudioId("en", context, index),
    };
  }

  const bucket = MASCOT_LINES.he[context] ?? MASCOT_LINES.he.default;
  const lines = Array.isArray(bucket) ? bucket : bucket[gender];
  const index = Math.floor(Math.random() * lines.length);
  return {
    text: lines[index]!,
    audioId: contextLineAudioId("he", context, index, gender),
  };
}

export { resolveMascotContext };
