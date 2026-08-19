"use client";

import { useLocale } from "@/i18n/LocaleProvider";
import type { Locale } from "@/i18n/types";

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { locale, setLocale } = useLocale();

  const options: { value: Locale; label: string }[] = [
    { value: "he", label: "עב" },
    { value: "en", label: "EN" },
  ];

  return (
    <div className={`flex rounded-xl border-2 border-indigo-100 overflow-hidden ${className}`}>
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setLocale(opt.value)}
          className={`flex-1 px-3 py-2 text-sm font-bold transition-colors ${
            locale === opt.value
              ? "bg-indigo-500 text-white"
              : "bg-white text-indigo-600 hover:bg-indigo-50"
          }`}
          aria-label={opt.value === "he" ? "Hebrew" : "English"}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
