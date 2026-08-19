"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { DirectionalArrow } from "@/components/DirectionalArrow";
import { AdminNav } from "@/components/admin/AdminNav";
import { EXAMPLE_IMPORT_JSON } from "@/lib/content/import";

interface GameStat {
  subjectId: string;
  gameId: string;
  count: number;
}

interface ActionResult {
  type: "success" | "error";
  message: string;
  details?: string[];
}

export default function AdminPage() {
  const [stats, setStats] = useState<{ total: number; games: GameStat[] } | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [jsonInput, setJsonInput] = useState(EXAMPLE_IMPORT_JSON);
  const [busy, setBusy] = useState<"seed" | "import" | null>(null);
  const [result, setResult] = useState<ActionResult | null>(null);

  const loadStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
      }
    } catch {
      setStats(null);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  async function loadDefaults() {
    if (!confirm("This replaces ALL game content with the built-in defaults. Continue?")) {
      return;
    }

    setBusy("seed");
    setResult(null);
    try {
      const res = await fetch("/api/admin/seed-defaults", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Seed failed");
      setResult({
        type: "success",
        message: `Loaded ${data.inserted} default content items.`,
      });
      await loadStats();
    } catch (err) {
      setResult({
        type: "error",
        message: err instanceof Error ? err.message : "Seed failed",
      });
    } finally {
      setBusy(null);
    }
  }

  async function importJson() {
    setBusy("import");
    setResult(null);
    try {
      const parsed = JSON.parse(jsonInput);
      const res = await fetch("/api/admin/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? data.message ?? "Import failed");
      }
      setResult({
        type: data.errors?.length ? "error" : "success",
        message: data.message ?? `Imported ${data.inserted} item(s).`,
        details: data.errors,
      });
      await loadStats();
    } catch (err) {
      setResult({
        type: "error",
        message: err instanceof Error ? err.message : "Import failed",
      });
    } finally {
      setBusy(null);
    }
  }

  return (
    <main className="flex-1 px-4 py-8 max-w-3xl mx-auto w-full">
      <AdminNav />
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Admin</h1>
          <p className="text-gray-500 text-sm mt-1">Manage game content in the database</p>
        </div>
        <Link href="/" className="inline-flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-800">
          <DirectionalArrow direction="back" />
          Home
        </Link>
      </div>

      <section className="bg-white/90 border-2 border-indigo-100 rounded-2xl p-5 mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-3">Content in database</h2>
        {loadingStats ? (
          <p className="text-gray-500">Loading...</p>
        ) : stats && stats.total > 0 ? (
          <>
            <p className="text-2xl font-bold text-indigo-600 mb-4">{stats.total} items total</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              {stats.games.map((g) => (
                <Link
                  key={`${g.subjectId}-${g.gameId}`}
                  href={`/admin/content/${g.subjectId}/${g.gameId}`}
                  className="bg-indigo-50 rounded-lg px-3 py-2 flex justify-between hover:bg-indigo-100 transition-colors"
                >
                  <span className="font-medium">
                    {g.subjectId} / {g.gameId}
                  </span>
                  <span className="text-indigo-600 font-bold">{g.count} →</span>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <p className="text-amber-700 bg-amber-50 rounded-xl px-4 py-3">
            No content yet. Click &quot;Load default games&quot; below to get started.
          </p>
        )}
      </section>

      <section className="bg-white/90 border-2 border-green-100 rounded-2xl p-5 mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-2">Load default games</h2>
        <p className="text-sm text-gray-600 mb-4">
          Loads all built-in questions, stories, words, and configs (easy / medium / hard). Replaces
          existing content.
        </p>
        <button
          onClick={loadDefaults}
          disabled={busy !== null}
          className="game-btn game-btn-primary disabled:opacity-50"
        >
          {busy === "seed" ? "Loading..." : "Load default games"}
        </button>
      </section>

      <section className="bg-white/90 border-2 border-purple-100 rounded-2xl p-5 mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-2">Add content from JSON</h2>
        <p className="text-sm text-gray-600 mb-3">
          Paste a JSON array (or {"{ \"items\": [...] }"}). Each item needs:{" "}
          <code className="bg-gray-100 px-1 rounded">subjectId</code>,{" "}
          <code className="bg-gray-100 px-1 rounded">gameId</code>,{" "}
          <code className="bg-gray-100 px-1 rounded">difficulty</code> (1–3),{" "}
          <code className="bg-gray-100 px-1 rounded">itemType</code>,{" "}
          <code className="bg-gray-100 px-1 rounded">data</code>.
        </p>
        <p className="text-xs text-gray-500 mb-3">
          Types: quiz, word, vocab, sentence, story, fix-sentence, color-number, shuk-item,
          mystery-template, config
        </p>
        <textarea
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          rows={16}
          dir="ltr"
          className="w-full font-mono text-sm border-2 border-purple-200 rounded-xl p-4 mb-4 focus:border-purple-400 focus:outline-none"
          spellCheck={false}
        />
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={importJson}
            disabled={busy !== null}
            className="game-btn game-btn-primary disabled:opacity-50"
          >
            {busy === "import" ? "Importing..." : "Import JSON"}
          </button>
          <button
            type="button"
            onClick={() => setJsonInput(EXAMPLE_IMPORT_JSON)}
            className="px-4 py-2 rounded-xl border-2 border-purple-200 text-purple-700 font-semibold hover:border-purple-400"
          >
            Reset to example
          </button>
        </div>
      </section>

      {result && (
        <div
          className={`rounded-2xl border-2 px-5 py-4 ${
            result.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <p className="font-semibold">{result.message}</p>
          {result.details && result.details.length > 0 && (
            <ul className="mt-2 text-sm list-disc list-inside">
              {result.details.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </main>
  );
}
