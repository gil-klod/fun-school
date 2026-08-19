"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale } from "@/i18n/LocaleProvider";
import { APP_CONTAINER } from "@/lib/layout";
import { getAvatarEmoji } from "@/lib/students/avatars";
import { StudentForm } from "@/components/students/StudentForm";
import { StudentProjectEditor } from "@/components/projects/StudentProjectEditor";
import { useStudent } from "@/components/students/StudentProvider";
import type { EnglishSubjectId } from "@/lib/projects/types";

export default function SettingsPage() {
  const { t } = useLocale();
  const { students, deleteStudent, createStudent, updateStudentEnglishTrack, ready } = useStudent();
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  async function handleResetAll() {
    if (!confirm(t("students.resetAllConfirm"))) return;
    setResetting(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/account/reset-data", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? t("students.resetAllFailed"));
      setSuccess(t("students.resetAllSuccess"));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("students.resetAllFailed"));
    } finally {
      setResetting(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(t("students.deleteConfirm", { name }))) return;
    setDeletingId(id);
    setError("");
    try {
      await deleteStudent(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("students.deleteFailed"));
    } finally {
      setDeletingId(null);
    }
  }

  if (!ready) {
    return (
      <main className={`flex-1 py-8 ${APP_CONTAINER} text-center`}>
        <p className="text-gray-500">{t("common.loading")}</p>
      </main>
    );
  }

  return (
    <main className={`flex-1 py-6 sm:py-8 ${APP_CONTAINER}`}>
      <header className="text-center mb-8">
        <span className="text-5xl">⚙️</span>
        <h1 className="text-3xl font-bold text-gray-800 mt-2">{t("students.settingsTitle")}</h1>
        <p className="text-gray-500">{t("students.settingsSubtitle")}</p>
      </header>

      {error && (
        <p className="text-red-600 text-sm text-center mb-4">{error}</p>
      )}
      {success && (
        <p className="text-emerald-700 text-sm text-center mb-4">{success}</p>
      )}

      <section className="bg-white/90 border-2 border-indigo-100 rounded-3xl p-5 sm:p-6 mb-6">
        <h2 className="font-bold text-lg text-gray-800 mb-4">{t("students.title")}</h2>

        {students.length === 0 ? (
          <p className="text-gray-500 mb-4">{t("students.noStudents")}</p>
        ) : (
          <ul className="space-y-3 mb-4">
            {students.map((student) => (
              <li
                key={student.id}
                className="flex items-center gap-3 p-3 rounded-xl border-2 border-indigo-50 bg-indigo-50/30"
              >
                <span className="text-3xl">{getAvatarEmoji(student.avatar)}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 truncate">{student.name}</p>
                  <p className="text-sm text-gray-500">
                    {t("students.age")}: {student.age} ·{" "}
                    {student.gender === "male" ? t("students.genderMale") : t("students.genderFemale")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(student.id, student.name)}
                  disabled={deletingId === student.id}
                  className="px-3 py-2 rounded-lg text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 disabled:opacity-50"
                >
                  {t("students.delete")}
                </button>
              </li>
            ))}
          </ul>
        )}

        {showForm ? (
          <StudentForm
            onSubmit={async (input) => {
              await createStudent(input);
              setShowForm(false);
            }}
            onCancel={() => setShowForm(false)}
          />
        ) : (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="game-btn game-btn-primary w-full sm:w-auto"
          >
            {t("students.add")}
          </button>
        )}
      </section>

      {students.length > 0 && (
        <section
          id="projects"
          className="bg-white/90 border-2 border-violet-100 rounded-3xl p-5 sm:p-6 mb-6"
        >
          <h2 className="font-bold text-lg text-gray-800 mb-1">{t("projects.settingsTitle")}</h2>
          <p className="text-sm text-gray-600 mb-4">{t("projects.settingsHint")}</p>
          <div className="space-y-8">
            {students.map((student) => (
              <div key={student.id} className="border-t border-violet-100 pt-6 first:border-0 first:pt-0">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <span>{getAvatarEmoji(student.avatar)}</span>
                  {student.name}
                </h3>
                <StudentProjectEditor
                  student={student}
                  onEnglishTrackChange={async (id, track: EnglishSubjectId) => {
                    await updateStudentEnglishTrack(id, track);
                  }}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="bg-white/90 border-2 border-amber-100 rounded-3xl p-5 sm:p-6 mb-6">
        <h2 className="font-bold text-lg text-gray-800 mb-2">{t("students.resetAllData")}</h2>
        <p className="text-sm text-gray-600 mb-4">{t("students.resetAllDescription")}</p>
        <button
          type="button"
          onClick={handleResetAll}
          disabled={resetting || students.length === 0}
          className="px-4 py-2 rounded-xl text-sm font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 disabled:opacity-50"
        >
          {resetting ? t("students.resetting") : t("students.resetAllData")}
        </button>
      </section>

      <div className="text-center">
        <Link href="/" className="text-indigo-600 font-semibold hover:underline">
          {t("common.home")}
        </Link>
      </div>
    </main>
  );
}
