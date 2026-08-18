"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useLocale } from "@/i18n/LocaleProvider";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export function NavBar() {
  const { data: session } = useSession();
  const { t } = useLocale();

  return (
    <nav className="bg-white/80 backdrop-blur border-b border-indigo-100 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-bold text-indigo-700 text-lg">
          Fun School 🎒
        </Link>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          {session && (
            <>
              <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-800 font-medium text-sm">
                {t("nav.myProgress")}
              </Link>
              <span className="text-gray-500 text-sm hidden sm:inline">
                {t("nav.hi")}, {session.user.name}!
              </span>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="text-gray-400 hover:text-gray-600 text-sm"
              >
                {t("nav.logOut")}
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
