"use client";

import Link from "next/link";
import { useLocale } from "@/i18n/LocaleProvider";
import { useStudent } from "@/components/students";
import { APP_CONTAINER } from "@/lib/layout";

interface GameContentGateProps {
  loading: boolean;
  error: string | null;
  children: React.ReactNode;
}

export function GameContentGate({ loading, error, children }: GameContentGateProps) {
  const { t } = useLocale();
  const { ready: studentReady, activeStudent } = useStudent();
  const needsStudent = studentReady && !activeStudent;

  if (loading) {
    return (
      <main className={`flex-1 py-8 ${APP_CONTAINER} text-center`}>
        <p className="text-gray-500">{t("common.loading")}</p>
      </main>
    );
  }

  if (needsStudent) {
    return (
      <main className={`flex-1 py-8 ${APP_CONTAINER} text-center`}>
        <p className="text-xl text-gray-600 mb-4">{t("students.noStudents")}</p>
        <Link href="/settings" className="game-btn game-btn-primary inline-block">
          {t("students.add")}
        </Link>
      </main>
    );
  }

  if (error) {
    return (
      <main className={`flex-1 py-8 ${APP_CONTAINER} text-center`}>
        <p className="text-red-600 mb-2">{error}</p>
        <p className="text-sm text-gray-500">{t("content.seedHint")}</p>
      </main>
    );
  }

  return <>{children}</>;
}
