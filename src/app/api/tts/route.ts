import { NextRequest, NextResponse } from "next/server";

const MAX_CHARS = 280;

/** Proxy TTS for locales missing browser voices (Hebrew on many desktops). */
export async function GET(req: NextRequest) {
  const text = req.nextUrl.searchParams.get("text")?.trim().slice(0, MAX_CHARS);
  const langParam = req.nextUrl.searchParams.get("lang");
  const tl = langParam === "en" ? "en" : "he";

  if (!text) {
    return NextResponse.json({ error: "Missing text" }, { status: 400 });
  }

  const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${tl}&q=${encodeURIComponent(text)}`;

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "TTS upstream failed" }, { status: 502 });
    }

    const audio = await res.arrayBuffer();
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
