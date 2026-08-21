import type { Locale } from "@/i18n/types";
import type { MiloAudioId } from "@/lib/mascot/audio";
import { miloAudioUrl } from "@/lib/mascot/audio";
import { miloSpeechText } from "@/lib/mascot/audioExport";
import { splitMixedSpeechSegments, type SpeechSegment } from "@/lib/mascot/mixedSpeech";

const MUTE_KEY = "fun-school-mascot-muted";

let speaking = false;
let speakGeneration = 0;
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

function isMobileDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

/** Prefer device voices on mobile when API TTS is slow or blocked. */
function preferBrowserHebrew(): boolean {
  return isMobileDevice();
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
    currentAudio.onplay = null;
    currentAudio.onended = null;
    currentAudio.onerror = null;
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
  audioId?: MiloAudioId;
  /** Skip pre-recorded MP3 and use online/browser TTS (admin preview). */
  preferTts?: boolean;
  onStart?: () => void;
  onEnd?: () => void;
}

async function hasRecordedAudio(src: string): Promise<boolean> {
  try {
    const res = await fetch(src, { method: "HEAD" });
    if (!res.ok) return false;
    const type = res.headers.get("content-type") ?? "";
    return type.includes("audio") || type.includes("octet-stream");
  } catch {
    return false;
  }
}

function playAudioFile(src: string, options: SpeakOptions): Promise<boolean> {
  return new Promise((resolve) => {
    clearAudio();
    let settled = false;
    const finish = (ok: boolean) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (!ok) {
        speaking = false;
        clearAudio();
      }
      resolve(ok);
    };

    const timer = setTimeout(() => finish(false), 2500);
    currentAudio = new Audio(src);

    currentAudio.onplay = () => {
      speaking = true;
      options.onStart?.();
    };
    currentAudio.onended = () => {
      speaking = false;
      clearAudio();
      options.onEnd?.();
      finish(true);
    };
    currentAudio.onerror = () => finish(false);

    currentAudio.play().catch(() => finish(false));
  });
}

async function speakViaApi(
  text: string,
  locale: Locale,
  options: SpeakOptions
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
        options.onStart?.();
      };
      currentAudio.onended = () => {
        speaking = false;
        clearAudio();
        options.onEnd?.();
        resolve(true);
      };
      currentAudio.onerror = () => {
        speaking = false;
        clearAudio();
        options.onEnd?.();
        resolve(false);
      };
      currentAudio.play().catch(() => {
        speaking = false;
        clearAudio();
        options.onEnd?.();
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
  options: SpeakOptions
): Promise<boolean> {
  return new Promise((resolve) => {
    if (!window.speechSynthesis) {
      resolve(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(spoken);
    utterance.lang = locale === "he" ? "he-IL" : "en-US";
    utterance.rate = locale === "he" ? 0.88 : 0.98;
    utterance.pitch = locale === "he" ? 1.05 : 1;
    if (voice) utterance.voice = voice;

    utterance.onstart = () => {
      speaking = true;
      options.onStart?.();
    };
    utterance.onend = () => {
      speaking = false;
      options.onEnd?.();
      resolve(true);
    };
    utterance.onerror = () => {
      speaking = false;
      options.onEnd?.();
      resolve(false);
    };

    window.speechSynthesis.speak(utterance);
  });
}

async function fetchTtsBlob(text: string, locale: Locale): Promise<Blob | null> {
  const spoken = miloSpeechText(text, locale);
  if (!spoken) return null;
  try {
    const res = await fetch(`/api/tts?lang=${locale}&text=${encodeURIComponent(spoken)}`);
    if (!res.ok) return null;
    return res.blob();
  } catch {
    return null;
  }
}

async function fetchMixedTtsBlob(segments: SpeechSegment[]): Promise<Blob | null> {
  try {
    const res = await fetch("/api/tts/mixed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        segments: segments.map((segment) => ({
          lang: segment.locale,
          text: segment.text,
        })),
      }),
    });
    if (!res.ok) return null;
    return res.blob();
  } catch {
    return null;
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const MIXED_SEGMENT_GAP_MS = 120;

/** Play one fetched clip; waits until audio fully finishes. */
function playTtsBlob(
  blob: Blob,
  gen: number,
  options: Pick<SpeakOptions, "onStart">
): Promise<boolean> {
  return new Promise((resolve) => {
    clearAudio();
    audioUrl = URL.createObjectURL(blob);
    const audio = new Audio();
    audio.preload = "auto";
    currentAudio = audio;

    let settled = false;
    const finish = (ok: boolean) => {
      if (settled) return;
      settled = true;
      if (gen !== speakGeneration) {
        clearAudio();
        speaking = false;
        resolve(false);
        return;
      }
      speaking = false;
      clearAudio();
      resolve(ok);
    };

    audio.onplay = () => {
      speaking = true;
      options.onStart?.();
    };
    audio.onended = () => finish(true);
    audio.onerror = () => finish(false);

    audio.addEventListener(
      "canplaythrough",
      () => {
        if (gen !== speakGeneration) {
          finish(false);
          return;
        }
        audio.play().catch(() => finish(false));
      },
      { once: true }
    );

    audio.src = audioUrl;
    audio.load();
  });
}

async function playMixedSegmentsChained(
  segments: SpeechSegment[],
  gen: number,
  options: SpeakOptions
): Promise<void> {
  let started = false;
  const blobs = await Promise.all(
    segments.map((segment) => fetchTtsBlob(segment.text, segment.locale))
  );

  if (gen !== speakGeneration) return;

  for (let i = 0; i < segments.length; i++) {
    if (gen !== speakGeneration) return;

    if (i > 0) {
      await delay(MIXED_SEGMENT_GAP_MS);
      if (gen !== speakGeneration) return;
    }

    const blob = blobs[i];
    if (blob) {
      await playTtsBlob(blob, gen, {
        onStart: started
          ? undefined
          : () => {
              started = true;
              options.onStart?.();
            },
      });
      continue;
    }

    const { text: segmentText, locale } = segments[i]!;
    await speakSegmentOnly(
      segmentText,
      locale,
      {
        muted: options.muted,
        onStart: started
          ? undefined
          : () => {
              started = true;
              options.onStart?.();
            },
      },
      true
    );
  }
}

async function speakSegmentOnly(
  text: string,
  locale: Locale,
  options: Pick<SpeakOptions, "muted" | "onStart" | "onEnd">,
  apiOnly = false
): Promise<boolean> {
  const spoken = miloSpeechText(text, locale);
  if (!spoken) return false;

  if (!apiOnly) {
    const voices = cachedVoices.length ? cachedVoices : await waitForVoices();
    const voice = pickVoice(voices, locale);
    const tryBrowserFirst = locale === "he" && preferBrowserHebrew() && !!voice;

    if (tryBrowserFirst) {
      const browserOk = await speakViaBrowser(spoken, locale, voice, options);
      if (browserOk) return true;
    }
  }

  const apiOk = await speakViaApi(spoken, locale, options);
  if (apiOk) return true;

  if (apiOnly) return false;

  const voices = cachedVoices.length ? cachedVoices : await waitForVoices();
  const voice = pickVoice(voices, locale);
  const allowBrowser = locale === "en" || (locale === "he" && !!voice);
  if (allowBrowser) {
    return speakViaBrowser(spoken, locale, voice, options);
  }

  return false;
}

/**
 * Read mixed Hebrew/English like a person: Hebrew chunks in Hebrew, English in English.
 */
export async function speakMixedText(text: string, options: SpeakOptions = {}) {
  if (typeof window === "undefined") return;
  if (options.muted ?? isMascotMuted()) {
    options.onEnd?.();
    return;
  }

  const segments = splitMixedSpeechSegments(text);
  if (!segments.length) {
    options.onEnd?.();
    return;
  }

  if (segments.length === 1) {
    await speakText(segments[0]!.text, segments[0]!.locale, { ...options, audioId: undefined });
    return;
  }

  stopSpeaking();
  const gen = speakGeneration;

  const stitched = await fetchMixedTtsBlob(segments);
  if (gen !== speakGeneration) return;

  if (stitched) {
    await playTtsBlob(stitched, gen, { onStart: () => options.onStart?.() });
    if (gen === speakGeneration) options.onEnd?.();
    return;
  }

  await playMixedSegmentsChained(segments, gen, options);

  if (gen === speakGeneration) {
    options.onEnd?.();
  }
}

/**
 * 1. Pre-recorded MP3 (public/audio/milo/) when audioId is set
 * 2. Simple online TTS (/api/tts) when clip is missing or fails
 * 3. Device TTS as last resort (English everywhere; Hebrew when a voice exists)
 */
export async function speakText(
  text: string,
  locale: Locale,
  options: SpeakOptions = {}
) {
  if (typeof window === "undefined") return;
  if (options.muted ?? isMascotMuted()) {
    options.onEnd?.();
    return;
  }

  const spoken = miloSpeechText(text, locale);
  if (!spoken) {
    options.onEnd?.();
    return;
  }

  stopSpeaking();

  if (options.audioId && !options.preferTts) {
    const src = miloAudioUrl(options.audioId);
    if (await hasRecordedAudio(src)) {
      const played = await playAudioFile(src, options);
      if (played) return;
    }
  }

  await speakSegmentOnly(spoken, locale, options);
}

export function stopSpeaking() {
  speakGeneration++;
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  clearAudio();
  speaking = false;
}

export function isSpeaking() {
  return speaking;
}

const TTS_CHUNK_CHARS = 250;

function splitSpeechChunks(text: string, maxLen = TTS_CHUNK_CHARS): string[] {
  if (text.length <= maxLen) return [text];

  const sentences = text.split(/(?<=[.!?…])\s+/).filter(Boolean);
  if (sentences.length === 0) return [text.slice(0, maxLen)];

  const chunks: string[] = [];
  let buf = "";
  for (const sentence of sentences) {
    const next = buf ? `${buf} ${sentence}` : sentence;
    if (next.length <= maxLen) {
      buf = next;
      continue;
    }
    if (buf) chunks.push(buf);
    if (sentence.length <= maxLen) {
      buf = sentence;
      continue;
    }
    for (let i = 0; i < sentence.length; i += maxLen) {
      chunks.push(sentence.slice(i, i + maxLen));
    }
    buf = "";
  }
  if (buf) chunks.push(buf);
  return chunks;
}

/** Read longer passages sentence-by-sentence (avoids TTS truncation). */
export async function speakLongText(
  text: string,
  locale: Locale,
  options: SpeakOptions = {}
) {
  if (typeof window === "undefined") return;
  if (options.muted ?? isMascotMuted()) {
    options.onEnd?.();
    return;
  }

  const spoken = miloSpeechText(text, locale);
  if (!spoken) {
    options.onEnd?.();
    return;
  }

  stopSpeaking();
  const gen = speakGeneration;
  const chunks = splitSpeechChunks(spoken);
  if (chunks.length === 0) {
    options.onEnd?.();
    return;
  }

  let started = false;
  for (let i = 0; i < chunks.length; i++) {
    if (gen !== speakGeneration) return;
    if (i > 0) await delay(MIXED_SEGMENT_GAP_MS);
    await speakSegmentOnly(chunks[i]!, locale, {
      muted: options.muted,
      onStart: started
        ? undefined
        : () => {
            started = true;
            options.onStart?.();
          },
    });
  }

  if (gen === speakGeneration) options.onEnd?.();
}

export { MUTE_KEY };
