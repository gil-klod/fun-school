"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { DirectionalArrow } from "@/components/DirectionalArrow";
import { useLocale } from "@/i18n/LocaleProvider";
import { localizeAnalyticsKey } from "@/lib/analyticsKeys";
import {
  buildDashboardFeedback,
  buildDashboardRecommendations,
} from "@/lib/dashboardFeedback";
import type { Locale } from "@/i18n/types";
import { APP_CONTAINER } from "@/lib/layout";
import { StudentSelector, useStudent } from "@/components/students";
import { DashboardDailyProject } from "@/components/projects/DashboardDailyProject";
import type { DailyProjectPayload } from "@/lib/projects/types";

interface Analytics {
  strengths: string[];
  weaknesses: string[];
  aiFeedback: string;
  recommendations: string[];
  subjectStats: { subjectId: string; correct: number; wrong: number; accuracy: number; gamesPlayed: number }[];
  gameStats: { subjectId: string; gameId: string; correct: number; wrong: number; accuracy: number; score: number }[];
}

function parseStoredAiFeedback(raw: string, locale: Locale): string | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { he?: string; en?: string };
    const text = locale === "he" ? parsed.he : parsed.en;
    return text?.trim() ? text : null;
  } catch {
    return null;
  }
}

function parseStoredRecommendations(raw: string[], locale: Locale): string[] | null {
  if (raw.length !== 1) return null;
  try {
    const parsed = JSON.parse(raw[0]) as { he?: string[]; en?: string[] };
    const list = locale === "he" ? parsed.he : parsed.en;
    return list && list.length > 0 ? list : null;
  } catch {
    return null;
  }
}

export default function DashboardPage() {
  const { t, locale, subjectTitle, gameTitle } = useLocale();
  const { activeStudent, ready: studentReady } = useStudent();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [project, setProject] = useState<DailyProjectPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!studentReady) return;
    if (!activeStudent?.id) {
      setAnalytics(null);
      setProject(null);
      setLoading(false);
      return;
    }

    const studentId = activeStudent.id;
    let cancelled = false;

    async function loadDashboard() {
      setLoading(true);
      try {
        const [analyticsData, projectData] = await Promise.all([
          fetch(`/api/analytics?studentId=${studentId}`).then(async (res) =>
            res.ok ? res.json() : null
          ),
          fetch(`/api/projects?studentId=${studentId}`).then(async (res) =>
            res.ok ? res.json() : null
          ),
        ]);
        if (!cancelled) {
          setAnalytics(analyticsData?.analytics ?? null);
          setProject(projectData?.project ?? null);

          if (
            analyticsData?.analytics &&
            !analyticsData.analytics.gameStats.some(
              (g: { correct: number; wrong: number }) => g.correct + g.wrong > 0
            )
          ) {
            const progressRes = await fetch(`/api/progress?studentId=${studentId}`);
            if (progressRes.ok) {
              const progressData = await progressRes.json();
              const hasAnswers = (progressData.progresses ?? []).some(
                (p: { correct: number; wrong: number }) => p.correct + p.wrong > 0
              );
              if (hasAnswers) {
                const refreshRes = await fetch(`/api/analytics?studentId=${studentId}`, {
                  method: "POST",
                });
                if (refreshRes.ok && !cancelled) {
                  const refreshed = await refreshRes.json();
                  setAnalytics(refreshed.analytics ?? null);
                }
              }
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadDashboard();

    const refreshOnReturn = () => {
      if (document.visibilityState === "visible") {
        void loadDashboard();
      }
    };

    window.addEventListener("focus", refreshOnReturn);
    document.addEventListener("visibilitychange", refreshOnReturn);

    return () => {
      cancelled = true;
      window.removeEventListener("focus", refreshOnReturn);
      document.removeEventListener("visibilitychange", refreshOnReturn);
    };
  }, [activeStudent?.id, studentReady]);

  async function refresh() {
    if (!activeStudent?.id) return;
    setRefreshing(true);
    try {
      const res = await fetch(`/api/analytics?studentId=${activeStudent.id}`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data.analytics);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  }

  const localizedStrengths = useMemo(() => {
    if (!analytics) return [];
    return analytics.strengths.map((key) =>
      localizeAnalyticsKey(key, locale, subjectTitle, gameTitle)
    );
  }, [analytics, locale, subjectTitle, gameTitle]);

  const localizedWeaknesses = useMemo(() => {
    if (!analytics) return [];
    return analytics.weaknesses.map((key) =>
      localizeAnalyticsKey(key, locale, subjectTitle, gameTitle)
    );
  }, [analytics, locale, subjectTitle, gameTitle]);

  const coachFeedback = useMemo(() => {
    if (!analytics) return "";
    const stored = parseStoredAiFeedback(analytics.aiFeedback, locale);
    if (stored) return stored;
    return buildDashboardFeedback(
      t,
      localizedStrengths,
      localizedWeaknesses,
      analytics.subjectStats.length > 0
    );
  }, [analytics, locale, t, localizedStrengths, localizedWeaknesses]);

  const coachRecommendations = useMemo(() => {
    if (!analytics) return [];
    const stored = parseStoredRecommendations(analytics.recommendations, locale);
    if (stored) return stored;
    return buildDashboardRecommendations(t, localizedWeaknesses);
  }, [analytics, locale, t, localizedWeaknesses]);

  if (loading) {
    return (
      <main className={`flex-1 py-8 ${APP_CONTAINER} text-center`}>
        <p className="text-gray-500 text-lg">{t("common.loading")}</p>
      </main>
    );
  }

  const hasGameData = analytics && analytics.gameStats.some((g) => g.correct + g.wrong > 0);
  const hasDailyProject = !!project;

  return (
    <main className={`flex-1 py-6 sm:py-8 ${APP_CONTAINER}`}>
      <header className="text-center mb-8">
        <span className="text-5xl">📊</span>
        <h1 className="text-3xl font-bold text-gray-800 mt-2">{t("dashboard.title")}</h1>
        <p className="text-gray-500">{t("dashboard.subtitle")}</p>
        <div className="mt-4 flex justify-center">
          <StudentSelector />
        </div>
      </header>

      {!activeStudent ? (
        <div className="bg-white/90 rounded-3xl p-8 text-center border-2 border-indigo-100">
          <p className="text-xl text-gray-600 mb-4">{t("students.noStudents")}</p>
          <Link href="/settings" className="game-btn game-btn-primary inline-block">
            {t("students.add")}
          </Link>
        </div>
      ) : !hasDailyProject && !hasGameData ? (
        <div className="bg-white/90 rounded-3xl p-8 text-center border-2 border-indigo-100">
          <p className="text-xl text-gray-600 mb-4">{t("dashboard.empty")}</p>
          <Link href="/" className="game-btn game-btn-primary inline-block">
            {t("dashboard.startPlaying")}
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {hasDailyProject && <DashboardDailyProject project={project!} />}

          {!hasGameData ? (
            <div className="bg-white/90 rounded-2xl p-5 text-center border-2 border-indigo-100">
              <p className="text-gray-600">{t("dashboard.gamesEmptyHint")}</p>
            </div>
          ) : (
            <>
          <section className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-3xl p-6 shadow-lg">
            <h2 className="text-xl font-bold mb-2">{t("dashboard.coachTitle")}</h2>
            <p className="text-indigo-100 leading-relaxed">{coachFeedback}</p>
            <button
              onClick={refresh}
              disabled={refreshing}
              className="mt-4 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            >
              {refreshing ? t("common.updating") : t("dashboard.refreshAnalysis")}
            </button>
          </section>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <section className="bg-green-50 border-2 border-green-200 rounded-2xl p-5">
              <h3 className="font-bold text-green-800 text-lg mb-3">{t("dashboard.strengths")}</h3>
              {localizedStrengths.length > 0 ? (
                <ul className="space-y-2">
                  {localizedStrengths.map((s) => (
                    <li key={s} className="text-green-700 bg-green-100 rounded-lg px-3 py-2 text-sm font-medium">
                      {s}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-green-600 text-sm">{t("dashboard.noStrengths")}</p>
              )}
            </section>

            <section className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5">
              <h3 className="font-bold text-amber-800 text-lg mb-3">{t("dashboard.toImprove")}</h3>
              {localizedWeaknesses.length > 0 ? (
                <ul className="space-y-2">
                  {localizedWeaknesses.map((w) => (
                    <li key={w} className="text-amber-700 bg-amber-100 rounded-lg px-3 py-2 text-sm font-medium">
                      {w}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-amber-600 text-sm">{t("dashboard.lookingGood")}</p>
              )}
            </section>
          </div>

          {coachRecommendations.length > 0 && (
            <section className="bg-white/90 border-2 border-indigo-100 rounded-2xl p-5">
              <h3 className="font-bold text-indigo-800 text-lg mb-3">{t("dashboard.tips")}</h3>
              <ul className="space-y-2">
                {coachRecommendations.map((r, i) => (
                  <li key={i} className="text-gray-700 text-sm flex gap-2">
                    <DirectionalArrow className="text-indigo-400 shrink-0" /> {r}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="bg-white/90 border-2 border-indigo-100 rounded-2xl p-5">
            <h3 className="font-bold text-gray-800 text-lg mb-4">{t("dashboard.subjectBreakdown")}</h3>
            <div className="space-y-3">
              {analytics!.subjectStats.map((s) => (
                <div key={s.subjectId} className="flex items-center gap-3">
                  <span className="w-28 font-medium text-sm text-gray-700">
                    {subjectTitle(s.subjectId)}
                  </span>
                  <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                    <div
                      className="bg-indigo-500 h-full rounded-full transition-all"
                      style={{ width: `${s.accuracy}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-indigo-600 w-12 text-right">
                    {s.accuracy}%
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white/90 border-2 border-indigo-100 rounded-2xl p-5">
            <h3 className="font-bold text-gray-800 text-lg mb-4">{t("dashboard.gameDetails")}</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500 border-b">
                    <th className="text-start py-2">{t("dashboard.game")}</th>
                    <th className="text-end py-2">{t("common.score")}</th>
                    <th className="text-end py-2">{t("dashboard.accuracy")}</th>
                    <th className="text-end py-2">{t("dashboard.answers")}</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics!.gameStats
                    .filter((g) => g.correct + g.wrong > 0)
                    .sort((a, b) => b.accuracy - a.accuracy)
                    .map((g) => (
                      <tr key={`${g.subjectId}-${g.gameId}`} className="border-b border-gray-50">
                        <td className="py-2 font-medium">{gameTitle(g.subjectId, g.gameId)}</td>
                        <td className="text-end py-2">{g.score}</td>
                        <td className="text-end py-2">{g.accuracy}%</td>
                        <td className="text-end py-2 text-gray-500">
                          {g.correct}/{g.correct + g.wrong}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </section>
            </>
          )}
        </div>
      )}
    </main>
  );
}
