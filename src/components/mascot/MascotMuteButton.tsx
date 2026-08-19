"use client";

import { useMascot } from "./MascotProvider";
import { useLocale } from "@/i18n/LocaleProvider";

export function MascotMuteButton({ compact = false }: { compact?: boolean }) {
  const { muted, toggleMuted, replaySpeech, bubbleOpen, text } = useMascot();
  const { t } = useLocale();

  return (
    <div className={`flex items-center gap-1 ${compact ? "" : "shrink-0"}`}>
      {!muted && bubbleOpen && text && (
        <button
          type="button"
          onClick={replaySpeech}
          className="p-1 rounded-lg text-indigo-500 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
          aria-label={t("mascot.replay")}
          title={t("mascot.replay")}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 9a9 9 0 0115.3-6.7L20 9M20 15a9 9 0 01-15.3 6.7L4 15" />
          </svg>
        </button>
      )}
      <button
        type="button"
        onClick={toggleMuted}
        className={`p-1 rounded-lg transition-colors ${
          muted
            ? "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            : "text-indigo-600 hover:bg-indigo-50 hover:text-indigo-800"
        }`}
        aria-label={muted ? t("mascot.unmute") : t("mascot.mute")}
        aria-pressed={muted}
        title={muted ? t("mascot.unmute") : t("mascot.mute")}
      >
        {muted ? (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707A1 1 0 0112 5v14a1 1 0 01-1.707.707L5.586 15z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M12 6v12M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707A1 1 0 0112 5v14a1 1 0 01-1.707.707L5.586 15z" />
          </svg>
        )}
      </button>
    </div>
  );
}
