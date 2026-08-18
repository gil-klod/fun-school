"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  type Locale,
} from "@/i18n/types";
import { translate, getSubjectTitle, getGameTitle, getGameDescription } from "@/i18n";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  dir: "rtl" | "ltr";
  subjectTitle: (subjectId: string) => string;
  gameTitle: (subjectId: string, gameId: string) => string;
  gameDescription: (subjectId: string, gameId: string) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY) as Locale | null;
    queueMicrotask(() => {
      if (stored === "he" || stored === "en") {
        setLocaleState(stored);
      }
      setMounted(true);
    });
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "he" ? "rtl" : "ltr";
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  }, [locale, mounted]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => translate(locale, key, params),
    [locale]
  );

  const value: LocaleContextValue = {
    locale,
    setLocale,
    t,
    dir: locale === "he" ? "rtl" : "ltr",
    subjectTitle: (id) => getSubjectTitle(locale, id),
    gameTitle: (subjectId, gameId) => getGameTitle(locale, subjectId, gameId),
    gameDescription: (subjectId, gameId) => getGameDescription(locale, subjectId, gameId),
  };

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

/** Force UI strings and direction for a subtree (e.g. advanced English section). */
export function LocaleOverrideProvider({
  locale: overrideLocale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const parent = useLocale();

  const value: LocaleContextValue = {
    locale: overrideLocale,
    setLocale: parent.setLocale,
    t: (key, params) => translate(overrideLocale, key, params),
    dir: overrideLocale === "he" ? "rtl" : "ltr",
    subjectTitle: (id) => getSubjectTitle(overrideLocale, id),
    gameTitle: (subjectId, gameId) => getGameTitle(overrideLocale, subjectId, gameId),
    gameDescription: (subjectId, gameId) =>
      getGameDescription(overrideLocale, subjectId, gameId),
  };

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}
