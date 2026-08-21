/**
 * Normalize Hebrew Milo lines for clearer TTS pacing (commas, periods, questions).
 */
export function punctuateHebrewForSpeech(text: string): string {
  let s = text
    .replace(/…/g, "...")
    .replace(/\.\.\./g, ", ")
    .replace(/—/g, ", ")
    .replace(/–/g, ", ")
    .replace(/,([^\s])/g, ", $1");

  // Short pause after greetings before the next clause.
  s = s.replace(/^(היי!)\s+/u, "$1, ");
  s = s.replace(/^(היי!,\s*אני מיילו)\s+/u, "$1. ");

  // Comma before chained verbs/imperatives common in Milo lines.
  s = s.replace(/\s+וב(וא|ואי)\s/g, ", ו$1 ");

  s = s.replace(/\s+/g, " ").trim();

  if (!/[.!?]$/.test(s)) {
    s = `${s}.`;
  }

  return s;
}
