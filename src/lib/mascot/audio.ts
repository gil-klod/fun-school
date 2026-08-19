/** Milo pre-recorded clip id, e.g. `he:mascot.welcome:male` or `en:context:home:0`. */
export type MiloAudioId = string;

export interface MiloLine {
  text: string;
  audioId: MiloAudioId;
}

/** Filesystem-safe filename for public/audio/milo/{filename}.mp3 */
export function miloAudioFilename(audioId: MiloAudioId): string {
  return `${audioId.replace(/:/g, "--")}.mp3`;
}

export function miloAudioUrl(audioId: MiloAudioId): string {
  return `/audio/milo/${miloAudioFilename(audioId)}`;
}

export function speechLineAudioId(
  locale: "he" | "en",
  key: string,
  gender?: "male" | "female"
): MiloAudioId {
  if (locale === "he" && gender) return `he:${key}:${gender}`;
  return `en:${key}`;
}

export function contextLineAudioId(
  locale: "he" | "en",
  context: string,
  index: number,
  gender?: "male" | "female"
): MiloAudioId {
  if (locale === "he" && gender) return `he:context:${context}:${gender}:${index}`;
  return `en:context:${context}:${index}`;
}
