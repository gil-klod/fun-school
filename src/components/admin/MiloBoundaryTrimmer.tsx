"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { MiloTextEntry } from "@/lib/mascot/catalog";
import {
  MILO_BOUNDARIES_STORAGE_KEY,
  type MiloBoundaryClip,
  type MiloBoundaryFile,
} from "@/lib/mascot/boundaries";

type Variant = MiloBoundaryFile["variant"];

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = (seconds % 60).toFixed(2).padStart(5, "0");
  return `${m}:${s}`;
}

function parseTime(value: string): number {
  const trimmed = value.trim();
  if (!trimmed) return 0;
  if (trimmed.includes(":")) {
    const [m, s] = trimmed.split(":");
    return Math.max(0, (+m || 0) * 60 + (+s || 0));
  }
  return Math.max(0, +trimmed || 0);
}

function buildClips(entries: MiloTextEntry[], duration: number): MiloBoundaryClip[] {
  const step = duration / entries.length;
  return entries.map((entry, index) => ({
    id: entry.id,
    start: +(index * step).toFixed(3),
    end: +(index === entries.length - 1 ? duration : (index + 1) * step).toFixed(3),
  }));
}

export function MiloBoundaryTrimmer({
  variant,
  title,
  entries,
}: {
  variant: Variant;
  title: string;
  entries: MiloTextEntry[];
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [sourceName, setSourceName] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [clips, setClips] = useState<MiloBoundaryClip[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const storageKey = `${MILO_BOUNDARIES_STORAGE_KEY}:${variant}`;

  const boundaryFile = useMemo((): MiloBoundaryFile | null => {
    if (!clips.length || !duration) return null;
    return { variant, source: sourceName, duration, clips };
  }, [variant, sourceName, duration, clips]);

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const saved = JSON.parse(raw) as MiloBoundaryFile;
      if (saved.variant !== variant || saved.clips.length !== entries.length) return;
      setSourceName(saved.source);
      setDuration(saved.duration);
      setClips(saved.clips);
    } catch {
      /* ignore */
    }
  }, [storageKey, variant, entries.length]);

  const persist = useCallback(
    (next: MiloBoundaryClip[], nextDuration = duration, nextSource = sourceName) => {
      const file: MiloBoundaryFile = {
        variant,
        source: nextSource,
        duration: nextDuration,
        clips: next,
      };
      localStorage.setItem(storageKey, JSON.stringify(file));
    },
    [duration, sourceName, storageKey, variant]
  );

  function onFileChange(file: File | null) {
    if (!file) return;
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
    setSourceName(file.name);
    setClips([]);
    setDuration(0);
    setActiveId(null);
  }

  function onAudioLoaded() {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(audio.duration)) return;
    const d = audio.duration;
    setDuration(d);
    const initial = buildClips(entries, d);
    setClips(initial);
    persist(initial, d, sourceName);
  }

  function updateClip(id: string, field: "start" | "end", value: number) {
    setClips((prev) => {
      const next = prev.map((clip) =>
        clip.id === id ? { ...clip, [field]: +Math.max(0, value).toFixed(3) } : clip
      );
      persist(next);
      return next;
    });
  }

  function nudge(id: string, field: "start" | "end", delta: number) {
    const clip = clips.find((c) => c.id === id);
    if (!clip) return;
    updateClip(id, field, clip[field] + delta);
  }

  function playClip(id: string) {
    const clip = clips.find((c) => c.id === id);
    const audio = audioRef.current;
    if (!clip || !audio) return;
    setActiveId(id);
    audio.currentTime = clip.start;
    void audio.play();
  }

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !activeId) return;
    const clip = clips.find((c) => c.id === activeId);
    if (!clip) return;

    function onTimeUpdate() {
      if (audio && audio.currentTime >= clip!.end) {
        audio.pause();
        setActiveId(null);
      }
    }

    audio.addEventListener("timeupdate", onTimeUpdate);
    return () => audio.removeEventListener("timeupdate", onTimeUpdate);
  }, [activeId, clips]);

  async function copyJson() {
    if (!boundaryFile) return;
    await navigator.clipboard.writeText(JSON.stringify(boundaryFile, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function downloadJson() {
    if (!boundaryFile) return;
    const blob = new Blob([JSON.stringify(boundaryFile, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `milo-boundaries-${variant}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="mb-6 border-2 border-rose-200 rounded-xl bg-rose-50/40 p-4">
      <h2 className="text-lg font-bold text-gray-800 mb-1">Manual split: {title}</h2>
      <p className="text-sm text-gray-600 mb-3">
        Upload the long DaVinci MP3, adjust start/end for each line, preview, then download the
        boundaries JSON. Run:{" "}
        <code className="text-xs bg-white px-1 rounded">
          npm run split-milo-audio -- --input your.mp3 --variant {variant} --boundaries
          milo-boundaries-{variant}.json
        </code>
      </p>

      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <label className="px-3 py-2 rounded-xl bg-white border-2 border-rose-200 text-sm font-semibold cursor-pointer hover:bg-rose-50">
          Upload master MP3
          <input
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
          />
        </label>
        {sourceName && (
          <span className="text-sm text-gray-600">
            {sourceName}
            {duration > 0 && ` · ${formatTime(duration)}`}
          </span>
        )}
        <button
          type="button"
          disabled={!boundaryFile}
          onClick={copyJson}
          className="px-3 py-2 rounded-xl bg-rose-600 text-white text-sm font-semibold disabled:opacity-40"
        >
          {copied ? "Copied!" : "Copy JSON"}
        </button>
        <button
          type="button"
          disabled={!boundaryFile}
          onClick={downloadJson}
          className="px-3 py-2 rounded-xl bg-white border-2 border-rose-200 text-sm font-semibold disabled:opacity-40"
        >
          Download JSON
        </button>
      </div>

      {audioUrl && (
        <audio ref={audioRef} src={audioUrl} controls className="w-full mb-4" onLoadedMetadata={onAudioLoaded} />
      )}

      {clips.length > 0 && (
        <div className="max-h-96 overflow-auto border border-rose-200 rounded-xl bg-white">
          <table className="w-full text-sm">
            <thead className="bg-rose-100 sticky top-0">
              <tr>
                <th className="p-2 text-left w-10">#</th>
                <th className="p-2 text-left">Line</th>
                <th className="p-2 text-left w-28">Start</th>
                <th className="p-2 text-left w-28">End</th>
                <th className="p-2 w-20">Play</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, index) => {
                const clip = clips[index];
                if (!clip) return null;
                const len = clip.end - clip.start;
                return (
                  <tr key={entry.id} className="border-t border-rose-50">
                    <td className="p-2 text-gray-500">{index + 1}</td>
                    <td className="p-2" dir="rtl">
                      {entry.text.slice(0, 60)}
                      {entry.text.length > 60 ? "…" : ""}
                    </td>
                    <td className="p-2">
                      <div className="flex items-center gap-1">
                        <button type="button" className="text-xs px-1" onClick={() => nudge(entry.id, "start", -0.1)}>
                          −
                        </button>
                        <input
                          className="w-16 border rounded px-1 text-xs"
                          value={formatTime(clip.start)}
                          onChange={(e) => updateClip(entry.id, "start", parseTime(e.target.value))}
                        />
                        <button type="button" className="text-xs px-1" onClick={() => nudge(entry.id, "start", 0.1)}>
                          +
                        </button>
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="flex items-center gap-1">
                        <button type="button" className="text-xs px-1" onClick={() => nudge(entry.id, "end", -0.1)}>
                          −
                        </button>
                        <input
                          className="w-16 border rounded px-1 text-xs"
                          value={formatTime(clip.end)}
                          onChange={(e) => updateClip(entry.id, "end", parseTime(e.target.value))}
                        />
                        <button type="button" className="text-xs px-1" onClick={() => nudge(entry.id, "end", 0.1)}>
                          +
                        </button>
                      </div>
                      <span className="text-xs text-gray-400">{len.toFixed(2)}s</span>
                    </td>
                    <td className="p-2">
                      <button
                        type="button"
                        onClick={() => playClip(entry.id)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold ${
                          activeId === entry.id ? "bg-rose-600 text-white" : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        ▶
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
