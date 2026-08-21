import type { Locale } from "@/i18n/types";
import { textForSpeech } from "./audioExport";

export interface SpeechSegment {
  locale: Locale;
  text: string;
}

const HEBREW = /[\u0590-\u05FF]/;
const LATIN = /[A-Za-z]/;

/** Split visible text into Hebrew / English chunks for chained TTS. */
export function splitMixedSpeechSegments(text: string): SpeechSegment[] {
  const cleaned = textForSpeech(text.replace(/["""]/g, ""));
  if (!cleaned) return [];

  const segments: SpeechSegment[] = [];
  let buffer = "";
  let bufferLocale: Locale | null = null;

  const flush = () => {
    const chunk = buffer.trim();
    if (chunk && bufferLocale) segments.push({ locale: bufferLocale, text: chunk });
    buffer = "";
    bufferLocale = null;
  };

  for (const token of cleaned.match(/[\u0590-\u05FF]+|[A-Za-z][A-Za-z0-9''-]*|\d+/g) ?? []) {
    const locale: Locale = HEBREW.test(token) ? "he" : "en";
    if (bufferLocale === locale) {
      buffer = buffer ? `${buffer} ${token}` : token;
    } else {
      flush();
      buffer = token;
      bufferLocale = locale;
    }
  }
  flush();

  const punctTail = cleaned.match(/[^\w\u0590-\u05FF\s]+$/)?.[0];
  if (punctTail && segments.length > 0) {
    segments[segments.length - 1]!.text += punctTail;
  }

  return segments;
}

export function isMixedLanguageText(text: string): boolean {
  const cleaned = textForSpeech(text);
  return HEBREW.test(cleaned) && LATIN.test(cleaned);
}
