import type { Locale } from "@/i18n/types";

/** Milo speaks English on advanced English routes regardless of UI language. */
export function effectiveMascotLocale(pathname: string, globalLocale: Locale): Locale {
  if (pathname.startsWith("/english-natives")) return "en";
  return globalLocale;
}
