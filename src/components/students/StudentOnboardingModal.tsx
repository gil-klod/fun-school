"use client";

import { useLocale } from "@/i18n/LocaleProvider";
import { StudentForm } from "./StudentForm";
import { useStudent } from "./StudentProvider";

export function StudentOnboardingModal() {
  const { t } = useLocale();
  const { needsStudent, createStudent } = useStudent();

  if (!needsStudent) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50">
      <div
        className="bg-white rounded-3xl shadow-2xl border-2 border-indigo-100 w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 sm:p-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="student-onboarding-title"
      >
        <div className="text-center mb-6">
          <span className="text-5xl">🎒</span>
          <h2 id="student-onboarding-title" className="text-2xl font-bold text-indigo-700 mt-2">
            {t("students.onboardingTitle")}
          </h2>
          <p className="text-gray-500 mt-1">{t("students.onboardingSubtitle")}</p>
        </div>

        <StudentForm
          onSubmit={async (input) => {
            await createStudent(input);
          }}
        />
      </div>
    </div>
  );
}
