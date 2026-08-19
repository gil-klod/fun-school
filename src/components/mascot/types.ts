export type MascotAnimation = "idle" | "clap" | "wave" | "talk";

export interface MascotShowOptions {
  text: string;
  animation?: MascotAnimation;
  /** Read the bubble aloud (browser TTS). Default true. */
  speak?: boolean;
  /** Auto-hide after ms. Default 6000. Set 0 to keep until dismissed. */
  durationMs?: number;
}

export interface MascotContextValue {
  show: (options: MascotShowOptions) => void;
  hide: () => void;
  celebrate: () => void;
  encourage: () => void;
  welcome: () => void;
  visible: boolean;
  text: string;
  animation: MascotAnimation;
}
