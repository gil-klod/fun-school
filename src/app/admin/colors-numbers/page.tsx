"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminNav } from "@/components/admin/AdminNav";
import { SpeakButton } from "@/components/EnglishSpeakButton";
import {
  COLORS_NUMBERS_REVIEW_STORAGE_KEY,
  exportBadQuestions,
  getColorsNumbersReviewRows,
  type ColorsNumbersReviewStatus,
} from "@/lib/content/colorsNumbersReview";

type ReviewMap = Record<string, ColorsNumbersReviewStatus>;
type ReviewFilter = "all" | "unchecked" | "bad" | "good";

const CATEGORY_LABEL: Record<string, string> = {
  color: "Color",
  number: "Number",
  shape: "Shape",
  food: "Food",
  vehicle: "Vehicle",
  animal: "Animal",
  body: "Body",
  clothing: "Clothing",
  school: "School",
  weather: "Weather",
  home: "Home",
  sport: "Sport",
};

function loadReviews(): ReviewMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(COLORS_NUMBERS_REVIEW_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ReviewMap) : {};
  } catch {
    return {};
  }
}

export default function AdminColorsNumbersPage() {
  const rows = useMemo(() => getColorsNumbersReviewRows(), []);
  const [reviews, setReviews] = useState<ReviewMap>({});
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setReviews(loadReviews());
  }, []);

  const persistReviews = useCallback((next: ReviewMap) => {
    setReviews(next);
    localStorage.setItem(COLORS_NUMBERS_REVIEW_STORAGE_KEY, JSON.stringify(next));
  }, []);

  const mark = useCallback(
    (key: string, status: ColorsNumbersReviewStatus | null) => {
      const next = { ...reviews };
      if (status) next[key] = status;
      else delete next[key];
      persistReviews(next);
    },
    [reviews, persistReviews]
  );

  const stats = useMemo(() => {
    let good = 0;
    let bad = 0;
    for (const row of rows) {
      if (reviews[row.key] === "good") good++;
      if (reviews[row.key] === "bad") bad++;
    }
    return { good, bad, unchecked: rows.length - good - bad, total: rows.length };
  }, [rows, reviews]);

  const categories = useMemo(() => [...new Set(rows.map((r) => r.type))], [rows]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      if (categoryFilter !== "all" && row.type !== categoryFilter) return false;
      const status = reviews[row.key];
      if (reviewFilter === "good") return status === "good";
      if (reviewFilter === "bad") return status === "bad";
      if (reviewFilter === "unchecked") return !status;
      return true;
    });
  }, [rows, reviews, reviewFilter, categoryFilter]);

  const badExport = useMemo(() => exportBadQuestions(rows, reviews), [rows, reviews]);
  const badExportJson = useMemo(() => JSON.stringify(badExport, null, 2), [badExport]);

  async function copyBadList() {
    await navigator.clipboard.writeText(badExportJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function clearAllReviews() {
    if (!confirm("Clear all good/bad marks on this browser?")) return;
    persistReviews({});
  }

  return (
    <main className="flex-1 w-full px-3 sm:px-6 py-6 max-w-6xl mx-auto">
      <AdminNav />
      <div className="flex flex-wrap items-end justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Colors &amp; Numbers QA
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            English beginners · צבעים ומספרים · {rows.length} questions · mark ✓ good or ✗ bad
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-sm font-semibold">
          <span className="px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800">
            ✓ {stats.good}
          </span>
          <span className="px-3 py-1.5 rounded-full bg-red-100 text-red-800">✗ {stats.bad}</span>
          <span className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-700">
            ? {stats.unchecked}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <select
          value={reviewFilter}
          onChange={(e) => setReviewFilter(e.target.value as ReviewFilter)}
          className="rounded-xl border-2 border-indigo-100 px-3 py-2 text-sm font-semibold bg-white"
        >
          <option value="all">All ({stats.total})</option>
          <option value="unchecked">Unchecked ({stats.unchecked})</option>
          <option value="bad">Bad ({stats.bad})</option>
          <option value="good">Good ({stats.good})</option>
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-xl border-2 border-indigo-100 px-3 py-2 text-sm font-semibold bg-white"
        >
          <option value="all">All categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {CATEGORY_LABEL[cat] ?? cat}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={copyBadList}
          disabled={badExport.length === 0}
          className="px-4 py-2 rounded-xl text-sm font-semibold bg-red-100 text-red-900 hover:bg-red-200 disabled:opacity-40"
        >
          {copied ? "Copied!" : `Copy ${badExport.length} bad as JSON`}
        </button>
        <button
          type="button"
          onClick={clearAllReviews}
          className="px-4 py-2 rounded-xl text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200"
        >
          Clear marks
        </button>
      </div>

      <div className="space-y-3">
        {filteredRows.map((row) => {
          const status = reviews[row.key];
          const bg =
            status === "good"
              ? "border-emerald-300 bg-emerald-50/80"
              : status === "bad"
                ? "border-red-300 bg-red-50/80"
                : "border-indigo-100 bg-white/90";

          return (
            <article
              key={row.key}
              className={`rounded-2xl border-2 p-4 sm:p-5 shadow-sm ${bg}`}
            >
              <div className="flex flex-wrap items-start gap-4">
                <div className="flex flex-col items-center shrink-0 w-20">
                  <span className="text-5xl leading-none" aria-hidden>
                    {row.emoji}
                  </span>
                  <span className="text-xs text-gray-400 mt-2">#{row.index}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wide text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                      {CATEGORY_LABEL[row.type] ?? row.type}
                    </span>
                    <span className="text-xs text-gray-400 font-mono">{row.key}</span>
                  </div>
                  <p className="text-sm text-gray-600">{row.promptHe}</p>
                  <p className="text-sm text-gray-500 mb-3" dir="ltr">
                    {row.prompt}
                  </p>

                  <p className="text-sm font-semibold text-gray-700 mb-2">Answer</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-bold">
                      {row.answer}
                      <SpeakButton text={row.answer} size="sm" />
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-gray-700 mb-2">Options</p>
                  <div className="flex flex-wrap gap-2">
                    {row.options.map((opt) => (
                      <span
                        key={opt}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm font-semibold border-2 ${
                          opt === row.answer
                            ? "border-emerald-400 bg-emerald-100 text-emerald-900"
                            : "border-gray-200 bg-gray-50 text-gray-800"
                        }`}
                      >
                        {opt}
                        <SpeakButton text={opt} size="sm" />
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => mark(row.key, status === "good" ? null : "good")}
                    className={`px-4 py-2 rounded-xl text-sm font-bold ${
                      status === "good"
                        ? "bg-emerald-600 text-white"
                        : "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                    }`}
                    title="Looks good"
                  >
                    ✓ Good
                  </button>
                  <button
                    type="button"
                    onClick={() => mark(row.key, status === "bad" ? null : "bad")}
                    className={`px-4 py-2 rounded-xl text-sm font-bold ${
                      status === "bad"
                        ? "bg-red-600 text-white"
                        : "bg-red-100 text-red-800 hover:bg-red-200"
                    }`}
                    title="Wrong emoji, options, or wording"
                  >
                    ✗ Bad
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {badExport.length > 0 && (
        <section className="mt-8 rounded-2xl border-2 border-red-200 bg-red-50/50 p-4">
          <h2 className="font-bold text-red-900 mb-2">Bad questions ({badExport.length})</h2>
          <p className="text-sm text-red-800 mb-3">
            Copy this list and send it when asking to fix the data file.
          </p>
          <pre className="text-xs bg-white border border-red-100 rounded-xl p-3 overflow-x-auto max-h-64">
            {badExportJson}
          </pre>
        </section>
      )}
    </main>
  );
}
