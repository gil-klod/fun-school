"use client";

import { useLocale } from "@/i18n/LocaleProvider";

interface GameShellProps {
  title: string;
  emoji: string;
  children: React.ReactNode;
  contentDir?: "ltr" | "rtl";
}

export function GameShell({ title, emoji, children, contentDir }: GameShellProps) {
  const { dir } = useLocale();

  return (
    <div className="max-w-2xl mx-auto" dir={contentDir ?? dir}>
      <div className="text-center mb-6">
        <span className="text-5xl">{emoji}</span>
        <h1 className="text-3xl font-bold text-gray-800 mt-2">{title}</h1>
      </div>
      {children}
    </div>
  );
}
