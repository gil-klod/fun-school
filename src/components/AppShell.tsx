"use client";

import { AuthProvider } from "@/components/AuthProvider";
import { LocaleProvider } from "@/i18n/LocaleProvider";
import { NavBar } from "@/components/NavBar";
import { MascotProvider } from "@/components/mascot";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <LocaleProvider>
      <AuthProvider>
        <MascotProvider>
          <NavBar />
          {children}
        </MascotProvider>
      </AuthProvider>
    </LocaleProvider>
  );
}
