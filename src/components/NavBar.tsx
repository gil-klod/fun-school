"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useLocale } from "@/i18n/LocaleProvider";
import { SideMenu } from "@/components/SideMenu";
import { MiloToggleButton, MascotMuteButton } from "@/components/mascot";
import { APP_CONTAINER } from "@/lib/layout";

function MenuIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

export function NavBar() {
  const { data: session } = useSession();
  const { t } = useLocale();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav className="bg-white/80 backdrop-blur border-b border-indigo-100 sticky top-0 z-50">
        <div className={`${APP_CONTAINER} py-3 flex items-center justify-between gap-3`}>
          <Link href="/" className="font-bold text-indigo-700 text-lg shrink-0">
            Fun School 🎒
          </Link>

          {session ? (
            <div className="flex items-center gap-1 sm:gap-2">
              <MascotMuteButton />
              <MiloToggleButton />
              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                className="p-2 rounded-xl text-indigo-700 hover:bg-indigo-50 transition-colors"
                aria-label={t("nav.openMenu")}
                aria-expanded={menuOpen}
              >
                <MenuIcon />
              </button>
            </div>
          ) : null}
        </div>
      </nav>

      {session && (
        <SideMenu
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          userName={session.user.name}
        />
      )}
    </>
  );
}
