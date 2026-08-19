"use client";

import { useMascot } from "./MascotProvider";
import { MascotCharacter } from "./MascotCharacter";
import { useLocale } from "@/i18n/LocaleProvider";

export function Mascot() {
  const { visible, text, animation, hide } = useMascot();
  const { t } = useLocale();

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-4 start-4 z-40 max-w-[min(20rem,calc(100vw-2rem))] animate-bounce-in"
      role="dialog"
      aria-live="polite"
      aria-label={t("mascot.name")}
    >
      <div className="flex items-end gap-2 sm:gap-3">
        <MascotCharacter animation={animation} />

        <div className="relative flex-1 min-w-0">
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
      </div>
    </div>
  );
}
