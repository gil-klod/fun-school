const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const MAX_CHARS = 200;

export async function fetchGoogleTtsBuffer(
  text: string,
  lang: "he" | "en"
): Promise<ArrayBuffer | null> {
  const trimmed = text.trim().slice(0, MAX_CHARS);
  if (!trimmed) return null;

  const tl = lang === "en" ? "en" : "he";
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${tl}&q=${encodeURIComponent(trimmed)}`;

  try {
    const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
    if (!res.ok) return null;
    return res.arrayBuffer();
  } catch {
    return null;
  }
}
