import type { Locale } from "@/i18n/types";

const MUTE_KEY = "fun-school-mascot-muted";

let speaking = false;
let voicesReady = false;

export function isMascotMuted(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(MUTE_KEY) === "1";
}

export function setMascotMuted(muted: boolean) {
  if (typeof window === "undefined") return;
  localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
  if (muted) stopSpeaking();
}

/** Remove emoji/symbols TTS reads aloud oddly. */
export function textForSpeech(text: string): string {
  return text
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}]/gu, "")
    .replace(/[⚔️🛒🔍🔤✏️🕵️🎯🧩🌈📝🧙📚👏⭐🎒🎉💪💡🌟🏆]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function waitForVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      resolve([]);
      return;
    }

    const synth = window.speechSynthesis;
    const existing = synth.getVoices();
    if (existing.length > 0) {
      voicesReady = true;
      resolve(existing);
      return;
    }

    const onVoices = () => {
      voicesReady = true;
      synth.removeEventListener("voiceschanged", onVoices);
      resolve(synth.getVoices());
    };
    synth.addEventListener("voiceschanged", onVoices);
    // Chrome loads voices async; nudge once
    synth.getVoices();
    setTimeout(() => resolve(synth.getVoices()), 250);
  });
}

function pickVoice(voices: SpeechSynthesisVoice[], locale: Locale): SpeechSynthesisVoice | undefined {
  if (locale === "he") {
    return (
      voices.find((v) => v.lang === "he-IL") ??
      voices.find((v) => v.lang.startsWith("he")) ??
      voices.find((v) => /hebrew|עברית/i.test(v.name))
    );
  }
  return (
    voices.find((v) => v.lang === "en-US") ??
    voices.find((v) => v.lang.startsWith("en-US")) ??
    voices.find((v) => v.lang.startsWith("en"))
  );
}

export interface SpeakOptions {
  muted?: boolean;
  onStart?: () => void;
  onEnd?: () => void;
}

export async function speakText(
  text: string,
  locale: Locale,
  { muted, onStart, onEnd }: SpeakOptions = {}
) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  if (muted ?? isMascotMuted()) return;

  const spoken = textForSpeech(text);
  if (!spoken) return;

  window.speechSynthesis.cancel();

  const voices = voicesReady ? window.speechSynthesis.getVoices() : await waitForVoices();
  const utterance = new SpeechSynthesisUtterance(spoken);
  utterance.lang = locale === "he" ? "he-IL" : "en-US";
  utterance.rate = locale === "he" ? 0.92 : 0.98;
  utterance.pitch = locale === "he" ? 1.05 : 1;

  const voice = pickVoice(voices, locale);
  if (voice) utterance.voice = voice;

  speaking = true;
  utterance.onstart = () => onStart?.();
  utterance.onend = () => {
    speaking = false;
    onEnd?.();
  };
  utterance.onerror = () => {
    speaking = false;
    onEnd?.();
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

export { MUTE_KEY };
