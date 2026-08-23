"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminNav } from "@/components/admin/AdminNav";
import { SpeakButton, StorySpeakButton } from "@/components/EnglishSpeakButton";
import {
  exportStoriesForFix,
  getHebrewStoriesReviewRows,
  HEBREW_STORIES_REVIEW_STORAGE_KEY,
  parseHebrewStoriesReviewMap,
  type HebrewStoriesReviewMap,
  type HebrewStoriesReviewStatus,
  type HebrewStoryLevel,
} from "@/lib/content/hebrewStoriesReview";

type ReviewFilter = "all" | "unchecked" | "bad" | "good" | "notes";

const LEVEL_LABEL: Record<HebrewStoryLevel, string> = {
  1: "Level 1 · קל",
  2: "Level 2 · בינוני",
  3: "Level 3 · קשה",
};

function loadReviews(): HebrewStoriesReviewMap {
  if (typeof window === "undefined") return {};
  return parseHebrewStoriesReviewMap(localStorage.getItem(HEBREW_STORIES_REVIEW_STORAGE_KEY));
}

export default function AdminHebrewStoriesPage() {
  const rows = useMemo(() => getHebrewStoriesReviewRows(), []);
  const [reviews, setReviews] = useState<HebrewStoriesReviewMap>({});
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>("all");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [showNikud, setShowNikud] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setReviews(loadReviews());
  }, []);

  const persistReviews = useCallback((next: HebrewStoriesReviewMap) => {
    setReviews(next);
    localStorage.setItem(HEBREW_STORIES_REVIEW_STORAGE_KEY, JSON.stringify(next));
  }, []);

  const mark = useCallback(
    (key: string, status: HebrewStoriesReviewStatus | null) => {
      const current = reviews[key] ?? {};
      const next = { ...reviews };
      if (status) {
        next[key] = { ...current, status };
      } else {
        const { status: _removed, ...rest } = current;
        if (rest.issue?.trim()) next[key] = rest;
        else delete next[key];
      }
      persistReviews(next);
    },
    [reviews, persistReviews]
  );

  const setIssue = useCallback(
    (key: string, issue: string) => {
      const current = reviews[key] ?? {};
      const next = { ...reviews };
      const trimmed = issue.trim();
      if (trimmed || current.status) {
        next[key] = { ...current, issue: trimmed || undefined };
      } else {
        delete next[key];
      }
      persistReviews(next);
    },
    [reviews, persistReviews]
  );

  const stats = useMemo(() => {
    let good = 0;
    let bad = 0;
    let notes = 0;
    for (const row of rows) {
      const entry = reviews[row.key];
      if (entry?.status === "good") good++;
      if (entry?.status === "bad") bad++;
      if (entry?.issue?.trim()) notes++;
    }
    return { good, bad, notes, unchecked: rows.length - good - bad, total: rows.length };
  }, [rows, reviews]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      if (levelFilter !== "all" && String(row.level) !== levelFilter) return false;
      const entry = reviews[row.key];
      const status = entry?.status;
      const hasNotes = Boolean(entry?.issue?.trim());
      if (reviewFilter === "good") return status === "good";
      if (reviewFilter === "bad") return status === "bad";
      if (reviewFilter === "unchecked") return !status;
      if (reviewFilter === "notes") return hasNotes;
      return true;
    });
  }, [rows, reviews, reviewFilter, levelFilter]);

  const fixExport = useMemo(() => exportStoriesForFix(rows, reviews), [rows, reviews]);
  const fixExportJson = useMemo(() => JSON.stringify(fixExport, null, 2), [fixExport]);

  async function copyFixList() {
    await navigator.clipboard.writeText(fixExportJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function clearAllReviews() {
    if (!confirm("Clear all marks and issue notes on this browser?")) return;
    persistReviews({});
  }

  return (
    <main className="flex-1 w-full px-3 sm:px-6 py-6 max-w-6xl mx-auto">
      <AdminNav />
      <div className="flex flex-wrap items-end justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Hebrew Stories QA</h1>
          <p className="text-sm text-gray-500 mt-1">
            בלש הסיפורים · {rows.length} stories · mark ✓/✗ and describe issues
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-sm font-semibold">
          <span className="px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800">
            ✓ {stats.good}
          </span>
          <span className="px-3 py-1.5 rounded-full bg-red-100 text-red-800">✗ {stats.bad}</span>
          <span className="px-3 py-1.5 rounded-full bg-amber-100 text-amber-900">
            ✎ {stats.notes}
          </span>
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
          <option value="notes">With notes ({stats.notes})</option>
        </select>
        <select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
          className="rounded-xl border-2 border-indigo-100 px-3 py-2 text-sm font-semibold bg-white"
        >
          <option value="all">All levels</option>
          <option value="1">Level 1 · קל</option>
          <option value="2">Level 2 · בינוני</option>
          <option value="3">Level 3 · קשה</option>
        </select>
        <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border-2 border-indigo-100 bg-white text-sm font-semibold cursor-pointer">
          <input
            type="checkbox"
            checked={showNikud}
            onChange={(e) => setShowNikud(e.target.checked)}
            className="rounded"
          />
          Show nikud
        </label>
        <button
          type="button"
          onClick={copyFixList}
          disabled={fixExport.length === 0}
          className="px-4 py-2 rounded-xl text-sm font-semibold bg-red-100 text-red-900 hover:bg-red-200 disabled:opacity-40"
        >
          {copied ? "Copied!" : `Copy ${fixExport.length} for fix (JSON)`}
        </button>
        <button
          type="button"
          onClick={clearAllReviews}
          className="px-4 py-2 rounded-xl text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200"
        >
          Clear all
        </button>
      </div>

      <div className="space-y-3">
        {filteredRows.map((row) => {
          const entry = reviews[row.key];
          const status = entry?.status;
          const issue = entry?.issue ?? "";
          const hasNotes = Boolean(issue.trim());
          const bg =
            status === "good"
              ? "border-emerald-300 bg-emerald-50/80"
              : status === "bad" || hasNotes
                ? "border-red-300 bg-red-50/80"
                : "border-indigo-100 bg-white/90";
          const displayTitle =
            showNikud && row.titleNikud ? row.titleNikud : row.title;
          const displayText = showNikud && row.textNikud ? row.textNikud : row.text;

          return (
            <article
              key={row.key}
              className={`rounded-2xl border-2 p-4 sm:p-5 shadow-sm ${bg}`}
            >
              <div className="flex flex-wrap items-start gap-4">
                <div className="flex flex-col items-center shrink-0 w-16">
                  <span className="text-4xl leading-none" aria-hidden>
                    📖
                  </span>
                  <span className="text-xs text-gray-400 mt-2">#{row.index}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wide text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                      {LEVEL_LABEL[row.level]}
                    </span>
                    <span className="text-xs text-gray-500">
                      {row.questionCount} questions
                      {!row.hasNikud ? " · no nikud" : ""}
                    </span>
                    <span className="text-xs text-gray-400 font-mono">{row.key}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <h2 className="text-lg font-bold text-gray-900">{displayTitle}</h2>
                    <SpeakButton text={row.title} locale="he" size="sm" />
                    <StorySpeakButton title={row.title} text={row.text} locale="he" />
                  </div>

                  <p className="text-base text-gray-800 leading-relaxed mb-4 whitespace-pre-wrap">
                    {displayText}
                  </p>

                  <p className="text-sm font-semibold text-gray-700 mb-2">Questions</p>
                  <div className="space-y-3 mb-4">
                    {row.questions.map((q, qi) => (
                      <div
                        key={`${row.key}-q${qi}`}
                        className="rounded-xl border border-gray-200 bg-gray-50/80 p-3"
                      >
                        <p className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                          <span>
                            {qi + 1}. {q.question}
                          </span>
                          <SpeakButton text={q.question} locale="he" size="sm" />
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {q.options.map((opt, oi) => (
                            <span
                              key={opt}
                              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm font-semibold border-2 ${
                                oi === q.correctIndex
                                  ? "border-emerald-400 bg-emerald-100 text-emerald-900"
                                  : "border-gray-200 bg-white text-gray-800"
                              }`}
                            >
                              {opt}
                              <SpeakButton text={opt} locale="he" size="sm" />
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <label className="block">
                    <span className="text-sm font-semibold text-gray-700 mb-1.5 block">
                      Issue notes
                      <span className="font-normal text-gray-500"> — what is wrong? (Hebrew or English)</span>
                    </span>
                    <textarea
                      value={issue}
                      onChange={(e) => setIssue(row.key, e.target.value)}
                      placeholder="e.g. שגיאת כתיב בפסקה 2, תשובה לא נכונה בשאלה 3…"
                      rows={3}
                      dir="auto"
                      className="w-full rounded-xl border-2 border-amber-200 bg-amber-50/50 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-amber-400 focus:outline-none"
                    />
                  </label>
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
                    title="Wrong story text, questions, or answers"
                  >
                    ✗ Bad
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {fixExport.length > 0 && (
        <section className="mt-8 rounded-2xl border-2 border-red-200 bg-red-50/50 p-4">
          <h2 className="font-bold text-red-900 mb-2">Stories to fix ({fixExport.length})</h2>
          <p className="text-sm text-red-800 mb-3">
            Bad marks or notes you wrote — copy and send when asking to fix the story files.
          </p>
          <pre className="text-xs bg-white border border-red-100 rounded-xl p-3 overflow-x-auto max-h-64">
            {fixExportJson}
          </pre>
        </section>
      )}
    </main>
  );
}
