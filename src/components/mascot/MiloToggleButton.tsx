"use client";

import { useMascot } from "./MascotProvider";
import { useLocale } from "@/i18n/LocaleProvider";

export function MiloToggleButton() {
  const { pinned, togglePinned } = useMascot();
  const { t } = useLocale();

  return (
    <button
      type="button"
      onClick={togglePinned}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold transition-all ${
        pinned
          ? "bg-amber-400 text-amber-950 shadow-md ring-2 ring-amber-500"
          : "bg-white border-2 border-indigo-200 text-indigo-700 hover:border-indigo-400"
      }`}
      aria-pressed={pinned}
      aria-label={pinned ? t("mascot.toggleOff") : t("mascot.toggleOn")}
      title={pinned ? t("mascot.toggleOff") : t("mascot.toggleOn")}
    >
      <span className="text-lg leading-none" aria-hidden>
        🎒
      </span>
      <span className="hidden sm:inline">{pinned ? t("mascot.toggleOff") : t("mascot.toggleOn")}</span>
    </button>
  );
}
