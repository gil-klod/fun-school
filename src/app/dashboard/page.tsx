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
import { buildStatsFromProgressRecords, hasAnsweredGames, type GameStat, type SubjectStat } from "@/lib/progressStats";

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
  const [subjectStats, setSubjectStats] = useState<SubjectStat[]>([]);
  const [gameStats, setGameStats] = useState<GameStat[]>([]);
  const [project, setProject] = useState<DailyProjectPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!studentReady) return;
    if (!activeStudent?.id) {
      setAnalytics(null);
      setSubjectStats([]);
      setGameStats([]);
      setProject(null);
      setLoading(false);
      return;
    }

    const studentId = activeStudent.id;
    let cancelled = false;

    async function loadDashboard() {
      setLoading(true);
      try {
        const [analyticsData, projectData, progressData] = await Promise.all([
          fetch(`/api/analytics?studentId=${studentId}`, { credentials: "same-origin" }).then(async (res) =>
            res.ok ? res.json() : null
          ),
          fetch(`/api/projects?studentId=${studentId}`, { credentials: "same-origin" }).then(async (res) =>
            res.ok ? res.json() : null
          ),
          fetch(`/api/progress?studentId=${studentId}`, { credentials: "same-origin" }).then(async (res) =>
            res.ok ? res.json() : { progresses: [] }
          ),
        ]);
        if (!cancelled) {
          const progressStats = buildStatsFromProgressRecords(progressData.progresses ?? []);
          setSubjectStats(progressStats.subjectStats);
          setGameStats(progressStats.gameStats);
          setAnalytics(analyticsData?.analytics ?? null);
          setProject(projectData?.project ?? null);
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
      const res = await fetch(`/api/analytics?studentId=${activeStudent.id}`, {
        method: "POST",
        credentials: "same-origin",
      });
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data.analytics);
      }
      const progressRes = await fetch(`/api/progress?studentId=${activeStudent.id}`, {
        credentials: "same-origin",
      });
      if (progressRes.ok) {
        const progressData = await progressRes.json();
        const progressStats = buildStatsFromProgressRecords(progressData.progresses ?? []);
        setSubjectStats(progressStats.subjectStats);
        setGameStats(progressStats.gameStats);
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
    if (analytics) {
      const stored = parseStoredAiFeedback(analytics.aiFeedback, locale);
      if (stored) return stored;
    }
    return buildDashboardFeedback(
      t,
      localizedStrengths,
      localizedWeaknesses,
      subjectStats.length > 0
    );
  }, [analytics, locale, t, localizedStrengths, localizedWeaknesses, subjectStats.length]);

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

  const hasGameData = hasAnsweredGames(gameStats);
  const hasDailyProject = !!project;
  const playedGames = gameStats.filter((g) => (g.correct ?? 0) + (g.wrong ?? 0) > 0);

  return (
    <main className={`flex-1 py-6 sm:py-8 ${APP_CONTAINER}`}>
      <header className="text-center mb-8">
        <span className="text-5xl">📊</span>
        <h1 className="text-3xl font-bold text-gray-800 mt-2">{t("dashboard.title")}</h1>
        <p className="text-gray-500">{t("dashboard.subtitle")}</p>
        {activeStudent && (
          <p className="text-sm text-indigo-600 mt-1 font-medium">
            {t("dashboard.trackingStudent", { name: activeStudent.name })}
          </p>
        )}
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
            <div className="bg-white/90 rounded-2xl p-5 text-center border-2 border-indigo-100 space-y-2">
              <p className="text-gray-600">{t("dashboard.gamesEmptyHint")}</p>
              <p className="text-sm text-gray-500">{t("dashboard.gamesEmptySteps")}</p>
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
              {subjectStats.map((s) => (
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
                  {playedGames
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
