/**
 * Split one long Milo recording into per-line MP3 clips.
 *
 * Usage:
 *   npx tsx scripts/split-milo-audio.ts --input /path/to/file.mp3 --variant he-female
 *
 * Variants: en | he-male | he-female
 */
import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";
import ffmpegStatic from "ffmpeg-static";
import { getMiloTextCatalog } from "../src/lib/mascot/catalog";
import { miloAudioFilename } from "../src/lib/mascot/audio";

const OUT_DIR = path.join(process.cwd(), "public/audio/milo");
const NOISE_DB = -35;
const MIN_SILENCE_DETECT = 0.15;

type Variant = "en" | "he-male" | "he-female";

function parseArgs() {
  const args = process.argv.slice(2);
  let input = "";
  let variant: Variant | "" = "";
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--input") input = args[++i] ?? "";
    if (args[i] === "--variant") variant = (args[++i] ?? "") as Variant;
  }
  if (!input || !variant) {
    console.error("Usage: npx tsx scripts/split-milo-audio.ts --input <file.mp3> --variant en|he-male|he-female");
    process.exit(1);
  }
  if (!fs.existsSync(input)) {
    console.error(`Input not found: ${input}`);
    process.exit(1);
  }
  return { input, variant };
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

function probeDuration(input: string): number {
  const result = spawnSync(ffmpegPath(), ["-i", input, "-f", "null", "-"], { encoding: "utf8" });
  const stderr = result.stderr || "";
  const match = stderr.match(/Duration: (\d+):(\d+):(\d+(?:\.\d+)?)/);
  if (!match) throw new Error("Could not read audio duration");
  return +match[1] * 3600 + +match[2] * 60 + +match[3];
}

function detectSilences(input: string): Silence[] {
  const result = spawnSync(
    ffmpegPath(),
    ["-i", input, "-af", `silencedetect=noise=${NOISE_DB}dB:d=${MIN_SILENCE_DETECT}`, "-f", "null", "-"],
    { encoding: "utf8" }
  );
  const stderr = result.stderr || "";
  const silences: Silence[] = [];
  let current: Partial<Silence> | null = null;
  for (const line of stderr.split("\n")) {
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

function segmentsFromSilences(duration: number, silences: Silence[], expectedCount: number) {
  if (expectedCount < 1) throw new Error("expectedCount must be >= 1");
  if (expectedCount === 1) return [{ start: 0, end: duration }];

  const build = (minDuration: number) => {
    const boundaries = silences.filter((s) => s.duration >= minDuration);
    const segments: Array<{ start: number; end: number }> = [];
    let cursor = 0;
    for (const silence of boundaries) {
      if (silence.start <= cursor + 0.05) continue;
      segments.push({ start: cursor, end: silence.start });
      cursor = silence.end;
    }
    if (duration - cursor > 0.05) segments.push({ start: cursor, end: duration });
    return segments;
  };

  for (let minDuration = 0.15; minDuration <= 1.2; minDuration += 0.001) {
    const segments = build(minDuration);
    if (segments.length === expectedCount) return segments;
  }

  const fallback = build(0.5);
  if (fallback.length === expectedCount + 1) {
    let shortestIdx = 0;
    for (let i = 1; i < fallback.length; i++) {
      const dur = fallback[i].end - fallback[i].start;
      const best = fallback[shortestIdx].end - fallback[shortestIdx].start;
      if (dur < best) shortestIdx = i;
    }
    const prev = fallback[shortestIdx - 1];
    const next = fallback[shortestIdx];
    if (prev) {
      prev.end = next.end;
      return fallback.filter((_, i) => i !== shortestIdx);
    }
  }

  throw new Error(
    `Expected ${expectedCount} segments, closest was ${fallback.length}. Re-record with clearer pauses between lines.`
  );
}

function catalogForVariant(variant: Variant) {
  const catalog = getMiloTextCatalog();
  if (variant === "en") return catalog.filter((e) => e.locale === "en");
  if (variant === "he-male") return catalog.filter((e) => e.locale === "he" && e.gender === "male");
  return catalog.filter((e) => e.locale === "he" && e.gender === "female");
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
  const { input, variant } = parseArgs();
  const entries = catalogForVariant(variant);
  const duration = probeDuration(input);
  const silences = detectSilences(input);
  const segments = segmentsFromSilences(duration, silences, entries.length);

  fs.mkdirSync(OUT_DIR, { recursive: true });

  console.log(`Input: ${input}`);
  console.log(`Variant: ${variant}`);
  console.log(`Duration: ${duration.toFixed(2)}s`);
  console.log(`Silences detected: ${silences.length}`);
  console.log(`Writing ${entries.length} clips to ${OUT_DIR}\n`);

  entries.forEach((entry, index) => {
    const segment = segments[index];
    const filename = miloAudioFilename(entry.id);
    const output = path.join(OUT_DIR, filename);
    cutSegment(input, segment.start, segment.end, output);
    const sizeKb = (fs.statSync(output).size / 1024).toFixed(1);
    console.log(`${index + 1}/${entries.length} ${filename} (${(segment.end - segment.start).toFixed(2)}s, ${sizeKb}KB)`);
  });

  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
