"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale } from "@/i18n/LocaleProvider";
import {
  buildProjectDays,
  DEFAULT_PROJECT_DAYS,
  defaultProjectName,
} from "@/lib/projects/defaultProject";
import { gameIdsForSubject, randomEnglishGame, randomHebrewGame, randomMathGame } from "@/lib/projects/games";
import type { DailyProjectPayload, EnglishSubjectId, ProjectDay, ProjectSlot } from "@/lib/projects/types";
import { PROJECT_SLOTS } from "@/lib/projects/types";
import type { StudentProfile } from "@/components/students/StudentProvider";

interface StudentProjectEditorProps {
  student: StudentProfile;
  onEnglishTrackChange: (studentId: string, englishSubjectId: EnglishSubjectId) => Promise<void>;
}

export function StudentProjectEditor({
  student,
  onEnglishTrackChange,
}: StudentProjectEditorProps) {
  const { t, locale, gameTitle } = useLocale();
  const [project, setProject] = useState<DailyProjectPayload | null>(null);
  const [name, setName] = useState("");
  const [totalDays, setTotalDays] = useState(DEFAULT_PROJECT_DAYS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/projects?studentId=${student.id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load project");
      setProject(data.project);
      setName(data.project.name);
      setTotalDays(data.project.totalDays);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load project");
    } finally {
      setLoading(false);
    }
  }, [student.id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function saveProject(days?: ProjectDay[]) {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/projects", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: student.id,
          name,
          totalDays,
          days,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? t("projects.saveFailed"));
      setProject(data.project);
      setName(data.project.name);
      setTotalDays(data.project.totalDays);
      setSuccess(t("projects.saveSuccess"));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("projects.saveFailed"));
    } finally {
      setSaving(false);
    }
  }

  async function restoreDefault() {
    if (!confirm(t("projects.restoreConfirm"))) return;
    setRestoring(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/projects/restore-default", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: student.id, locale }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? t("projects.restoreFailed"));
      setProject(data.project);
      setName(data.project.name);
      setTotalDays(data.project.totalDays);
      setSuccess(t("projects.restoreSuccess"));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("projects.restoreFailed"));
    } finally {
      setRestoring(false);
    }
  }

  function resolveSlotGame(dayNumber: number, slot: ProjectSlot, value: string) {
    if (value === "random") {
      const gameId =
        slot === "math"
          ? randomMathGame(student.id, dayNumber)
          : slot === "hebrew"
            ? randomHebrewGame(student.id, dayNumber)
            : randomEnglishGame(student.id, dayNumber, student.englishSubjectId);
      return { gameId, random: true };
    }
    return { gameId: value, random: false };
  }

  function updateDayGame(dayNumber: number, slot: ProjectSlot, value: string) {
    if (!project) return;
    const days = project.days.map((day) => {
      if (day.dayNumber !== dayNumber) return day;
      return { ...day, [slot]: resolveSlotGame(dayNumber, slot, value) };
    });
    void saveProject(days);
  }

  function randomizeDay(dayNumber: number) {
    const englishSubjectId = student.englishSubjectId;
    const days = (project?.days ?? buildProjectDays(student.id, totalDays, englishSubjectId)).map(
      (day) => {
        if (day.dayNumber !== dayNumber) return day;
        return {
          ...day,
          math: { gameId: randomMathGame(student.id, dayNumber), random: true },
          hebrew: { gameId: randomHebrewGame(student.id, dayNumber), random: true },
          english: {
            gameId: randomEnglishGame(student.id, dayNumber, englishSubjectId),
            random: true,
          },
        };
      }
    );
    void saveProject(days);
  }

  if (loading) {
    return <p className="text-sm text-gray-500">{t("common.loading")}</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-end">
        <label className="flex-1 min-w-[200px]">
          <span className="text-sm font-semibold text-gray-700">{t("projects.name")}</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-xl border-2 border-indigo-100 px-3 py-2"
          />
        </label>
        <label className="w-28">
          <span className="text-sm font-semibold text-gray-700">{t("projects.days")}</span>
          <input
            type="number"
            min={1}
            max={60}
            value={totalDays}
            onChange={(e) => setTotalDays(Number(e.target.value))}
            className="mt-1 w-full rounded-xl border-2 border-indigo-100 px-3 py-2"
          />
        </label>
      </div>

      <label className="block">
        <span className="text-sm font-semibold text-gray-700">{t("projects.englishTrack")}</span>
        <select
          value={student.englishSubjectId}
          onChange={(e) =>
            void onEnglishTrackChange(student.id, e.target.value as EnglishSubjectId)
          }
          className="mt-1 w-full rounded-xl border-2 border-indigo-100 px-3 py-2"
        >
          <option value="english-beginners">{t("projects.englishBeginners")}</option>
          <option value="english-natives">{t("projects.englishAdvanced")}</option>
        </select>
      </label>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void saveProject()}
          disabled={saving}
          className="game-btn game-btn-primary"
        >
          {saving ? t("projects.saving") : t("projects.save")}
        </button>
        <button
          type="button"
          onClick={() => void restoreDefault()}
          disabled={restoring}
          className="px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-100 text-indigo-800 hover:bg-indigo-200"
        >
          {restoring ? t("projects.restoring") : t("projects.restoreDefault")}
        </button>
      </div>

      {project && (
        <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
          {project.days.map((day) => (
            <div
              key={day.dayNumber}
              className="rounded-2xl border-2 border-indigo-50 bg-indigo-50/30 p-3"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <p className="font-semibold text-gray-800">
                  {t("projects.dayN", { day: day.dayNumber })}
                </p>
                <button
                  type="button"
                  onClick={() => randomizeDay(day.dayNumber)}
                  className="text-xs font-semibold text-indigo-600 hover:underline"
                >
                  {t("projects.randomizeDay")}
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {PROJECT_SLOTS.map((slot) => {
                  const subjectId =
                    slot === "math"
                      ? "math"
                      : slot === "hebrew"
                        ? "hebrew"
                        : student.englishSubjectId;
                  const gameIds = gameIdsForSubject(subjectId);
                  const slotVal = day[slot];
                  return (
                    <label key={slot} className="text-xs">
                      <span className="font-semibold text-gray-600">{t(`projects.slot.${slot}`)}</span>
                      <select
                        value={slotVal.random ? "random" : slotVal.gameId}
                        onChange={(e) => updateDayGame(day.dayNumber, slot, e.target.value)}
                        className="mt-1 w-full rounded-lg border border-indigo-100 px-2 py-1.5 text-sm"
                      >
                        <option value="random">{t("projects.random")}</option>
                        {gameIds.map((gid) => (
                          <option key={gid} value={gid}>
                            {gameTitle(subjectId, gid)}
                          </option>
                        ))}
                      </select>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-emerald-700">{success}</p>}
    </div>
  );
}
