"use client";

import { useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useLocale } from "@/i18n/LocaleProvider";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

interface SideMenuProps {
  open: boolean;
  onClose: () => void;
  userName?: string | null;
  isAdmin?: boolean;
}

export function SideMenu({ open, onClose, userName, isAdmin }: SideMenuProps) {
  const { t, dir } = useLocale();
  const slideFrom = dir === "rtl" ? "translate-x-full" : "-translate-x-full";

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const navLinkClass =
    "flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-semibold text-gray-800 hover:bg-indigo-50 hover:text-indigo-700 transition-colors";

  return (
    <>
      <div
        className={`fixed inset-0 z-[60] bg-black/40 transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden={!open}
      />

      <aside
        className={`fixed top-0 bottom-0 z-[70] w-[min(18rem,85vw)] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          dir === "rtl" ? "right-0 border-l border-indigo-100" : "left-0 border-r border-indigo-100"
        } ${open ? "translate-x-0" : slideFrom}`}
        aria-hidden={!open}
        role="dialog"
        aria-modal="true"
        aria-label={t("nav.menu")}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-indigo-100">
          <span className="font-bold text-indigo-700 text-lg">Fun School 🎒</span>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
            aria-label={t("nav.closeMenu")}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {userName && (
          <p className="px-4 pt-4 pb-1 text-sm text-gray-500">
            {t("nav.hi")}, <span className="font-semibold text-gray-700">{userName}</span>!
          </p>
        )}

        <nav className="flex-1 px-3 py-3 flex flex-col gap-1">
          <Link href="/" onClick={onClose} className={navLinkClass}>
            <span className="text-xl" aria-hidden>🏠</span>
            {t("common.home")}
          </Link>
          <Link href="/dashboard" onClick={onClose} className={navLinkClass}>
            <span className="text-xl" aria-hidden>📊</span>
            {t("nav.myProgress")}
          </Link>
          <Link href="/settings" onClick={onClose} className={navLinkClass}>
            <span className="text-xl" aria-hidden>⚙️</span>
            {t("nav.settings")}
          </Link>
          {isAdmin && (
            <>
              <p className="px-4 pt-3 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Admin
              </p>
              <Link href="/admin" onClick={onClose} className={navLinkClass}>
                <span className="text-xl" aria-hidden>🛠️</span>
                Admin overview
              </Link>
              <Link href="/admin/students" onClick={onClose} className={navLinkClass}>
                <span className="text-xl" aria-hidden>👧</span>
                Students
              </Link>
              <Link href="/admin/content" onClick={onClose} className={navLinkClass}>
                <span className="text-xl" aria-hidden>📦</span>
                Game content
              </Link>
              <Link href="/admin/milo" onClick={onClose} className={navLinkClass}>
                <span className="text-xl" aria-hidden>🎒</span>
                Milo texts
              </Link>
              <Link href="/admin/colors-numbers" onClick={onClose} className={navLinkClass}>
                <span className="text-xl" aria-hidden>🌈</span>
                Colors QA
              </Link>
              <Link href="/admin/hebrew-stories" onClick={onClose} className={navLinkClass}>
                <span className="text-xl" aria-hidden>📖</span>
                Stories QA
              </Link>
            </>
          )}
        </nav>

        <div className="px-4 py-4 border-t border-indigo-100 space-y-4">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              {t("nav.language")}
            </p>
            <LanguageSwitcher className="w-full" />
          </div>
          <button
            type="button"
            onClick={() => {
              onClose();
              signOut({ callbackUrl: "/login" });
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
          >
            {t("nav.logOut")}
          </button>
        </div>
      </aside>
    </>
  );
}
