/** Node-safe exports for the audio generation script (no "use client"). */
export { miloAudioFilename } from "./audio";
import { punctuateHebrewForSpeech } from "./hebrewSpeech";

export function textForSpeech(text: string): string {
  return text
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}]/gu, "")
    .replace(/[⚔️🛒🔍🔤✏️🕵️🎯🧩🌈📝🧙📚👏⭐🎒🎉💪💡🌟🏆]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function miloSpeechText(text: string, locale: "he" | "en"): string {
  const cleaned = textForSpeech(text);
  if (!cleaned) return "";
  return locale === "he" ? punctuateHebrewForSpeech(cleaned) : cleaned;
}
