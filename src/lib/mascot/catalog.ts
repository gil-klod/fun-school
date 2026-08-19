import type { Locale } from "@/i18n/types";
import type { UserGender } from "@/lib/gender";
import { dictionaries } from "@/i18n";
import { MASCOT_LINES } from "@/lib/mascot/lines";

export interface MiloTextEntry {
  id: string;
  category: "welcome" | "correct" | "wrong" | "context";
  locale: Locale;
  gender?: UserGender;
  context?: string;
  label: string;
  text: string;
}

const SPEECH_KEYS = [
  { key: "mascot.welcome", category: "welcome" as const },
  { key: "mascot.correct0", category: "correct" as const },
  { key: "mascot.correct1", category: "correct" as const },
  { key: "mascot.correct2", category: "correct" as const },
  { key: "mascot.correct3", category: "correct" as const },
  { key: "mascot.wrong0", category: "wrong" as const },
  { key: "mascot.wrong1", category: "wrong" as const },
  { key: "mascot.wrong2", category: "wrong" as const },
];

const HE_GENDER_SPEECH: Record<string, Record<UserGender, string>> = {
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

function mascotEn(key: string): string {
  const shortKey = key.replace("mascot.", "") as keyof typeof dictionaries.en.mascot;
  return dictionaries.en.mascot[shortKey] ?? key;
}

/** All Milo spoken lines for admin preview. */
export function getMiloTextCatalog(): MiloTextEntry[] {
  const entries: MiloTextEntry[] = [];

  for (const { key, category } of SPEECH_KEYS) {
    entries.push({
      id: `en:${key}`,
      category,
      locale: "en",
      label: key,
      text: mascotEn(key),
    });
  }

  for (const { key, category } of SPEECH_KEYS) {
    for (const gender of ["male", "female"] as UserGender[]) {
      entries.push({
        id: `he:${key}:${gender}`,
        category,
        locale: "he",
        gender,
        label: `${key} (${gender})`,
        text: HE_GENDER_SPEECH[key]?.[gender] ?? key,
      });
    }
  }

  for (const [context, lines] of Object.entries(MASCOT_LINES.en)) {
    if (!Array.isArray(lines)) continue;
    lines.forEach((text, index) => {
      entries.push({
        id: `en:context:${context}:${index}`,
        category: "context",
        locale: "en",
        context,
        label: `${context} #${index + 1}`,
        text,
      });
    });
  }

  for (const [context, bucket] of Object.entries(MASCOT_LINES.he)) {
    if (Array.isArray(bucket)) continue;
    for (const gender of ["male", "female"] as UserGender[]) {
      bucket[gender].forEach((text, index) => {
        entries.push({
          id: `he:context:${context}:${gender}:${index}`,
          category: "context",
          locale: "he",
          gender,
          context,
          label: `${context} #${index + 1} (${gender})`,
          text,
        });
      });
    }
  }

  return entries;
}
