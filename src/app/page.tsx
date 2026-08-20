"use client";

import { SubjectCard } from "@/components/SubjectCard";
import { HomeDailyProject } from "@/components/projects/HomeDailyProject";
import { MascotWelcome } from "@/components/mascot";
import { subjects } from "@/lib/subjects";
import { APP_CONTAINER } from "@/lib/layout";
import { useLocale } from "@/i18n/LocaleProvider";

export default function HomePage() {
  const { t } = useLocale();

  return (
    <main className={`flex-1 py-6 sm:py-8 ${APP_CONTAINER}`}>
      <header className="text-center mb-8 sm:mb-10 animate-bounce-in">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-indigo-700 mb-2">
          Fun School 🎒
        </h1>
        <p className="text-lg sm:text-xl text-gray-600">{t("home.tagline")}</p>
        <p className="text-base sm:text-lg text-gray-500 mt-2">{t("home.subtitle")}</p>
      </header>

      <HomeDailyProject />
      <MascotWelcome />

      <div className="grid grid-cols-1 gap-4 sm:gap-5">
        {subjects.map((subject) => (
          <SubjectCard key={subject.id} subject={subject} />
        ))}
      </div>

      <footer className="text-center mt-12 text-gray-400 text-sm">
        {t("home.footer")}
      </footer>
    </main>
  );
}
