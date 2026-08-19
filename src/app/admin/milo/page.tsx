"use client";

import { useMemo, useState } from "react";
import { AdminNav } from "@/components/admin/AdminNav";
import { getMiloTextCatalog, type MiloTextEntry } from "@/lib/mascot/catalog";
import { speakText, stopSpeaking } from "@/components/mascot/speech";
import type { Locale } from "@/i18n/types";

export default function AdminMiloPage() {
  const catalog = useMemo(() => getMiloTextCatalog(), []);
  const [localeFilter, setLocaleFilter] = useState<Locale | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [playingId, setPlayingId] = useState<string | null>(null);

  const filtered = catalog.filter((entry) => {
    if (localeFilter !== "all" && entry.locale !== localeFilter) return false;
    if (categoryFilter !== "all" && entry.category !== categoryFilter) return false;
    return true;
  });

  const grouped = filtered.reduce<Record<string, MiloTextEntry[]>>((acc, entry) => {
    const key = entry.context ? `context: ${entry.context}` : entry.category;
    (acc[key] ??= []).push(entry);
    return acc;
  }, {});

  const lineExport = useMemo(
    () => filtered.map((entry) => entry.text).join("\n"),
    [filtered]
  );
  const [copied, setCopied] = useState(false);

  async function copyLines() {
    await navigator.clipboard.writeText(lineExport);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function play(entry: MiloTextEntry) {
    stopSpeaking();
    setPlayingId(entry.id);
    await speakText(entry.text, entry.locale, {
      audioId: entry.id,
      onEnd: () => setPlayingId(null),
    });
  }

  return (
    <main className="flex-1 px-4 py-8 max-w-5xl mx-auto w-full">
      <AdminNav />
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Milo texts</h1>
      <p className="text-gray-500 text-sm mb-6">
        All lines Milo can speak — tap ▶ to hear each sentence.
      </p>

      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={localeFilter}
          onChange={(e) => setLocaleFilter(e.target.value as Locale | "all")}
          className="px-3 py-2 rounded-xl border-2 border-indigo-100 text-sm font-semibold"
        >
          <option value="all">All languages</option>
          <option value="he">Hebrew</option>
          <option value="en">English</option>
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border-2 border-indigo-100 text-sm font-semibold"
        >
          <option value="all">All categories</option>
          <option value="welcome">Welcome</option>
          <option value="correct">Correct</option>
          <option value="wrong">Wrong</option>
          <option value="context">Context tips</option>
        </select>
        <span className="text-sm text-gray-500 self-center">{filtered.length} lines</span>
      </div>

      <section className="bg-white/90 border-2 border-indigo-100 rounded-2xl p-5 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <h2 className="font-bold text-gray-800">Export text (one line per row)</h2>
          <button
            type="button"
            onClick={copyLines}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700"
          >
            {copied ? "Copied!" : "Copy to clipboard"}
          </button>
        </div>
        <textarea
          readOnly
          value={lineExport}
          rows={12}
          dir="auto"
          className="w-full font-mono text-sm border-2 border-indigo-100 rounded-xl p-4 focus:outline-none resize-y"
          onClick={(e) => e.currentTarget.select()}
        />
        <p className="text-xs text-gray-500 mt-2">
          Uses current filters. Click the box to select all.
        </p>
      </section>

      <div className="space-y-6">
        {Object.entries(grouped).map(([group, entries]) => (
          <section key={group} className="bg-white/90 border-2 border-indigo-100 rounded-2xl p-5">
            <h2 className="font-bold text-indigo-800 mb-3 capitalize">{group}</h2>
            <ul className="space-y-2">
              {entries.map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-start gap-3 p-3 rounded-xl bg-indigo-50/40 border border-indigo-100"
                >
                  <button
                    type="button"
                    onClick={() => play(entry)}
                    className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                      playingId === entry.id
                        ? "bg-indigo-600 text-white"
                        : "bg-white text-indigo-600 border-2 border-indigo-200 hover:bg-indigo-100"
                    }`}
                    aria-label="Play"
                  >
                    ▶
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-400 mb-1">
                      {entry.locale.toUpperCase()}
                      {entry.gender ? ` · ${entry.gender}` : ""}
                      {" · "}
                      {entry.label}
                    </p>
                    <p
                      className={`text-gray-800 leading-relaxed ${
                        entry.locale === "he" ? "" : ""
                      }`}
                      dir={entry.locale === "he" ? "rtl" : "ltr"}
                    >
                      {entry.text}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
