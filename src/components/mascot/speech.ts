import type { Locale } from "@/i18n/types";

let speaking = false;

export function speakText(text: string, locale: Locale) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = locale === "he" ? "he-IL" : "en-US";
  utterance.rate = locale === "he" ? 0.95 : 1;
  utterance.pitch = 1.1;

  speaking = true;
  utterance.onend = () => {
    speaking = false;
  };
  utterance.onerror = () => {
    speaking = false;
  };

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  speaking = false;
}

export function isSpeaking() {
  return speaking;
}
