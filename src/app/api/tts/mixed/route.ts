import { NextRequest, NextResponse } from "next/server";
import { miloSpeechText } from "@/lib/mascot/audioExport";
import { fetchGoogleTtsBuffer } from "@/lib/mascot/googleTts";

interface MixedSegment {
  lang: "he" | "en";
  text: string;
}

/** Stitch Hebrew/English TTS segments into one clip (no gaps/cuts between chunks). */
export async function POST(req: NextRequest) {
  let body: { segments?: MixedSegment[] };
  try {
    body = (await req.json()) as { segments?: MixedSegment[] };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const segments = body.segments?.filter((s) => s.text?.trim() && (s.lang === "he" || s.lang === "en"));
  if (!segments?.length) {
    return NextResponse.json({ error: "Missing segments" }, { status: 400 });
  }

  const chunks: Buffer[] = [];
  for (const segment of segments) {
    const spoken = miloSpeechText(segment.text, segment.lang);
    if (!spoken) continue;
    const buf = await fetchGoogleTtsBuffer(spoken, segment.lang);
    if (!buf) {
      return NextResponse.json({ error: "TTS upstream failed" }, { status: 502 });
    }
    chunks.push(Buffer.from(buf));
  }

  if (!chunks.length) {
    return NextResponse.json({ error: "Nothing to speak" }, { status: 400 });
  }

  const audio = Buffer.concat(chunks);
  return new NextResponse(audio, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "private, max-age=86400",
    },
  });
}
