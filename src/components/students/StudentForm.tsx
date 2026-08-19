"use client";

import { useState } from "react";
import { useLocale } from "@/i18n/LocaleProvider";
import type { UserGender } from "@/lib/gender";
import { STUDENT_AVATARS, type StudentAvatarId } from "@/lib/students/avatars";
import type { StudentProfile } from "./StudentProvider";

interface StudentFormProps {
  onSubmit: (input: {
    name: string;
    age: number;
    gender: UserGender;
    avatar: StudentAvatarId;
  }) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}

export function StudentForm({ onSubmit, onCancel, submitLabel }: StudentFormProps) {
  const { t, locale } = useLocale();
  const [name, setName] = useState("");
  const [age, setAge] = useState("8");
  const [gender, setGender] = useState<UserGender | "">("");
  const [avatar, setAvatar] = useState<StudentAvatarId | "">("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const parsedAge = Number(age);
    if (!name.trim() || !gender || !avatar || !Number.isInteger(parsedAge)) {
      setError(t("students.formError"));
      return;
    }

    setLoading(true);
    try {
      await onSubmit({ name: name.trim(), age: parsedAge, gender, avatar });
      setName("");
      setAge("8");
      setGender("");
      setAvatar("");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("students.formError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t("students.name")}</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-xl border-2 border-indigo-100 focus:border-indigo-400 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t("students.age")}</label>
        <input
          type="number"
          min={4}
          max={14}
          value={age}
          onChange={(e) => setAge(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-xl border-2 border-indigo-100 focus:border-indigo-400 focus:outline-none"
        />
        <p className="text-xs text-gray-400 mt-1">{t("students.ageHint")}</p>
      </div>

      <div>
        <span className="block text-sm font-medium text-gray-700 mb-2">{t("students.gender")}</span>
        <div className="flex gap-3">
          {(["male", "female"] as const).map((value) => (
            <label key={value} className="flex-1 cursor-pointer">
              <input
                type="radio"
                name="student-gender"
                value={value}
                checked={gender === value}
                onChange={() => setGender(value)}
                required
                className="sr-only peer"
              />
              <span className="block text-center px-4 py-3 rounded-xl border-2 border-indigo-100 peer-checked:border-indigo-500 peer-checked:bg-indigo-50 font-medium text-gray-700">
                {value === "male" ? t("students.genderMale") : t("students.genderFemale")}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <span className="block text-sm font-medium text-gray-700 mb-2">{t("students.avatar")}</span>
        <div className="grid grid-cols-5 gap-2">
          {STUDENT_AVATARS.map((item) => (
            <label key={item.id} className="cursor-pointer">
              <input
                type="radio"
                name="student-avatar"
                value={item.id}
                checked={avatar === item.id}
                onChange={() => setAvatar(item.id)}
                required
                className="sr-only peer"
              />
              <span
                className="flex flex-col items-center justify-center rounded-xl border-2 border-indigo-100 peer-checked:border-indigo-500 peer-checked:bg-indigo-50 p-2 transition-colors"
                title={locale === "he" ? item.labelHe : item.labelEn}
              >
                <span className="text-2xl">{item.emoji}</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      {error && <p className="text-red-600 text-sm text-center">{error}</p>}

      <div className="flex gap-3 pt-1">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50"
          >
            {t("common.back")}
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="game-btn game-btn-primary flex-1 disabled:opacity-50"
        >
          {loading ? t("students.creating") : (submitLabel ?? t("students.create"))}
        </button>
      </div>
    </form>
  );
}

export type { StudentProfile };
