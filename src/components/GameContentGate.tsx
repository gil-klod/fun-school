"use client";

import { useLocale } from "@/i18n/LocaleProvider";

interface GameContentGateProps {
  loading: boolean;
  error: string | null;
  children: React.ReactNode;
}

export function GameContentGate({ loading, error, children }: GameContentGateProps) {
  const { t } = useLocale();

  if (loading) {
    return (
      <main className="flex-1 px-4 py-8 max-w-2xl mx-auto text-center">
        <p className="text-gray-500">{t("common.loading")}</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex-1 px-4 py-8 max-w-2xl mx-auto text-center">
        <p className="text-red-600 mb-2">{error}</p>
        <p className="text-sm text-gray-500">{t("content.seedHint")}</p>
      </main>
    );
  }

  return <>{children}</>;
}
