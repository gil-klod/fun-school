"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminNav } from "@/components/admin/AdminNav";
import { MiloBoundaryTrimmer } from "@/components/admin/MiloBoundaryTrimmer";
import { getMiloTextCatalog } from "@/lib/mascot/catalog";
import {
  formatMiloRecordingExport,
  miloRecordingExportHint,
  miloRecordingExportInstructions,
  MILO_RECORDING_PAUSE_MODES,
  type MiloRecordingPauseMode,
} from "@/lib/mascot/recordingExport";
import {
  getMiloReviewRows,
  MILO_REVIEW_STORAGE_KEY,
  type MiloReviewStatus,
} from "@/lib/mascot/reviewRows";
import { speakText, stopSpeaking } from "@/components/mascot/speech";

type ReviewMap = Record<string, MiloReviewStatus>;
type ReviewFilter = "all" | "unchecked" | "bad";

function loadReviews(): ReviewMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(MILO_REVIEW_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ReviewMap) : {};
  } catch {
    return {};
  }
}

function AudioCell({
  audioId,
  text,
  locale,
  dir,
  playingId,
  status,
  onPlay,
  onMark,
}: {
  audioId: string;
  text: string;
  locale: "en" | "he";
  dir: "ltr" | "rtl";
  playingId: string | null;
  status?: MiloReviewStatus;
  onPlay: (audioId: string, text: string, locale: "en" | "he") => void;
  onMark: (audioId: string, status: MiloReviewStatus | null) => void;
}) {
  const playing = playingId === audioId;
  const bg =
    status === "good"
      ? "bg-emerald-50"
      : status === "bad"
        ? "bg-red-50"
        : "bg-white";

  return (
    <div className={`${bg} p-3 min-w-[220px]`}>
      <p className="text-sm text-gray-800 leading-snug mb-2" dir={dir}>
        {text}
      </p>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPlay(audioId, text, locale)}
          className={`w-8 h-8 rounded-lg text-xs font-bold shrink-0 ${
            playing
              ? "bg-indigo-600 text-white"
              : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
          }`}
          aria-label="Play"
        >
          ▶
        </button>
        <button
          type="button"
          onClick={() => onMark(audioId, status === "good" ? null : "good")}
          className={`px-2.5 h-8 rounded-lg text-sm font-bold ${
            status === "good"
              ? "bg-emerald-600 text-white"
              : "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
          }`}
          title="Sounds good"
        >
          ✓
        </button>
        <button
          type="button"
          onClick={() => onMark(audioId, status === "bad" ? null : "bad")}
          className={`px-2.5 h-8 rounded-lg text-sm font-bold ${
            status === "bad"
              ? "bg-red-600 text-white"
              : "bg-red-100 text-red-800 hover:bg-red-200"
          }`}
          title="Needs fix"
        >
          ✗
        </button>
      </div>
    </div>
  );
}

export default function AdminMiloPage() {
  const rows = useMemo(() => getMiloReviewRows(), []);
  const catalog = useMemo(() => getMiloTextCatalog(), []);

  const englishEntries = useMemo(() => catalog.filter((e) => e.locale === "en"), [catalog]);
  const hebrewMaleEntries = useMemo(
    () => catalog.filter((e) => e.locale === "he" && e.gender === "male"),
    [catalog]
  );
  const hebrewFemaleEntries = useMemo(
    () => catalog.filter((e) => e.locale === "he" && e.gender === "female"),
    [catalog]
  );

  const [reviews, setReviews] = useState<ReviewMap>({});
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>("all");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [trimOpen, setTrimOpen] = useState(false);
  const [pauseMode, setPauseMode] = useState<MiloRecordingPauseMode>("eleven-v3");

  const englishExport = useMemo(
    () => formatMiloRecordingExport(englishEntries, pauseMode),
    [englishEntries, pauseMode]
  );
  const hebrewMaleExport = useMemo(
    () => formatMiloRecordingExport(hebrewMaleEntries, pauseMode),
    [hebrewMaleEntries, pauseMode]
  );
  const hebrewFemaleExport = useMemo(
    () => formatMiloRecordingExport(hebrewFemaleEntries, pauseMode),
    [hebrewFemaleEntries, pauseMode]
  );

  useEffect(() => {
    setReviews(loadReviews());
  }, []);

  const persistReviews = useCallback((next: ReviewMap) => {
    setReviews(next);
    localStorage.setItem(MILO_REVIEW_STORAGE_KEY, JSON.stringify(next));
  }, []);

  const mark = useCallback(
    (audioId: string, status: MiloReviewStatus | null) => {
      const next = { ...reviews };
      if (status) next[audioId] = status;
      else delete next[audioId];
      persistReviews(next);
    },
    [reviews, persistReviews]
  );

  async function play(audioId: string, text: string, locale: "en" | "he") {
    stopSpeaking();
    setPlayingId(audioId);
    await speakText(text, locale, {
      audioId,
      onEnd: () => setPlayingId(null),
    });
  }

  async function copyExport(key: string, text: string) {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  }

  const stats = useMemo(() => {
    const audioIds = rows.flatMap((row) => [
      row.english.id,
      row.hebrewMale.id,
      row.hebrewFemale.id,
    ]);
    let good = 0;
    let bad = 0;
    for (const id of audioIds) {
      if (reviews[id] === "good") good++;
      if (reviews[id] === "bad") bad++;
    }
    return { good, bad, unchecked: audioIds.length - good - bad, total: audioIds.length };
  }, [rows, reviews]);

  const filteredRows = useMemo(() => {
    if (reviewFilter === "all") return rows;
    return rows.filter((row) => {
      const ids = [row.english.id, row.hebrewMale.id, row.hebrewFemale.id];
      if (reviewFilter === "bad") {
        return ids.some((id) => reviews[id] === "bad");
      }
      return ids.some((id) => !reviews[id]);
    });
  }, [rows, reviews, reviewFilter]);

  return (
    <main className="flex-1 w-full px-3 sm:px-6 py-6">
      <AdminNav />
      <div className="flex flex-wrap items-end justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Milo QA</h1>
          <p className="text-sm text-gray-500 mt-1">
            Play each clip · mark ✓ good or ✗ bad · progress saves in this browser
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
          className="px-3 py-2 rounded-xl border-2 border-indigo-100 text-sm font-semibold"
        >
          <option value="all">All rows ({rows.length})</option>
          <option value="unchecked">Unchecked only</option>
          <option value="bad">Marked bad only</option>
        </select>
        <button
          type="button"
          onClick={() => setTrimOpen((v) => !v)}
          className="px-3 py-2 rounded-xl border-2 border-rose-200 text-sm font-semibold hover:bg-rose-50 text-rose-900"
        >
          {trimOpen ? "Hide" : "Show"} manual split tool
        </button>
        <button
          type="button"
          onClick={() => setExportOpen((v) => !v)}
          className="px-3 py-2 rounded-xl border-2 border-indigo-100 text-sm font-semibold hover:bg-indigo-50"
        >
          {exportOpen ? "Hide" : "Show"} recording export
        </button>
      </div>

      {trimOpen && (
        <MiloBoundaryTrimmer
          variant="he-female"
          title="Hebrew (female)"
          entries={hebrewFemaleEntries}
        />
      )}

      {exportOpen && (
        <section className="mb-6">
          <div className="mb-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-950">
            <strong>DaVinci ignores line breaks.</strong> Use the pause tags below — do not delete{" "}
            <code className="bg-amber-100 px-1 rounded">[long pause]</code> or{" "}
            <code className="bg-amber-100 px-1 rounded">&lt;break /&gt;</code> between lines.
          </div>
          <div className="flex flex-wrap gap-3 mb-4">
            <select
              value={pauseMode}
              onChange={(e) => setPauseMode(e.target.value as MiloRecordingPauseMode)}
              className="px-3 py-2 rounded-xl border-2 border-indigo-100 text-sm font-semibold"
            >
              {Object.entries(MILO_RECORDING_PAUSE_MODES).map(([key, { label }]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 self-center">
              {miloRecordingExportInstructions(pauseMode)}
            </p>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
          {[
            {
              key: "en",
              title: "English",
              entries: englishEntries,
              value: englishExport,
              dir: "ltr" as const,
              button: "bg-sky-600 hover:bg-sky-700",
            },
            {
              key: "he-male",
              title: "Hebrew (male)",
              entries: hebrewMaleEntries,
              value: hebrewMaleExport,
              dir: "rtl" as const,
              button: "bg-emerald-600 hover:bg-emerald-700",
            },
            {
              key: "he-female",
              title: "Hebrew (female)",
              entries: hebrewFemaleEntries,
              value: hebrewFemaleExport,
              dir: "rtl" as const,
              button: "bg-rose-600 hover:bg-rose-700",
            },
          ].map((box) => (
            <div key={box.key} className="border-2 border-indigo-100 rounded-xl bg-white p-3">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div>
                  <h3 className="font-bold text-sm">{box.title}</h3>
                  <p className="text-xs text-gray-500">
                    {miloRecordingExportHint(box.entries.length, pauseMode)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => copyExport(box.key, box.value)}
                  className={`px-3 py-1.5 rounded-lg text-white text-xs font-semibold ${box.button}`}
                >
                  {copiedKey === box.key ? "Copied!" : "Copy"}
                </button>
              </div>
              <textarea
                readOnly
                value={box.value}
                rows={6}
                dir={box.dir}
                className="w-full text-xs font-mono border border-indigo-100 rounded-lg p-2 resize-y"
                onClick={(e) => e.currentTarget.select()}
              />
            </div>
          ))}
          </div>
        </section>
      )}

      <div className="border-2 border-indigo-200 rounded-xl overflow-auto bg-white shadow-sm">
        <table className="w-full min-w-[960px] border-collapse text-left">
          <thead className="bg-indigo-600 text-white sticky top-0 z-10">
            <tr>
              <th className="p-3 w-12 text-center font-bold">#</th>
              <th className="p-3 w-48 font-bold">Label</th>
              <th className="p-3 font-bold border-l border-indigo-500">English</th>
              <th className="p-3 font-bold border-l border-indigo-500">Hebrew (male)</th>
              <th className="p-3 font-bold border-l border-indigo-500">Hebrew (female)</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => {
              const number = rows.findIndex((r) => r.rowKey === row.rowKey) + 1;
              const rowIndex = number - 1;
              const rowStatuses = [
                reviews[row.english.id],
                reviews[row.hebrewMale.id],
                reviews[row.hebrewFemale.id],
              ];
              const rowHasBad = rowStatuses.includes("bad");
              const rowAllGood = rowStatuses.every((s) => s === "good");

              return (
                <tr
                  key={row.rowKey}
                  className={`border-t border-indigo-100 ${
                    rowAllGood
                      ? "bg-emerald-50/60"
                      : rowHasBad
                        ? "bg-red-50/40"
                        : rowIndex % 2 === 0
                          ? "bg-white"
                          : "bg-indigo-50/30"
                  }`}
                >
                  <td className="p-3 text-center font-bold text-gray-500 align-top">{number}</td>
                  <td className="p-3 text-xs text-gray-500 align-top">
                    <span className="font-semibold text-gray-700 block">{row.label}</span>
                    <span className="capitalize">{row.category}</span>
                  </td>
                  <td className="p-0 border-l border-indigo-100 align-top">
                    <AudioCell
                      audioId={row.english.id}
                      text={row.english.text}
                      locale="en"
                      dir="ltr"
                      playingId={playingId}
                      status={reviews[row.english.id]}
                      onPlay={play}
                      onMark={mark}
                    />
                  </td>
                  <td className="p-0 border-l border-indigo-100 align-top">
                    <AudioCell
                      audioId={row.hebrewMale.id}
                      text={row.hebrewMale.text}
                      locale="he"
                      dir="rtl"
                      playingId={playingId}
                      status={reviews[row.hebrewMale.id]}
                      onPlay={play}
                      onMark={mark}
                    />
                  </td>
                  <td className="p-0 border-l border-indigo-100 align-top">
                    <AudioCell
                      audioId={row.hebrewFemale.id}
                      text={row.hebrewFemale.text}
                      locale="he"
                      dir="rtl"
                      playingId={playingId}
                      status={reviews[row.hebrewFemale.id]}
                      onPlay={play}
                      onMark={mark}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}
