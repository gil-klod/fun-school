/**
 * Split one MiniMax Milo recording into per-line MP3 clips.
 *
 * Expects <#1.50#> pause tags between lines (see recording export on /admin/milo).
 *
 * Usage:
 *   npx tsx scripts/split-milo-audio.ts --input /path/to/file.mp3 --variant he-female
 */
import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";
import ffmpegStatic from "ffmpeg-static";
import { getMiloTextCatalog, type MiloTextEntry } from "../src/lib/mascot/catalog";
import { miloAudioFilename } from "../src/lib/mascot/audio";
import { MINIMAX_LINE_PAUSE_SECONDS } from "../src/lib/mascot/recordingExport";
import type { MiloBoundaryFile } from "../src/lib/mascot/boundaries";

const OUT_DIR = path.join(process.cwd(), "public/audio/milo");
const NOISE_DB = -35;
const MIN_SILENCE_DETECT = 0.15;
/** MiniMax 1.5s tag — allow slightly shorter detected silence. */
const MIN_LINE_PAUSE = MINIMAX_LINE_PAUSE_SECONDS * 0.85;

type Variant = "en" | "he-male" | "he-female";

function parseArgs() {
  const args = process.argv.slice(2);
  let input = "";
  let variant: Variant | "" = "";
  let boundaries = "";
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--input") input = args[++i] ?? "";
    if (args[i] === "--variant") variant = (args[++i] ?? "") as Variant;
    if (args[i] === "--boundaries") boundaries = args[++i] ?? "";
  }
  if (!input || !variant) {
    console.error(
      "Usage: npx tsx scripts/split-milo-audio.ts --input <file.mp3> --variant en|he-male|he-female [--boundaries boundaries.json]"
    );
    process.exit(1);
  }
  if (!fs.existsSync(input)) {
    console.error(`Input not found: ${input}`);
    process.exit(1);
  }
  if (boundaries && !fs.existsSync(boundaries)) {
    console.error(`Boundaries not found: ${boundaries}`);
    process.exit(1);
  }
  return { input, variant, boundaries };
}

function ffmpegPath(): string {
  if (!ffmpegStatic) throw new Error("ffmpeg-static binary missing");
  return ffmpegStatic;
}

function runFfmpeg(args: string[]) {
  const result = spawnSync(ffmpegPath(), args, { encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || "ffmpeg failed");
  }
}

interface Silence {
  start: number;
  end: number;
  duration: number;
}

type Segment = { start: number; end: number };

function probeDuration(input: string): number {
  const result = spawnSync(ffmpegPath(), ["-i", input, "-f", "null", "-"], { encoding: "utf8" });
  const match = (result.stderr || "").match(/Duration: (\d+):(\d+):(\d+(?:\.\d+)?)/);
  if (!match) throw new Error("Could not read audio duration");
  return +match[1] * 3600 + +match[2] * 60 + +match[3];
}

function detectSilences(input: string): Silence[] {
  const result = spawnSync(
    ffmpegPath(),
    ["-i", input, "-af", `silencedetect=noise=${NOISE_DB}dB:d=${MIN_SILENCE_DETECT}`, "-f", "null", "-"],
    { encoding: "utf8" }
  );
  const silences: Silence[] = [];
  let current: Partial<Silence> | null = null;
  for (const line of (result.stderr || "").split("\n")) {
    const start = line.match(/silence_start: ([0-9.]+)/);
    const end = line.match(/silence_end: ([0-9.]+) \| silence_duration: ([0-9.]+)/);
    if (start) current = { start: +start[1] };
    if (end && current?.start != null) {
      silences.push({ start: current.start, end: +end[1], duration: +end[2] });
      current = null;
    }
  }
  return silences;
}

function segmentsFromPauses(duration: number, pauses: Silence[]): Segment[] {
  const segments: Segment[] = [];
  let cursor = 0;
  for (const pause of pauses) {
    if (pause.start <= cursor + 0.05) continue;
    segments.push({ start: cursor, end: pause.start });
    cursor = pause.end;
  }
  if (duration - cursor > 0.05) segments.push({ start: cursor, end: duration });
  return segments;
}

function segmentsFromMinimax(input: string, duration: number, expectedCount: number): Segment[] {
  const silences = detectSilences(input);
  const linePauses = silences.filter((s) => s.duration >= MIN_LINE_PAUSE);
  const segments = segmentsFromPauses(duration, linePauses);

  if (segments.length === expectedCount) {
    return segments;
  }

  const pauseList = linePauses
    .map((s) => `${s.duration.toFixed(2)}s @ ${s.start.toFixed(1)}s`)
    .slice(0, 8)
    .join(", ");

  throw new Error(
    `Expected ${expectedCount} clips from MiniMax pauses (>=${MIN_LINE_PAUSE.toFixed(2)}s), got ${segments.length}.\n` +
      `Re-export from /admin/milo with MiniMax mode — keep every ${`<#${MINIMAX_LINE_PAUSE_SECONDS.toFixed(2)}#>`} tag between lines.\n` +
      `Detected long pauses (${linePauses.length}): ${pauseList}${linePauses.length > 8 ? "…" : ""}`
  );
}

function loadBoundarySegments(boundariesPath: string, entries: MiloTextEntry[]): Segment[] {
  const raw = JSON.parse(fs.readFileSync(boundariesPath, "utf8")) as MiloBoundaryFile;
  if (raw.clips.length !== entries.length) {
    throw new Error(`Boundaries have ${raw.clips.length} clips, expected ${entries.length}.`);
  }
  for (let i = 0; i < entries.length; i++) {
    if (raw.clips[i].id !== entries[i].id) {
      throw new Error(`Boundary clip ${i + 1} id mismatch: ${raw.clips[i].id} vs ${entries[i].id}`);
    }
  }
  return raw.clips.map((clip) => ({ start: clip.start, end: clip.end }));
}

function catalogForVariant(variant: Variant) {
  const catalog = getMiloTextCatalog();
  if (variant === "en") return catalog.filter((entry) => entry.locale === "en");
  if (variant === "he-male") return catalog.filter((entry) => entry.locale === "he" && entry.gender === "male");
  return catalog.filter((entry) => entry.locale === "he" && entry.gender === "female");
}

function cutSegment(input: string, start: number, end: number, output: string) {
  runFfmpeg([
    "-y",
    "-i",
    input,
    "-ss",
    start.toFixed(3),
    "-to",
    end.toFixed(3),
    "-acodec",
    "libmp3lame",
    "-q:a",
    "4",
    output,
  ]);
}

async function main() {
  const { input, variant, boundaries } = parseArgs();
  const entries = catalogForVariant(variant);
  const duration = probeDuration(input);
  const segments = boundaries
    ? loadBoundarySegments(boundaries, entries)
    : segmentsFromMinimax(input, duration, entries.length);

  fs.mkdirSync(OUT_DIR, { recursive: true });

  console.log(`Input: ${input}`);
  console.log(`Variant: ${variant}`);
  console.log(`Duration: ${duration.toFixed(2)}s`);
  if (boundaries) {
    console.log(`Using manual boundaries: ${boundaries}`);
  } else {
    const longPauses = detectSilences(input).filter((s) => s.duration >= MIN_LINE_PAUSE).length;
    console.log(`MiniMax line pauses (>=${MIN_LINE_PAUSE.toFixed(2)}s): ${longPauses}`);
  }
  console.log(`Writing ${entries.length} clips to ${OUT_DIR}\n`);

  entries.forEach((entry, index) => {
    const segment = segments[index];
    const filename = miloAudioFilename(entry.id);
    const output = path.join(OUT_DIR, filename);
    cutSegment(input, segment.start, segment.end, output);
    const sizeKb = (fs.statSync(output).size / 1024).toFixed(1);
    console.log(
      `${index + 1}/${entries.length} ${filename} (${(segment.end - segment.start).toFixed(2)}s, ${sizeKb}KB) — ${entry.text.slice(0, 40)}…`
    );
  });

  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
