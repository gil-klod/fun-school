import { NextRequest, NextResponse } from "next/server";
import { fetchGoogleTtsBuffer } from "@/lib/mascot/googleTts";

const MAX_CHARS = 200;

/** Proxy TTS for locales missing browser voices (Hebrew on many desktops). */
export async function GET(req: NextRequest) {
  const text = req.nextUrl.searchParams.get("text")?.trim().slice(0, MAX_CHARS);
  const langParam = req.nextUrl.searchParams.get("lang");
  const lang = langParam === "en" ? "en" : "he";

  if (!text) {
    return NextResponse.json({ error: "Missing text" }, { status: 400 });
  }

  try {
    const audio = await fetchGoogleTtsBuffer(text, lang);
    if (!audio) {
      return NextResponse.json({ error: "TTS upstream failed" }, { status: 502 });
    }

    return new NextResponse(audio, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "private, max-age=86400",
      },
    });
  } catch {
    return NextResponse.json({ error: "TTS failed" }, { status: 502 });
  }
}
