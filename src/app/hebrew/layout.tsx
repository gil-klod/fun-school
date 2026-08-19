"use client";

import { LocaleOverrideProvider } from "@/i18n/LocaleProvider";

export default function HebrewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LocaleOverrideProvider locale="he">
      <div dir="rtl" lang="he" className="contents">
        {children}
      </div>
    </LocaleOverrideProvider>
  );
}
