"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import { useLocale } from "@/i18n/LocaleProvider";
import { pickContextLine, resolveMascotContext } from "@/lib/mascot/lines";
import { Mascot } from "./Mascot";
import { isMascotMuted, setMascotMuted, speakText, stopSpeaking, warmSpeechVoices } from "./speech";
import type { MascotAnimation, MascotContextValue, MascotShowOptions } from "./types";

const WELCOME_KEY = "fun-school-mascot-welcome";
const PINNED_KEY = "fun-school-mascot-pinned";

const CORRECT_KEYS = ["mascot.correct0", "mascot.correct1", "mascot.correct2", "mascot.correct3"];
const WRONG_KEYS = ["mascot.wrong0", "mascot.wrong1", "mascot.wrong2"];

const MascotContext = createContext<MascotContextValue | null>(null);

function pickRandom(keys: string[], t: (key: string) => string) {
  return t(keys[Math.floor(Math.random() * keys.length)]!);
}

export function MascotProvider({ children }: { children: React.ReactNode }) {
  const { t, locale } = useLocale();
  const pathname = usePathname();
  const [pinned, setPinned] = useState(false);
  const [muted, setMuted] = useState(false);
  const [prefsLoaded, setPrefsLoaded] = useState(false);
  const [bubbleOpen, setBubbleOpen] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [text, setText] = useState("");
  const [animation, setAnimation] = useState<MascotAnimation>("idle");
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mutedRef = useRef(muted);
  mutedRef.current = muted;

  useEffect(() => {
    setPinned(localStorage.getItem(PINNED_KEY) === "1");
    setMuted(isMascotMuted());
    warmSpeechVoices();
    setPrefsLoaded(true);
  }, []);

  const clearHideTimer = useCallback(() => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  }, []);

  const closeBubble = useCallback(() => {
    clearHideTimer();
    stopSpeaking();
    setSpeaking(false);
    setBubbleOpen(false);
    setText("");
    setAnimation("idle");
  }, [clearHideTimer]);

  const hide = useCallback(() => {
    closeBubble();
  }, [closeBubble]);

  const runSpeech = useCallback(
    (msg: string, baseAnimation: MascotAnimation) => {
      speakText(msg, locale, {
        muted: mutedRef.current,
        onStart: () => {
          setSpeaking(true);
          if (baseAnimation !== "clap" && baseAnimation !== "wave") {
            setAnimation("talk");
          }
        },
        onEnd: () => {
          setSpeaking(false);
          setAnimation(baseAnimation === "clap" || baseAnimation === "wave" ? baseAnimation : "idle");
        },
      });
    },
    [locale]
  );

  const show = useCallback(
    ({
      text: msg,
      animation: anim = "talk",
      speak = true,
      durationMs = 6000,
    }: MascotShowOptions) => {
      clearHideTimer();
      setText(msg);
      setAnimation(anim === "talk" ? "idle" : anim);
      setBubbleOpen(true);

      if (speak) {
        runSpeech(msg, anim);
      }

      if (durationMs > 0) {
        hideTimer.current = setTimeout(() => {
          closeBubble();
        }, durationMs);
      }
    },
    [clearHideTimer, closeBubble, runSpeech]
  );

  const replaySpeech = useCallback(() => {
    if (!text || mutedRef.current) return;
    runSpeech(text, animation);
  }, [text, animation, runSpeech]);

  const sayContextLine = useCallback(() => {
    const context = resolveMascotContext(pathname);
    const line = pickContextLine(locale, context);
    show({
      text: line,
      animation: "talk",
      speak: true,
      durationMs: pinned ? 8000 : 6000,
    });
  }, [pathname, locale, show, pinned]);

  const togglePinned = useCallback(() => {
    setPinned((prev) => {
      const next = !prev;
      localStorage.setItem(PINNED_KEY, next ? "1" : "0");
      if (next) {
        queueMicrotask(() => sayContextLine());
      } else {
        closeBubble();
      }
      return next;
    });
  }, [sayContextLine, closeBubble]);

  const toggleMuted = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      setMascotMuted(next);
      if (next) {
        stopSpeaking();
        setSpeaking(false);
      }
      return next;
    });
  }, []);

  const celebrate = useCallback(() => {
    show({
      text: pickRandom(CORRECT_KEYS, t),
      animation: "clap",
      speak: true,
    });
  }, [show, t]);

  const encourage = useCallback(() => {
    show({
      text: pickRandom(WRONG_KEYS, t),
      animation: "wave",
      speak: true,
    });
  }, [show, t]);

  const welcome = useCallback(() => {
    if (typeof window !== "undefined" && localStorage.getItem(WELCOME_KEY)) return;
    show({
      text: t("mascot.welcome"),
      animation: "wave",
      speak: true,
      durationMs: 8000,
    });
    localStorage.setItem(WELCOME_KEY, "1");
  }, [show, t]);

  const value = useMemo<MascotContextValue>(
    () => ({
      show,
      hide,
      celebrate,
      encourage,
      welcome,
      sayContextLine,
      togglePinned,
      toggleMuted,
      replaySpeech,
      pinned,
      muted,
      speaking,
      bubbleOpen,
      text,
      animation,
    }),
    [
      show,
      hide,
      celebrate,
      encourage,
      welcome,
      sayContextLine,
      togglePinned,
      toggleMuted,
      replaySpeech,
      pinned,
      muted,
      speaking,
      bubbleOpen,
      text,
      animation,
    ]
  );

  return (
    <MascotContext.Provider value={value}>
      {children}
      {prefsLoaded ? <Mascot /> : null}
    </MascotContext.Provider>
  );
}

export function useMascot() {
  const ctx = useContext(MascotContext);
  if (!ctx) throw new Error("useMascot must be used within MascotProvider");
  return ctx;
}
