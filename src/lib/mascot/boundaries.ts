/** Manual clip boundaries for splitting a long Milo recording. */
export interface MiloBoundaryClip {
  id: string;
  start: number;
  end: number;
}

export interface MiloBoundaryFile {
  variant: "en" | "he-male" | "he-female";
  source: string;
  duration: number;
  clips: MiloBoundaryClip[];
}

export const MILO_BOUNDARIES_STORAGE_KEY = "fun-school-milo-boundaries";
