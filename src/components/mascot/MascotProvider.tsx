"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocale } from "@/i18n/LocaleProvider";
import { Mascot } from "./Mascot";
import { speakText, stopSpeaking } from "./speech";
import type { MascotAnimation, MascotContextValue, MascotShowOptions } from "./types";

const WELCOME_KEY = "fun-school-mascot-welcome";

const CORRECT_KEYS = ["mascot.correct0", "mascot.correct1", "mascot.correct2", "mascot.correct3"];
const WRONG_KEYS = ["mascot.wrong0", "mascot.wrong1", "mascot.wrong2"];

const MascotContext = createContext<MascotContextValue | null>(null);

function pickRandom(keys: string[], t: (key: string) => string) {
  return t(keys[Math.floor(Math.random() * keys.length)]!);
}

export function MascotProvider({ children }: { children: React.ReactNode }) {
  const { t, locale } = useLocale();
  const [visible, setVisible] = useState(false);
  const [text, setText] = useState("");
  const [animation, setAnimation] = useState<MascotAnimation>("idle");
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearHideTimer = useCallback(() => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  }, []);

  const hide = useCallback(() => {
    clearHideTimer();
    stopSpeaking();
    setVisible(false);
    setAnimation("idle");
  }, [clearHideTimer]);

  const show = useCallback(
    ({ text: msg, animation: anim = "talk", speak = true, durationMs = 6000 }: MascotShowOptions) => {
      clearHideTimer();
      setText(msg);
      setAnimation(anim);
      setVisible(true);

      if (speak) {
        speakText(msg, locale);
      }

      if (durationMs > 0) {
        hideTimer.current = setTimeout(() => {
          hide();
        }, durationMs);
      }
    },
    [clearHideTimer, hide, locale]
  );

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
      visible,
      text,
      animation,
    }),
    [show, hide, celebrate, encourage, welcome, visible, text, animation]
  );

  return (
    <MascotContext.Provider value={value}>
      {children}
      <Mascot />
    </MascotContext.Provider>
  );
}

export function useMascot() {
  const ctx = useContext(MascotContext);
  if (!ctx) throw new Error("useMascot must be used within MascotProvider");
  return ctx;
}
