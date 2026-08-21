"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  speakStoryText,
  speakText,
  stopSpeaking,
  warmSpeechVoices,
} from "@/components/mascot/speech";
import { miloSpeechText } from "@/lib/mascot/audioExport";
import { APP_CONTAINER } from "@/lib/layout";

const DEFAULT_TITLE = "פרויקט המדע";
const DEFAULT_TEXT =
  "מורת החינוך הגישה פרויקט על מחזור. ליאם ובת-עמי בחרו לבנות מגדל מבקבוקי פלסטיק ריקים. הם צבעו אותם בצבעים שונים ודבקו בזהירות. ביום ההצגה, התלמידים הסבירו למה חשוב למחזר. השופטים נתנו להם ציון גבוה על יצירתיות. ליאם הרגיש גאה בעבודה המשותפת.";

const MILO_SAMPLE = "בלש סיפורים! מי? מה? איפה?";

function ts() {
  return new Date().toLocaleTimeString();
}

export default function TtsDemoPage() {
  const [title, setTitle] = useState(DEFAULT_TITLE);
  const [text, setText] = useState(DEFAULT_TEXT);
  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  const speech = `${title}. ${text}`.replace(/"/g, "");
  const processed = useMemo(() => miloSpeechText(speech, "he"), [speech]);

  const addLog = useCallback((msg: string) => {
    setLog((prev) => [`${ts()} — ${msg}`, ...prev].slice(0, 30));
  }, []);

  useEffect(() => {
    warmSpeechVoices();
    return () => stopSpeaking();
  }, []);

  const wrap = async (label: string, run: () => Promise<void>) => {
    stopSpeaking();
    setBusy(true);
    addLog(`▶ ${label}`);
    try {
      await run();
      addLog(`✓ ${label} finished`);
    } catch (err) {
      addLog(`✗ ${label}: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setBusy(false);
    }
  };

  const testMilo = () =>
    wrap("Milo (speakText)", () =>
      speakText(MILO_SAMPLE, "he", {
        onStart: () => addLog("Milo audio started"),
        onEnd: () => addLog("Milo audio ended"),
      })
    );

  const testStory = () =>
    wrap("Story button (speakStoryText)", () =>
      speakStoryText(speech, "he", {
        onStart: () => addLog("Story audio started"),
        onEnd: () => addLog("Story audio ended"),
      })
    );

  const testApiRaw = () =>
    wrap("Raw /api/tts fetch + play", async () => {
      const snippet = (processed || speech).slice(0, 280);
      addLog(`API text length: ${snippet.length}`);
      const res = await fetch(
        `/api/tts?lang=he&text=${encodeURIComponent(snippet)}`,
        { credentials: "same-origin" }
      );
      addLog(`API HTTP ${res.status}, type: ${res.headers.get("content-type") ?? "?"}`);
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText.slice(0, 120));
      }
      const blob = await res.blob();
      addLog(`API blob size: ${blob.size} bytes`);
      if (blob.size < 64) throw new Error("Blob too small — not audio");

      await new Promise<void>((resolve, reject) => {
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.onended = () => {
          URL.revokeObjectURL(url);
          resolve();
        };
        audio.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error("Audio element error"));
        };
        void audio.play().catch(reject);
      });
    });

  const testBrowser = () =>
    wrap("Browser speechSynthesis only", () =>
      new Promise<void>((resolve, reject) => {
        if (!window.speechSynthesis) {
          reject(new Error("No speechSynthesis"));
          return;
        }
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(processed || speech);
        utterance.lang = "he-IL";
        utterance.onend = () => resolve();
        utterance.onerror = () => reject(new Error("speechSynthesis error"));
        window.speechSynthesis.speak(utterance);
      })
    );

  return (
    <main className={`flex-1 py-8 pb-24 ${APP_CONTAINER}`} dir="rtl">
      <div className="mb-6">
        <Link href="/hebrew/comprehension" className="text-indigo-600 hover:underline text-sm">
          ← חזרה לבלש הסיפורים
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">🔊 בדיקת TTS</h1>
        <p className="text-gray-600 mt-1">
          דף פשוט לבדיקה — רואים בדיוק איזה טקסט נשלח, ומה עובד (מילו / סיפור / API / דפדפן).
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
          <label className="block">
            <span className="text-sm font-semibold text-gray-700">כותרת (title)</span>
            <input
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-gray-700">טקסט (text)</span>
            <textarea
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 min-h-[180px]"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </label>
          <div className="text-sm text-gray-600 space-y-1">
            <p>
              <strong>speech</strong> (כמו בכפתור 🔊): {speech.length} תווים
            </p>
            <p>
              <strong>אחרי miloSpeechText</strong>: {(processed || "").length} תווים
            </p>
          </div>
          <pre className="text-xs bg-gray-50 border border-gray-200 rounded-xl p-3 overflow-x-auto whitespace-pre-wrap dir-rtl">
            {processed || speech}
          </pre>
        </section>

        <section className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-4 grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              disabled={busy}
              onClick={testMilo}
              className="game-btn game-btn-primary"
            >
              1. Milo (speakText)
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={testStory}
              className="game-btn game-btn-primary"
            >
              2. Story 🔊 (speakStoryText)
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={testApiRaw}
              className="game-btn game-btn-secondary"
            >
              3. Raw /api/tts
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={testBrowser}
              className="game-btn game-btn-secondary"
            >
              4. Browser only
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                stopSpeaking();
                addLog("Stopped");
              }}
              className="game-btn game-btn-secondary sm:col-span-2"
            >
              Stop
            </button>
          </div>

          <div className="bg-gray-900 text-green-300 rounded-2xl p-4 min-h-[240px] font-mono text-xs overflow-y-auto">
            {log.length === 0 ? (
              <p className="text-gray-500">לחץ על כפתור בדיקה…</p>
            ) : (
              log.map((line, i) => (
                <div key={i} className="mb-1 whitespace-pre-wrap">
                  {line}
                </div>
              ))
            )}
          </div>

          <p className="text-sm text-gray-500">
            Milo עובד? → Google TTS תקין. Story לא? → בעיה ב-speechStoryText. Raw API נכשל? →
            בעיית שרת/רשת. Browser בלבד רועש? → קול Ubuntu — לא Google.
          </p>
        </section>
      </div>
    </main>
  );
}
