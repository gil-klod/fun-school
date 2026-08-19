import type { Locale } from "@/i18n/types";

const MUTE_KEY = "fun-school-mascot-muted";

let speaking = false;
let cachedVoices: SpeechSynthesisVoice[] = [];
let currentAudio: HTMLAudioElement | null = null;
let audioUrl: string | null = null;

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

function hebrewVoices(voices: SpeechSynthesisVoice[]) {
  return voices.filter(
    (v) => v.lang.startsWith("he") || /hebrew|עברית/i.test(v.name)
  );
}

export function hasHebrewBrowserVoice(): boolean {
  if (typeof window === "undefined" || !window.speechSynthesis) return false;
  const voices = cachedVoices.length ? cachedVoices : window.speechSynthesis.getVoices();
  return hebrewVoices(voices).length > 0;
}

/** Call once after user interaction so Chrome loads voice list. */
export function warmSpeechVoices() {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const load = () => {
    cachedVoices = window.speechSynthesis.getVoices();
  };
  load();
  window.speechSynthesis.addEventListener("voiceschanged", load);
}

function waitForVoices(maxMs = 2000): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      resolve([]);
      return;
    }

    const synth = window.speechSynthesis;
    const tryResolve = () => {
      const voices = synth.getVoices();
      if (voices.length > 0) {
        cachedVoices = voices;
        resolve(voices);
        return true;
      }
      return false;
    };

    if (tryResolve()) return;

    const onVoices = () => {
      if (tryResolve()) synth.removeEventListener("voiceschanged", onVoices);
    };
    synth.addEventListener("voiceschanged", onVoices);
    synth.getVoices();

    const start = Date.now();
    const poll = setInterval(() => {
      if (tryResolve() || Date.now() - start > maxMs) {
        clearInterval(poll);
        synth.removeEventListener("voiceschanged", onVoices);
        resolve(synth.getVoices());
      }
    }, 100);
  });
}

function pickVoice(voices: SpeechSynthesisVoice[], locale: Locale): SpeechSynthesisVoice | undefined {
  if (locale === "he") {
    const he = hebrewVoices(voices);
    return (
      he.find((v) => v.lang === "he-IL") ??
      he.find((v) => /google/i.test(v.name)) ??
      he[0]
    );
  }
  return (
    voices.find((v) => v.lang === "en-US") ??
    voices.find((v) => v.lang.startsWith("en-US")) ??
    voices.find((v) => v.lang.startsWith("en"))
  );
}

function clearAudio() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.src = "";
    currentAudio = null;
  }
  if (audioUrl) {
    URL.revokeObjectURL(audioUrl);
    audioUrl = null;
  }
}

export interface SpeakOptions {
  muted?: boolean;
  onStart?: () => void;
  onEnd?: () => void;
}

async function speakViaApi(
  text: string,
  locale: Locale,
  { onStart, onEnd }: SpeakOptions
): Promise<boolean> {
  try {
    const res = await fetch(
      `/api/tts?lang=${locale}&text=${encodeURIComponent(text)}`
    );
    if (!res.ok) return false;

    const blob = await res.blob();
    clearAudio();
    audioUrl = URL.createObjectURL(blob);
    currentAudio = new Audio(audioUrl);

    return await new Promise((resolve) => {
      if (!currentAudio) {
        resolve(false);
        return;
      }
      currentAudio.onplay = () => {
        speaking = true;
        onStart?.();
      };
      currentAudio.onended = () => {
        speaking = false;
        clearAudio();
        onEnd?.();
        resolve(true);
      };
      currentAudio.onerror = () => {
        speaking = false;
        clearAudio();
        onEnd?.();
        resolve(false);
      };
      currentAudio.play().catch(() => {
        speaking = false;
        clearAudio();
        onEnd?.();
        resolve(false);
      });
    });
  } catch {
    return false;
  }
}

function speakViaBrowser(
  spoken: string,
  locale: Locale,
  voice: SpeechSynthesisVoice | undefined,
  { onStart, onEnd }: SpeakOptions
): Promise<boolean> {
  return new Promise((resolve) => {
    if (!window.speechSynthesis) {
      resolve(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(spoken);
    utterance.lang = locale === "he" ? "he-IL" : "en-US";
    utterance.rate = locale === "he" ? 0.92 : 0.98;
    utterance.pitch = locale === "he" ? 1.05 : 1;
    if (voice) utterance.voice = voice;

    utterance.onstart = () => {
      speaking = true;
      onStart?.();
    };
    utterance.onend = () => {
      speaking = false;
      onEnd?.();
      resolve(true);
    };
    utterance.onerror = () => {
      speaking = false;
      resolve(false);
    };

    window.speechSynthesis.speak(utterance);
  });
}

export async function speakText(
  text: string,
  locale: Locale,
  options: SpeakOptions = {}
) {
  if (typeof window === "undefined") return;
  if (options.muted ?? isMascotMuted()) return;

  const spoken = textForSpeech(text);
  if (!spoken) return;

  stopSpeaking();

  const voices = cachedVoices.length ? cachedVoices : await waitForVoices();
  const voice = pickVoice(voices, locale);

  // Hebrew: many desktops (esp. Linux) have no he-IL voice — use server TTS.
  const useApiFirst = locale === "he" && !voice;

  if (useApiFirst) {
    const ok = await speakViaApi(spoken, locale, options);
    if (ok) return;
  }

  const browserOk = await speakViaBrowser(spoken, locale, voice, options);

  if (!browserOk && locale === "he") {
    await speakViaApi(spoken, locale, options);
  }
}

export function stopSpeaking() {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  clearAudio();
  speaking = false;
}

export function isSpeaking() {
  return speaking;
}

export { MUTE_KEY };
