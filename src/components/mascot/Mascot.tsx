"use client";

import { useMascot } from "./MascotProvider";
import { MascotCharacter } from "./MascotCharacter";
import { MascotMuteButton } from "./MascotMuteButton";
import { useLocale } from "@/i18n/LocaleProvider";

export function Mascot() {
  const { pinned, bubbleOpen, text, animation, speaking, hide, sayContextLine } = useMascot();
  const { t } = useLocale();

  const showCharacter = pinned || bubbleOpen;
  if (!showCharacter) return null;

  return (
    <div
      className={`fixed z-40 max-w-[min(20rem,calc(100vw-2rem))] animate-bounce-in pointer-events-auto start-4 ${
        bubbleOpen
          ? "max-sm:bottom-auto max-sm:top-16 max-sm:start-3 max-sm:end-3 max-sm:max-w-none bottom-4"
          : "bottom-4"
      }`}
    >
      <div
        className={`flex gap-2 sm:gap-3 ${
          bubbleOpen ? "max-sm:flex-col-reverse max-sm:items-start sm:items-end" : "items-end"
        }`}
      >
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => {
              if (pinned) sayContextLine();
            }}
            className={`rounded-full transition-transform block ${
              pinned ? "cursor-pointer hover:scale-105 active:scale-95" : "cursor-default"
            }`}
            aria-label={pinned ? t("mascot.tapMilo") : t("mascot.name")}
            title={pinned ? t("mascot.tapMilo") : undefined}
          >
            <MascotCharacter animation={animation} speaking={speaking} />
          </button>
          {pinned && !bubbleOpen && (
            <div className="absolute -top-1 -end-1 bg-white rounded-full shadow border border-indigo-100 p-0.5">
              <MascotMuteButton compact />
            </div>
          )}
        </div>

        {bubbleOpen && text && (
          <div className="relative flex-1 min-w-0" role="dialog" aria-live="polite" aria-label={t("mascot.name")}>
            <button
              type="button"
              onClick={hide}
              className="absolute -top-2 -end-2 w-7 h-7 rounded-full bg-white border border-gray-200 text-gray-500 hover:text-gray-800 hover:bg-gray-50 shadow text-sm font-bold z-10"
              aria-label={t("mascot.dismiss")}
            >
              ×
            </button>
            <div className="bg-white rounded-2xl border-2 border-indigo-200 shadow-lg px-4 py-3 pe-8">
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <p className="text-xs font-bold text-indigo-500">{t("mascot.name")}</p>
                <MascotMuteButton compact />
              </div>
              <p className="text-sm sm:text-base font-semibold text-gray-800 leading-snug">{text}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
