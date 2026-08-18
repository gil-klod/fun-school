"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BackButton } from "@/components/BackButton";
import { getGameLabel, getSubjectLabel } from "@/lib/games";

interface Analytics {
  strengths: string[];
  weaknesses: string[];
  aiFeedback: string;
  recommendations: string[];
  subjectStats: { subjectId: string; correct: number; wrong: number; accuracy: number; gamesPlayed: number }[];
  gameStats: { subjectId: string; gameId: string; correct: number; wrong: number; accuracy: number; score: number }[];
  updatedAt: string;
}

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load(refresh = false) {
    if (refresh) setRefreshing(true);
    try {
      const res = await fetch(refresh ? "/api/analytics" : "/api/analytics", {
        method: refresh ? "POST" : "GET",
      });
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data.analytics);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetch("/api/analytics")
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          setAnalytics(data.analytics);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main className="flex-1 px-4 py-8 max-w-3xl mx-auto text-center">
        <p className="text-gray-500 text-lg">Loading your progress...</p>
      </main>
    );
  }

  const hasData = analytics && analytics.gameStats.some((g) => g.correct + g.wrong > 0);

  return (
    <main className="flex-1 px-4 py-8 max-w-3xl mx-auto w-full">
      <BackButton href="/" label="Home" />

      <header className="text-center mb-8">
        <span className="text-5xl">📊</span>
        <h1 className="text-3xl font-bold text-gray-800 mt-2">My Progress</h1>
        <p className="text-gray-500" dir="rtl">ההתקדמות שלי</p>
      </header>

      {!hasData ? (
        <div className="bg-white/90 rounded-3xl p-8 text-center border-2 border-indigo-100">
          <p className="text-xl text-gray-600 mb-4">Play some games to see your stats! 🎮</p>
          <Link href="/" className="game-btn game-btn-primary inline-block">
            Start Playing
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* AI Feedback */}
          <section className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-3xl p-6 shadow-lg">
            <h2 className="text-xl font-bold mb-2">🤖 Your Learning Coach</h2>
            <p className="text-indigo-100 leading-relaxed">{analytics!.aiFeedback}</p>
            <button
              onClick={() => load(true)}
              disabled={refreshing}
              className="mt-4 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            >
              {refreshing ? "Updating..." : "Refresh Analysis"}
            </button>
          </section>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <section className="bg-green-50 border-2 border-green-200 rounded-2xl p-5">
              <h3 className="font-bold text-green-800 text-lg mb-3">💪 Strengths</h3>
              {analytics!.strengths.length > 0 ? (
                <ul className="space-y-2">
                  {analytics!.strengths.map((s) => (
                    <li key={s} className="text-green-700 bg-green-100 rounded-lg px-3 py-2 text-sm font-medium">
                      {s}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-green-600 text-sm">Keep playing to discover strengths!</p>
              )}
            </section>

            <section className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5">
              <h3 className="font-bold text-amber-800 text-lg mb-3">📚 To Improve</h3>
              {analytics!.weaknesses.length > 0 ? (
                <ul className="space-y-2">
                  {analytics!.weaknesses.map((w) => (
                    <li key={w} className="text-amber-700 bg-amber-100 rounded-lg px-3 py-2 text-sm font-medium">
                      {w}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-amber-600 text-sm">Looking good across the board!</p>
              )}
            </section>
          </div>

          {/* Recommendations */}
          {analytics!.recommendations.length > 0 && (
            <section className="bg-white/90 border-2 border-indigo-100 rounded-2xl p-5">
              <h3 className="font-bold text-indigo-800 text-lg mb-3">💡 Tips for You</h3>
              <ul className="space-y-2">
                {analytics!.recommendations.map((r, i) => (
                  <li key={i} className="text-gray-700 text-sm flex gap-2">
                    <span className="text-indigo-400">→</span> {r}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Subject Stats */}
          <section className="bg-white/90 border-2 border-indigo-100 rounded-2xl p-5">
            <h3 className="font-bold text-gray-800 text-lg mb-4">Subject Breakdown</h3>
            <div className="space-y-3">
              {analytics!.subjectStats.map((s) => (
                <div key={s.subjectId} className="flex items-center gap-3">
                  <span className="w-28 font-medium text-sm text-gray-700">
                    {getSubjectLabel(s.subjectId)}
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

          {/* Game Stats */}
          <section className="bg-white/90 border-2 border-indigo-100 rounded-2xl p-5">
            <h3 className="font-bold text-gray-800 text-lg mb-4">Game Details</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500 border-b">
                    <th className="text-left py-2">Game</th>
                    <th className="text-right py-2">Score</th>
                    <th className="text-right py-2">Accuracy</th>
                    <th className="text-right py-2">Answers</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics!.gameStats
                    .filter((g) => g.correct + g.wrong > 0)
                    .sort((a, b) => b.accuracy - a.accuracy)
                    .map((g) => (
                      <tr key={`${g.subjectId}-${g.gameId}`} className="border-b border-gray-50">
                        <td className="py-2 font-medium">{getGameLabel(g.subjectId, g.gameId)}</td>
                        <td className="text-right py-2">{g.score}</td>
                        <td className="text-right py-2">{g.accuracy}%</td>
                        <td className="text-right py-2 text-gray-500">
                          {g.correct}/{g.correct + g.wrong}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
