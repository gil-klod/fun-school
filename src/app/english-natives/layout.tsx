"use client";

import { LocaleOverrideProvider } from "@/i18n/LocaleProvider";

export default function EnglishNativesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LocaleOverrideProvider locale="en">
      <div dir="ltr" lang="en" className="contents">
        {children}
      </div>
    </LocaleOverrideProvider>
  );
}
