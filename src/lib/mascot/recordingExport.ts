import type { MiloTextEntry } from "@/lib/mascot/catalog";

/** DaVinci uses ElevenLabs — blank lines are ignored; use explicit pause tags. */
export type MiloRecordingPauseMode = "eleven-v3" | "eleven-v2";

export const MILO_RECORDING_PAUSE_MODES: Record<
  MiloRecordingPauseMode,
  { label: string; hint: string; separator: string }
> = {
  "eleven-v3": {
    label: "Eleven v3 (DaVinci default)",
    hint: "Uses [long pause] between lines — required for Eleven v3 in DaVinci.",
    separator: "\n[long pause]\n",
  },
  "eleven-v2": {
    label: "Eleven Multilingual v2",
    hint: "Uses SSML <break time=\"1.0s\" /> — for Multilingual v2, not v3.",
    separator: '\n<break time="1.0s" />\n',
  },
};

/** Text pasted into DaVinci: one Milo line per clip with explicit pause markers. */
export function formatMiloRecordingExport(
  entries: MiloTextEntry[],
  mode: MiloRecordingPauseMode = "eleven-v3"
): string {
  const separator = MILO_RECORDING_PAUSE_MODES[mode].separator;
  return entries.map((entry) => entry.text.trim()).join(separator);
}

/** One line per box — record separately in DaVinci to avoid splitting one long MP3. */
export function formatMiloRecordingExportLines(entries: MiloTextEntry[]): string[] {
  return entries.map((entry) => entry.text.trim());
}

export function miloRecordingExportHint(lineCount: number, mode: MiloRecordingPauseMode): string {
  const { hint } = MILO_RECORDING_PAUSE_MODES[mode];
  return `${lineCount} lines · ${hint}`;
}

export function miloRecordingExportInstructions(mode: MiloRecordingPauseMode): string {
  if (mode === "eleven-v3") {
    return "DaVinci ignores blank lines. Copy as-is — each clip ends with [long pause] before the next line. Use Eleven v3 in DaVinci.";
  }
  return "DaVinci ignores blank lines. Copy as-is — SSML break tags create the gap. Select Eleven Multilingual v2 in DaVinci (not v3).";
}
