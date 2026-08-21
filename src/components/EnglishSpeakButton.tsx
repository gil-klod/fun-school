"use client";

import { useCallback, useEffect, useState } from "react";
import { speakText, stopSpeaking, warmSpeechVoices } from "@/components/mascot/speech";
import { useLocale } from "@/i18n/LocaleProvider";

interface EnglishSpeakButtonProps {
  text: string;
  className?: string;
}

export function EnglishSpeakButton({ text, className = "" }: EnglishSpeakButtonProps) {
  const { t } = useLocale();
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    warmSpeechVoices();
  }, []);

  const handleClick = useCallback(
    async (event: React.MouseEvent) => {
      event.stopPropagation();
      if (!text.trim()) return;
      stopSpeaking();
      setSpeaking(true);
      await speakText(text, "en", {
        muted: false,
        onEnd: () => setSpeaking(false),
      });
    },
    [text]
  );

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 transition-colors ${
        speaking
          ? "border-indigo-400 bg-indigo-100 text-indigo-700"
          : "border-green-200 bg-white text-green-700 hover:bg-green-50 hover:border-green-300"
      } ${className}`}
      aria-label={t("games.hearEnglish")}
      title={t("games.hearEnglish")}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="currentColor">
        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.74 2.5-2.26 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
      </svg>
    </button>
  );
}
