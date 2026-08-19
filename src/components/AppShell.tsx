"use client";

import { AuthProvider } from "@/components/AuthProvider";
import { LocaleProvider } from "@/i18n/LocaleProvider";
import { NavBar } from "@/components/NavBar";
import { MascotProvider } from "@/components/mascot";
import { StudentOnboardingModal, StudentProvider } from "@/components/students";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <LocaleProvider>
      <AuthProvider>
        <StudentProvider>
          <MascotProvider>
            <NavBar />
            {children}
            <StudentOnboardingModal />
          </MascotProvider>
        </StudentProvider>
      </AuthProvider>
    </LocaleProvider>
  );
}
