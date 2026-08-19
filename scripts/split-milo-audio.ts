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
import { getMiloTextCatalog, type MiloTextEntry } from "../src/lib/mascot/catalog";
import { miloAudioFilename } from "../src/lib/mascot/audio";

const OUT_DIR = path.join(process.cwd(), "public/audio/milo");
const NOISE_DB = -35;
const MIN_SILENCE_DETECT = 0.15;
const TINY_SEGMENT = 1.0;
const MIN_INTERNAL_SILENCE = 0.4;
const STRONG_INTERNAL_SILENCE = 0.85;

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

type Segment = { start: number; end: number };

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

function segmentsFromBoundaries(duration: number, boundaries: Silence[]): Segment[] {
  const segments: Segment[] = [];
  let cursor = 0;
  for (const silence of boundaries) {
    if (silence.start <= cursor + 0.05) continue;
    segments.push({ start: cursor, end: silence.start });
    cursor = silence.end;
  }
  if (duration - cursor > 0.05) segments.push({ start: cursor, end: duration });
  return segments;
}

function mergeTinyLeadingSegment(segments: Segment[]) {
  while (segments.length > 1 && segments[0].end - segments[0].start < TINY_SEGMENT) {
    segments[1].start = segments[0].start;
    segments.shift();
  }
}

interface CatalogGroup {
  size: number;
  texts: string[];
}

function catalogGroups(entries: MiloTextEntry[]): CatalogGroup[] {
  const groups: CatalogGroup[] = [];
  let index = 0;
  while (index < entries.length) {
    const entry = entries[index];
    if (entry.category === "context") {
      const context = entry.context!;
      const texts: string[] = [];
      while (index < entries.length && entries[index].context === context) {
        texts.push(entries[index].text);
        index++;
      }
      groups.push({ size: texts.length, texts });
    } else {
      groups.push({ size: 1, texts: [entry.text] });
      index++;
    }
  }
  return groups;
}

function mergeSegments(segments: Segment[]): Segment {
  return { start: segments[0].start, end: segments[segments.length - 1].end };
}

function internalSilences(segment: Segment, silences: Silence[], minDuration = MIN_INTERNAL_SILENCE): Silence[] {
  return silences
    .filter(
      (silence) =>
        silence.duration >= minDuration &&
        silence.start > segment.start + 0.05 &&
        silence.end < segment.end - 0.05
    )
    .sort((a, b) => a.start - b.start);
}

function pickBestCuts(segment: Segment, candidates: Silence[], count: number): Silence[] {
  if (count <= 0) return [];
  if (candidates.length <= count) return candidates;

  if (count === 1) {
    return [candidates.sort((a, b) => b.duration - a.duration)[0]];
  }

  let best: Silence[] | null = null;
  let bestScore = Infinity;

  function choose(start: number, picked: Silence[]) {
    if (picked.length === count) {
      const ordered = [...picked].sort((a, b) => a.start - b.start);
      let cursor = segment.start;
      const partDurations: number[] = [];
      for (const cut of ordered) {
        partDurations.push(cut.start - cursor);
        cursor = cut.end;
      }
      partDurations.push(segment.end - cursor);
      const imbalance = Math.max(...partDurations) - Math.min(...partDurations);
      const score = imbalance - picked.reduce((sum, cut) => sum + cut.duration, 0) * 0.05;
      if (score < bestScore) {
        bestScore = score;
        best = ordered;
      }
      return;
    }
    for (let i = start; i < candidates.length; i++) {
      choose(i + 1, [...picked, candidates[i]]);
    }
  }

  choose(0, []);
  return best ?? candidates.slice(0, count);
}

function subdivideByTextWeights(segment: Segment, texts: string[]): Segment[] {
  const weights = texts.map((text) => Math.max(text.replace(/\s+/g, "").length, 8));
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  const duration = segment.end - segment.start;
  const result: Segment[] = [];
  let cursor = segment.start;

  for (let index = 0; index < texts.length; index++) {
    const end =
      index === texts.length - 1
        ? segment.end
        : cursor + duration * (weights[index] / totalWeight);
    result.push({ start: cursor, end });
    cursor = end;
  }

  return result;
}

function subdivideSegment(segment: Segment, silences: Silence[], parts: number, texts: string[]): Segment[] {
  if (parts === 1) return [segment];

  const strongInternal = internalSilences(segment, silences, STRONG_INTERNAL_SILENCE);
  if (strongInternal.length >= parts - 1) {
    const cuts = pickBestCuts(segment, strongInternal, parts - 1);
    cuts.sort((a, b) => a.start - b.start);
    const result: Segment[] = [];
    let cursor = segment.start;
    for (const cut of cuts) {
      result.push({ start: cursor, end: cut.start });
      cursor = cut.end;
    }
    result.push({ start: cursor, end: segment.end });
    if (result.length === parts) return result;
  }

  return subdivideByTextWeights(segment, texts);
}

function consumeCatalogGroup(
  coarse: Segment[],
  coarseIndex: number,
  group: CatalogGroup,
  silences: Silence[]
): { segments: Segment[]; nextIndex: number } {
  const { size: groupSize, texts } = group;

  if (groupSize === 1) {
    return { segments: [coarse[coarseIndex]], nextIndex: coarseIndex + 1 };
  }

  const collected: Segment[] = [];
  let endIndex = coarseIndex;

  while (endIndex < coarse.length) {
    collected.push(coarse[endIndex]);
    const merged = mergeSegments(collected);
    const mergedDuration = merged.end - merged.start;
    const strongBreaks = internalSilences(merged, silences, STRONG_INTERNAL_SILENCE);

    if (collected.length === 1 && strongBreaks.length >= groupSize - 1 && mergedDuration >= groupSize * 0.7) {
      return {
        segments: subdivideSegment(merged, silences, groupSize, texts),
        nextIndex: coarseIndex + 1,
      };
    }

    if (collected.length === groupSize) {
      const hasTiny = collected.some((segment) => segment.end - segment.start < TINY_SEGMENT);
      if (!hasTiny) {
        return { segments: collected, nextIndex: coarseIndex + groupSize };
      }
      return {
        segments: subdivideSegment(merged, silences, groupSize, texts),
        nextIndex: coarseIndex + groupSize,
      };
    }

    const next = coarse[endIndex + 1];
    const weakOnly =
      collected.length === 1 &&
      internalSilences(merged, silences, MIN_INTERNAL_SILENCE).length > 0 &&
      strongBreaks.length < groupSize - 1;

    if (weakOnly && mergedDuration >= groupSize * 0.5) {
      return {
        segments: subdivideSegment(merged, silences, groupSize, texts),
        nextIndex: coarseIndex + 1,
      };
    }

    const shouldKeepCollecting =
      collected.length < groupSize &&
      ((next && next.end - next.start < TINY_SEGMENT) ||
        (strongBreaks.length < groupSize - 1 && mergedDuration < groupSize * 1.8));

    if (shouldKeepCollecting && endIndex + 1 < coarse.length) {
      endIndex++;
      continue;
    }

    if (strongBreaks.length >= groupSize - 1 && mergedDuration >= groupSize * 0.7) {
      return {
        segments: subdivideSegment(merged, silences, groupSize, texts),
        nextIndex: endIndex + 1,
      };
    }

    endIndex++;
    if (collected.length >= groupSize || endIndex >= coarse.length) break;
  }

  const merged = mergeSegments(collected);
  return {
    segments: subdivideSegment(merged, silences, groupSize, texts),
    nextIndex: coarseIndex + collected.length,
  };
}

function segmentsFromCatalogGroups(
  duration: number,
  silences: Silence[],
  groups: CatalogGroup[]
): Segment[] {
  const expectedCount = groups.reduce((sum, group) => sum + group.size, 0);
  const lineBreaks = silences.filter((silence) => isLineBreak(silence, silences));
  const coarse = segmentsFromBoundaries(duration, lineBreaks);
  mergeTinyLeadingSegment(coarse);

  const fine: Segment[] = [];
  let coarseIndex = 0;

  for (const group of groups) {
    if (coarseIndex >= coarse.length) {
      throw new Error(
        `Ran out of audio blocks at clip ${fine.length + 1}/${expectedCount}. Re-export with [long pause] between every line.`
      );
    }
    const { segments, nextIndex } = consumeCatalogGroup(coarse, coarseIndex, group, silences);
    fine.push(...segments);
    coarseIndex = nextIndex;
  }

  if (fine.length !== expectedCount) {
    throw new Error(`Expected ${expectedCount} segments, built ${fine.length}.`);
  }

  return fine;
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
  const { input, variant } = parseArgs();
  const entries = catalogForVariant(variant);
  const groups = catalogGroups(entries);
  const duration = probeDuration(input);
  const silences = detectSilences(input);
  const segments = segmentsFromCatalogGroups(duration, silences, groups);

  fs.mkdirSync(OUT_DIR, { recursive: true });

  console.log(`Input: ${input}`);
  console.log(`Variant: ${variant}`);
  console.log(`Duration: ${duration.toFixed(2)}s`);
  console.log(`Catalog groups: ${groups.length} (${groups.filter((g) => g.size > 1).length} context blocks)`);
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
