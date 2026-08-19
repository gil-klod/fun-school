"use client";

import { useMascot } from "./MascotProvider";
import { MascotCharacter } from "./MascotCharacter";
import { useLocale } from "@/i18n/LocaleProvider";

export function Mascot() {
  const { pinned, bubbleOpen, text, animation, hide, sayContextLine } = useMascot();
  const { t } = useLocale();

  const showCharacter = pinned || bubbleOpen;
  if (!showCharacter) return null;

  const activeAnimation = bubbleOpen ? animation : "idle";

  return (
    <div className="fixed bottom-4 start-4 z-40 max-w-[min(20rem,calc(100vw-2rem))] animate-bounce-in pointer-events-auto">
      <div className="flex items-end gap-2 sm:gap-3">
        <button
          type="button"
          onClick={() => {
            if (pinned) sayContextLine();
          }}
          className={`shrink-0 rounded-full transition-transform ${
            pinned ? "cursor-pointer hover:scale-105 active:scale-95" : "cursor-default"
          }`}
          aria-label={pinned ? t("mascot.tapMilo") : t("mascot.name")}
          title={pinned ? t("mascot.tapMilo") : undefined}
        >
          <MascotCharacter animation={activeAnimation} />
        </button>

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
              <p className="text-xs font-bold text-indigo-500 mb-0.5">{t("mascot.name")}</p>
              <p className="text-sm sm:text-base font-semibold text-gray-800 leading-snug">{text}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
