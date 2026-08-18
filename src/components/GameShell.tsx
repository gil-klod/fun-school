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
      <div className="text-center mb-3">
        <span className="text-3xl">{emoji}</span>
        <h1 className="text-xl font-bold text-gray-800">{title}</h1>
      </div>
      {children}
    </div>
  );
}
