export type MascotAnimation = "idle" | "clap" | "wave" | "talk";

export interface MascotShowOptions {
  text: string;
  audioId?: string;
  animation?: MascotAnimation;
  speak?: boolean;
  durationMs?: number;
}

export interface MascotContextValue {
  show: (options: MascotShowOptions) => void;
  hide: () => void;
  celebrate: () => void;
  encourage: () => void;
  welcome: () => void;
  sayContextLine: () => void;
  togglePinned: () => void;
  toggleMuted: () => void;
  /** Re-read the current bubble text aloud. */
  replaySpeech: () => void;
  pinned: boolean;
  muted: boolean;
  speaking: boolean;
  bubbleOpen: boolean;
  text: string;
  animation: MascotAnimation;
}
