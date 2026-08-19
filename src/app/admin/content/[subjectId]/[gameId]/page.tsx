"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import { getSubject } from "@/lib/subjects";
import type { DifficultyLevel } from "@/lib/content/types";

interface ContentItem {
  id: string;
  itemType: string;
  sortOrder: number;
  data: Record<string, unknown>;
}

interface ActionResult {
  type: "success" | "error";
  message: string;
  details?: string[];
}

const DIFFICULTIES: DifficultyLevel[] = [1, 2, 3];

export default function AdminGameContentPage() {
  const params = useParams<{ subjectId: string; gameId: string }>();
  const subjectId = params.subjectId;
  const gameId = params.gameId;
  const subject = getSubject(subjectId);
  const game = subject?.games.find((g) => g.id === gameId);

  const [difficulty, setDifficulty] = useState<DifficultyLevel>(2);
  const [items, setItems] = useState<ContentItem[]>([]);
  const [jsonInput, setJsonInput] = useState("[]");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [result, setResult] = useState<ActionResult | null>(null);
  const [preview, setPreview] = useState<string>("");

  const exportPayload = useMemo(
    () =>
      items.map(({ itemType, sortOrder, data }) => ({
        subjectId,
        gameId,
        difficulty,
        itemType,
        sortOrder,
        data,
        active: true,
      })),
    [items, subjectId, gameId, difficulty]
  );

  const loadItems = useCallback(async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(
        `/api/admin/content?subjectId=${subjectId}&gameId=${gameId}&difficulty=${difficulty}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load");
      setItems(data.items ?? []);
      setJsonInput(JSON.stringify(data.items?.map((i: ContentItem) => ({
        itemType: i.itemType,
        sortOrder: i.sortOrder,
        data: i.data,
        active: true,
      })) ?? [], null, 2));
    } catch (err) {
      setResult({
        type: "error",
        message: err instanceof Error ? err.message : "Load failed",
      });
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [subjectId, gameId, difficulty]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  async function replaceContent() {
    if (!confirm("Replace ALL content for this difficulty level? This cannot be undone.")) return;

    setBusy("replace");
    setResult(null);
    try {
      const parsed = JSON.parse(jsonInput);
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subjectId, gameId, difficulty, items: parsed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Replace failed");
      setResult({
        type: data.errors?.length ? "error" : "success",
        message: data.message ?? "Content replaced.",
        details: data.errors,
      });
      await loadItems();
    } catch (err) {
      setResult({
        type: "error",
        message: err instanceof Error ? err.message : "Replace failed",
      });
    } finally {
      setBusy(null);
    }
  }

  async function deleteItem(id: string) {
    if (!confirm("Delete this item?")) return;
    setBusy(id);
    try {
      const res = await fetch(`/api/admin/content/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Delete failed");
      }
      await loadItems();
    } catch (err) {
      setResult({
        type: "error",
        message: err instanceof Error ? err.message : "Delete failed",
      });
    } finally {
      setBusy(null);
    }
  }

  async function loadPreview() {
    setBusy("preview");
    try {
      const res = await fetch(
        `/api/content?subjectId=${subjectId}&gameId=${gameId}&difficulty=${difficulty}`
      );
      const data = await res.json();
      setPreview(JSON.stringify(data, null, 2));
    } catch {
      setPreview("Preview failed");
    } finally {
      setBusy(null);
    }
  }

  if (!subject || !game) {
    return (
      <main className="flex-1 px-4 py-8 max-w-4xl mx-auto">
        <p className="text-red-600">Unknown game.</p>
        <Link href="/admin/content" className="text-indigo-600 font-semibold">
          ← Back
        </Link>
      </main>
    );
  }

  return (
    <main className="flex-1 px-4 py-8 max-w-5xl mx-auto w-full">
      <AdminNav />

      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            {game.emoji} {game.title}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {subject.title} · {subjectId}/{gameId}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link
            href={game.href}
            className="px-4 py-2 rounded-xl border-2 border-green-200 text-green-700 font-semibold hover:bg-green-50"
          >
            Play game →
          </Link>
          <Link
            href="/admin/content"
            className="px-4 py-2 rounded-xl border-2 border-indigo-100 text-indigo-700 font-semibold hover:bg-indigo-50"
          >
            All games
          </Link>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {DIFFICULTIES.map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setDifficulty(d)}
            className={`px-4 py-2 rounded-xl font-semibold border-2 ${
              difficulty === d
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-gray-700 border-indigo-100 hover:border-indigo-300"
            }`}
          >
            Level {d}
          </button>
        ))}
      </div>

      <section className="bg-white/90 border-2 border-indigo-100 rounded-2xl p-5 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="text-lg font-bold text-gray-800">
            Items ({loading ? "…" : items.length})
          </h2>
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setJsonInput(JSON.stringify(exportPayload, null, 2))}
              className="px-3 py-2 rounded-lg border-2 border-indigo-100 text-sm font-semibold text-indigo-700 hover:bg-indigo-50"
            >
              Copy current → JSON
            </button>
            <button
              type="button"
              onClick={loadPreview}
              disabled={busy !== null}
              className="px-3 py-2 rounded-lg border-2 border-purple-100 text-sm font-semibold text-purple-700 hover:bg-purple-50 disabled:opacity-50"
            >
              Preview bundle
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading…</p>
        ) : items.length === 0 ? (
          <p className="text-amber-700 bg-amber-50 rounded-xl px-4 py-3 mb-4">
            No content for level {difficulty}. Paste JSON below and click Replace.
          </p>
        ) : (
          <ul className="space-y-2 mb-4 max-h-64 overflow-y-auto">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-start gap-3 p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 text-sm"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-indigo-800">
                    #{item.sortOrder} · {item.itemType}
                  </p>
                  <pre className="text-xs text-gray-600 mt-1 whitespace-pre-wrap break-all font-mono">
                    {JSON.stringify(item.data).slice(0, 200)}
                    {JSON.stringify(item.data).length > 200 ? "…" : ""}
                  </pre>
                </div>
                <button
                  type="button"
                  onClick={() => deleteItem(item.id)}
                  disabled={busy === item.id}
                  className="shrink-0 px-2 py-1 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 text-xs font-semibold disabled:opacity-50"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}

        {preview && (
          <div className="mb-4">
            <p className="text-sm font-semibold text-gray-700 mb-2">Game bundle preview (what players get):</p>
            <pre className="text-xs bg-gray-900 text-green-200 rounded-xl p-4 overflow-x-auto max-h-48">{preview}</pre>
          </div>
        )}
      </section>

      <section className="bg-white/90 border-2 border-purple-100 rounded-2xl p-5 mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-2">Upload / replace JSON</h2>
        <p className="text-sm text-gray-600 mb-3">
          Paste an array of items. Each needs <code className="bg-gray-100 px-1 rounded">itemType</code>,{" "}
          <code className="bg-gray-100 px-1 rounded">data</code>, optional{" "}
          <code className="bg-gray-100 px-1 rounded">sortOrder</code>.
          Replaces <strong>all</strong> content for this difficulty level.
        </p>
        <textarea
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          rows={18}
          dir="ltr"
          spellCheck={false}
          className="w-full font-mono text-sm border-2 border-purple-200 rounded-xl p-4 mb-4 focus:border-purple-400 focus:outline-none"
        />
        <button
          type="button"
          onClick={replaceContent}
          disabled={busy !== null}
          className="game-btn game-btn-primary disabled:opacity-50"
        >
          {busy === "replace" ? "Replacing…" : "Replace all content"}
        </button>
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
