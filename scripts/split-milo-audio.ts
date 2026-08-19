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

/** True [long pause] — ignore brief gaps when a longer pause follows soon after. */
function isLineBreak(silence: Silence, silences: Silence[]): boolean {
  if (silence.duration >= 1.0) return true;
  if (silence.duration < 0.45) return false;
  const ahead = silences.filter((s) => s.start >= silence.end && s.start <= silence.end + 4);
  if (ahead.some((s) => s.duration > silence.duration + 0.35)) return false;
  return true;
}

function segmentsFromBoundaries(
  duration: number,
  boundaries: Silence[]
): Array<{ start: number; end: number }> {
  const segments: Array<{ start: number; end: number }> = [];
  let cursor = 0;
  for (const silence of boundaries) {
    if (silence.start <= cursor + 0.05) continue;
    segments.push({ start: cursor, end: silence.start });
    cursor = silence.end;
  }
  if (duration - cursor > 0.05) segments.push({ start: cursor, end: duration });
  return segments;
}

function splitLongestSegment(
  segments: Array<{ start: number; end: number }>,
  silences: Silence[],
  minPart: number,
  minSilence: number,
  protectStartBefore = 0
): boolean {
  let longestIdx = -1;
  let longestDur = 0;
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    if (seg.start < protectStartBefore) continue;
    const dur = seg.end - seg.start;
    if (dur > longestDur) {
      longestDur = dur;
      longestIdx = i;
    }
  }
  if (longestIdx < 0 || longestDur < minPart * 2) return false;

  const seg = segments[longestIdx];
  const internal = silences.filter(
    (s) =>
      s.duration >= minSilence &&
      s.start > seg.start + 0.08 &&
      s.end < seg.end - 0.08 &&
      s.start - seg.start >= minPart &&
      seg.end - s.end >= minPart
  );
  if (internal.length === 0) return false;

  internal.sort((a, b) => b.duration - a.duration);
  const cut = internal[0];
  segments.splice(
    longestIdx,
    1,
    { start: seg.start, end: cut.start },
    { start: cut.end, end: seg.end }
  );
  return true;
}

function mergeTinyLeadingSegment(segments: Array<{ start: number; end: number }>) {
  while (segments.length > 1 && segments[0].end - segments[0].start < 1.0) {
    segments[1].start = segments[0].start;
    segments.shift();
  }
}

function segmentsFromSilences(duration: number, silences: Silence[], expectedCount: number) {
  if (expectedCount < 1) throw new Error("expectedCount must be >= 1");
  if (expectedCount === 1) return [{ start: 0, end: duration }];

  const lineBreaks = silences.filter((s) => isLineBreak(s, silences));
  const segments = segmentsFromBoundaries(duration, lineBreaks);
  mergeTinyLeadingSegment(segments);
  const protectWelcomeBefore = segments[0]?.end ?? 0;

  const splitPasses: Array<[number, number, number]> = [
    [0.55, 0.45, protectWelcomeBefore],
    [0.5, 0.42, protectWelcomeBefore],
    [0.45, 0.4, protectWelcomeBefore],
  ];

  for (const [minPart, minSilence, protectStartBefore] of splitPasses) {
    while (segments.length < expectedCount) {
      if (!splitLongestSegment(segments, silences, minPart, minSilence, protectStartBefore)) break;
    }
    if (segments.length === expectedCount) break;
  }

  if (segments.length < expectedCount) {
    while (segments.length < expectedCount) {
      if (!splitLongestSegment(segments, silences, 0.45, 0.4, protectWelcomeBefore)) break;
    }
  }

  if (segments.length !== expectedCount) {
    throw new Error(
      `Expected ${expectedCount} segments, built ${segments.length}. Some [long pause] markers may be missing — re-export from admin and re-record.`
    );
  }

  return segments;
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
  console.log(`Line-break silences: ${silences.filter((s) => isLineBreak(s, silences)).length}`);
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
