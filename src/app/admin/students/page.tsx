"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AdminNav } from "@/components/admin/AdminNav";
import { DirectionalArrow } from "@/components/DirectionalArrow";
import type { AdminStudentRow, AdminStudentStatsSummary } from "@/lib/admin/studentStats";

type Filter = "all" | "active" | "inactive" | "never";

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString();
}

function activityBadge(row: AdminStudentRow) {
  if (!row.hasPlayed) {
    return (
      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
        Never played
      </span>
    );
  }
  if (row.isActive) {
    return (
      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
        Active
      </span>
    );
  }
  return (
    <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
      Inactive
    </span>
  );
}

export default function AdminStudentsPage() {
  const [summary, setSummary] = useState<AdminStudentStatsSummary | null>(null);
  const [students, setStudents] = useState<AdminStudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/students");
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setSummary(data.summary);
      setStudents(data.students ?? []);
    } catch {
      setError("Could not load student statistics.");
      setSummary(null);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return students.filter((row) => {
      if (filter === "active" && !row.isActive) return false;
      if (filter === "inactive" && (!row.hasPlayed || row.isActive)) return false;
      if (filter === "never" && row.hasPlayed) return false;
      if (!q) return true;
      return (
        row.studentName.toLowerCase().includes(q) ||
        row.parentName.toLowerCase().includes(q) ||
        row.parentEmail.toLowerCase().includes(q)
      );
    });
  }, [students, filter, search]);

  const summaryCards = summary
    ? [
        { label: "Students", value: summary.totalStudents, color: "text-indigo-600" },
        { label: "Parents", value: summary.totalParents, color: "text-indigo-600" },
        { label: "Active (7d)", value: summary.activeLast7Days, color: "text-green-600" },
        { label: "Active (30d)", value: summary.activeLast30Days, color: "text-green-700" },
        { label: "Never played", value: summary.neverPlayed, color: "text-amber-600" },
        { label: "New (7d)", value: summary.registeredLast7Days, color: "text-blue-600" },
      ]
    : [];

  return (
    <main className="flex-1 px-4 py-8 max-w-6xl mx-auto w-full">
      <AdminNav />
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Students</h1>
          <p className="text-gray-500 text-sm mt-1">
            See who registered and whether classmates are playing
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-800"
        >
          <DirectionalArrow direction="back" />
          Home
        </Link>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : error ? (
        <p className="text-red-700 bg-red-50 rounded-xl px-4 py-3">{error}</p>
      ) : (
        <>
          <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            {summaryCards.map((card) => (
              <div
                key={card.label}
                className="bg-white/90 border-2 border-indigo-100 rounded-2xl p-4 text-center"
              >
                <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
                <p className="text-xs text-gray-500 mt-1">{card.label}</p>
              </div>
            ))}
          </section>

          <section className="bg-white/90 border-2 border-indigo-100 rounded-2xl p-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ["all", "All"],
                    ["active", "Active (7d)"],
                    ["inactive", "Inactive"],
                    ["never", "Never played"],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setFilter(key)}
                    className={`px-3 py-1.5 rounded-xl text-sm font-semibold border-2 transition-colors ${
                      filter === key
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-white text-indigo-700 border-indigo-100 hover:border-indigo-300"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <input
                type="search"
                placeholder="Search name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 min-w-[200px] px-3 py-2 rounded-xl border-2 border-indigo-100 text-sm focus:outline-none focus:border-indigo-400"
              />
              <button
                type="button"
                onClick={load}
                className="px-3 py-2 rounded-xl text-sm font-semibold border-2 border-indigo-100 text-indigo-700 hover:border-indigo-300"
              >
                Refresh
              </button>
            </div>

            {filtered.length === 0 ? (
              <p className="text-gray-500 text-sm py-8 text-center">
                {students.length === 0
                  ? "No students registered yet."
                  : "No students match this filter."}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b border-indigo-50">
                      <th className="py-2 pr-3 font-semibold">Student</th>
                      <th className="py-2 pr-3 font-semibold">Parent</th>
                      <th className="py-2 pr-3 font-semibold">Status</th>
                      <th className="py-2 pr-3 font-semibold">Last played</th>
                      <th className="py-2 pr-3 font-semibold">Games</th>
                      <th className="py-2 pr-3 font-semibold">Accuracy</th>
                      <th className="py-2 font-semibold">Project</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row) => (
                      <tr key={row.studentId} className="border-b border-indigo-50/80">
                        <td className="py-3 pr-3">
                          <p className="font-semibold text-gray-800">{row.studentName}</p>
                          <p className="text-xs text-gray-400">
                            Age {row.age} · joined {formatDate(row.registeredAt)}
                          </p>
                        </td>
                        <td className="py-3 pr-3">
                          <p className="text-gray-700">{row.parentName}</p>
                          <p className="text-xs text-gray-400">{row.parentEmail}</p>
                        </td>
                        <td className="py-3 pr-3">{activityBadge(row)}</td>
                        <td className="py-3 pr-3 text-gray-700">
                          {row.hasPlayed && row.lastPlayedLabel ? (
                            <>
                              <p>{row.lastPlayedLabel}</p>
                              {row.lastPlayedDetail && (
                                <p className="text-xs text-gray-400">{row.lastPlayedDetail}</p>
                              )}
                            </>
                          ) : (
                            "Never"
                          )}
                        </td>
                        <td className="py-3 pr-3 text-gray-700">
                          {row.hasPlayed ? (
                            <>
                              {row.gamesWithActivity} played
                              {row.completedGames > 0 && (
                                <span className="text-gray-400">
                                  {" "}
                                  · {row.completedGames} done
                                </span>
                              )}
                            </>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="py-3 pr-3 text-gray-700">
                          {row.hasPlayed ? `${row.accuracy}%` : "—"}
                        </td>
                        <td className="py-3 text-gray-700">
                          {row.projectStatus === "none" ? (
                            "—"
                          ) : (
                            <>
                              Day {row.projectDay}/{row.projectTotalDays}
                              {row.projectStatus === "completed" && (
                                <span className="text-green-600 text-xs ml-1">✓</span>
                              )}
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}
