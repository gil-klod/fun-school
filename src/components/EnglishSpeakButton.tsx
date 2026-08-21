"use client";

import { useCallback, useEffect, useState } from "react";
import { speakMixedText, speakText, stopSpeaking, warmSpeechVoices } from "@/components/mascot/speech";
import { isMixedLanguageText } from "@/lib/mascot/mixedSpeech";
import { useLocale } from "@/i18n/LocaleProvider";
import type { Locale } from "@/i18n/types";

interface SpeakButtonProps {
  text: string;
  locale?: Locale;
  className?: string;
  size?: "sm" | "md";
}

export function SpeakButton({ text, locale = "en", className = "", size = "md" }: SpeakButtonProps) {
  const { t } = useLocale();
  const [speaking, setSpeaking] = useState(false);
  const dim = size === "sm" ? "h-8 w-8 rounded-lg" : "h-10 w-10 rounded-xl";
  const icon = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  useEffect(() => {
    warmSpeechVoices();
  }, []);

  const handleClick = useCallback(
    async (event: React.MouseEvent) => {
      event.stopPropagation();
      event.preventDefault();
      if (!text.trim()) return;
      setSpeaking(true);
      const spoken = text.replace(/"/g, "");
      const opts = { muted: false as const, onEnd: () => setSpeaking(false) };
      if (isMixedLanguageText(spoken)) {
        await speakMixedText(spoken, opts);
      } else {
        stopSpeaking();
        await speakText(spoken, locale, opts);
      }
    },
    [text, locale]
  );

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex shrink-0 items-center justify-center border-2 transition-colors ${
        speaking
          ? "border-indigo-400 bg-indigo-100 text-indigo-700"
          : "border-green-200 bg-white text-green-700 hover:bg-green-50 hover:border-green-300"
      } ${dim} ${className}`}
      aria-label={t("games.hearEnglish")}
      title={t("games.hearEnglish")}
    >
      <svg viewBox="0 0 24 24" className={icon} aria-hidden="true" fill="currentColor">
        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.74 2.5-2.26 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
      </svg>
    </button>
  );
}

/** Speak English text aloud (shortcut for SpeakButton with locale="en"). */
export function EnglishSpeakButton(props: Omit<SpeakButtonProps, "locale">) {
  return <SpeakButton {...props} locale="en" />;
}

interface WordWithSpeakerProps {
  word: string;
  speakLocale?: Locale;
  onWordClick?: () => void;
  disabled?: boolean;
  wordClassName?: string;
  className?: string;
}

/** Answer chip with the listen button stacked underneath the word. */
export function WordWithSpeaker({
  word,
  speakLocale = "en",
  onWordClick,
  disabled,
  wordClassName = "",
  className = "",
}: WordWithSpeakerProps) {
  return (
    <div className={`flex flex-col items-center gap-1.5 ${className}`}>
      <button
        type="button"
        onClick={onWordClick}
        disabled={disabled}
        className={wordClassName}
      >
        {word}
      </button>
      {speakLocale === "en" ? (
        <EnglishSpeakButton text={word} size="sm" />
      ) : (
        <SpeakButton text={word} locale={speakLocale} size="sm" />
      )}
    </div>
  );
}
