import type { MiloTextEntry } from "@/lib/mascot/catalog";

/** Two blank lines between clips — keeps a long silence for auto-splitting. */
export const MILO_RECORDING_LINE_GAP = "\n\n\n";

/** Text pasted into DaVinci: one Milo line per block, separated by empty lines. */
export function formatMiloRecordingExport(entries: MiloTextEntry[]): string {
  return entries.map((entry) => entry.text.trim()).join(MILO_RECORDING_LINE_GAP);
}

export function miloRecordingExportHint(lineCount: number): string {
  return `${lineCount} lines · one block per clip · keep the blank gaps when recording`;
}
