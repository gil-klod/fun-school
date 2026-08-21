import type { MiloTextEntry } from "@/lib/mascot/catalog";
import { miloSpeechText } from "@/lib/mascot/audioExport";

/** Pause between Milo lines in MiniMax TTS — must match split script detection. */
export const MINIMAX_LINE_PAUSE_SECONDS = 1.5;

export const MINIMAX_LINE_PAUSE_TAG = `<#${MINIMAX_LINE_PAUSE_SECONDS.toFixed(2)}#>`;

/** Legacy ElevenLabs / DaVinci modes (kept for reference). */
export type MiloRecordingPauseMode = "minimax" | "eleven-v3" | "eleven-v2";

export const MILO_RECORDING_PAUSE_MODES: Record<
  MiloRecordingPauseMode,
  { label: string; hint: string; separator: string }
> = {
  minimax: {
    label: "MiniMax TTS (recommended)",
    hint: `Uses ${MINIMAX_LINE_PAUSE_TAG} between lines — ${MINIMAX_LINE_PAUSE_SECONDS}s pause for reliable splitting.`,
    separator: MINIMAX_LINE_PAUSE_TAG,
  },
  "eleven-v3": {
    label: "Eleven v3 (DaVinci legacy)",
    hint: "Uses [long pause] between lines.",
    separator: "\n[long pause]\n",
  },
  "eleven-v2": {
    label: "Eleven Multilingual v2 (legacy)",
    hint: 'Uses SSML <break time="1.0s" />.',
    separator: '\n<break time="1.0s" />\n',
  },
};

const MINIMAX_CHAR_LIMIT = 10_000;

/** One block to paste into MiniMax — all lines with pause tags, emoji stripped for TTS. */
export function formatMiloRecordingExport(
  entries: MiloTextEntry[],
  mode: MiloRecordingPauseMode = "minimax"
): string {
  const separator = MILO_RECORDING_PAUSE_MODES[mode].separator;
  return entries.map((entry) => miloSpeechText(entry.text, entry.locale)).join(separator);
}

export function miloRecordingExportHint(lineCount: number, mode: MiloRecordingPauseMode): string {
  const { hint } = MILO_RECORDING_PAUSE_MODES[mode];
  return `${lineCount} lines · ${hint}`;
}

export function miloRecordingExportCharCount(entries: MiloTextEntry[], mode: MiloRecordingPauseMode): number {
  return formatMiloRecordingExport(entries, mode).length;
}

export function miloRecordingExportInstructions(mode: MiloRecordingPauseMode): string {
  if (mode === "minimax") {
    return (
      "Paste into MiniMax Text to Speech. Do not remove pause tags like " +
      MINIMAX_LINE_PAUSE_TAG +
      " — one tag between every line. Download MP3, then run split-milo-audio."
    );
  }
  if (mode === "eleven-v3") {
    return "Legacy DaVinci export — each line ends with [long pause].";
  }
  return "Legacy Eleven v2 SSML export.";
}

export function miloRecordingWithinMinimaxLimit(entries: MiloTextEntry[], mode: MiloRecordingPauseMode): boolean {
  return miloRecordingExportCharCount(entries, mode) <= MINIMAX_CHAR_LIMIT;
}
