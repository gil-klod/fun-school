/**
 * Batch-generate Milo MP3 clips into public/audio/milo/.
 * Uses Google Translate TTS (free). Replace files anytime with better recordings — same filenames.
 *
 * Usage: npx tsx scripts/generate-milo-audio.ts
 */
import fs from "fs";
import path from "path";
import { getMiloTextCatalog } from "../src/lib/mascot/catalog";
import { miloAudioFilename, textForSpeech } from "../src/lib/mascot/audioExport";

const OUT_DIR = path.join(process.cwd(), "public/audio/milo");
const DELAY_MS = 250;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchTts(text: string, locale: "he" | "en"): Promise<Buffer> {
  const tl = locale === "en" ? "en" : "he";
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${tl}&q=${encodeURIComponent(text.slice(0, 280))}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  });
  if (!res.ok) throw new Error(`TTS failed ${res.status} for: ${text.slice(0, 40)}…`);
  return Buffer.from(await res.arrayBuffer());
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const catalog = getMiloTextCatalog();
  let created = 0;
  let skipped = 0;

  for (const entry of catalog) {
    const filename = miloAudioFilename(entry.id);
    const outPath = path.join(OUT_DIR, filename);

    if (fs.existsSync(outPath)) {
      skipped += 1;
      continue;
    }

    const spoken = textForSpeech(entry.text);
    if (!spoken) continue;

    process.stdout.write(`Generating ${filename}… `);
    try {
      const buf = await fetchTts(spoken, entry.locale);
      fs.writeFileSync(outPath, buf);
      created += 1;
      console.log("ok");
    } catch (err) {
      console.log("FAILED", err instanceof Error ? err.message : err);
    }

    await sleep(DELAY_MS);
  }

  console.log(`Done. Created ${created}, skipped ${skipped} existing, total catalog ${catalog.length}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
