/**
 * Export Hebrew female Milo lines for edge-tts batch generation.
 *
 * Usage: npx tsx scripts/export-milo-he-female-queue.ts
 */
import fs from "fs";
import path from "path";
import { getMiloTextCatalog } from "../src/lib/mascot/catalog";
import { miloAudioFilename, miloSpeechText } from "../src/lib/mascot/audioExport";

const OUT = path.join(process.cwd(), "scripts/milo-he-female-queue.json");

const items = getMiloTextCatalog()
  .filter((e) => e.locale === "he" && e.gender === "female")
  .map((e) => ({
    filename: miloAudioFilename(e.id),
    text: miloSpeechText(e.text, "he"),
    id: e.id,
  }))
  .filter((e) => e.text.length > 0);

fs.writeFileSync(OUT, JSON.stringify(items, null, 2), "utf-8");
console.log(`Wrote ${items.length} items to ${OUT}`);
