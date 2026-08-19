export type MascotAnimation = "idle" | "clap" | "wave" | "talk";

export interface MascotShowOptions {
  text: string;
  animation?: MascotAnimation;
  speak?: boolean;
  /** Auto-hide bubble after ms. Default 6000. Set 0 to keep until dismissed. */
  durationMs?: number;
  /** If true, hide bubble but keep pinned character visible. */
  bubbleOnly?: boolean;
}

export interface MascotContextValue {
  show: (options: MascotShowOptions) => void;
  hide: () => void;
  celebrate: () => void;
  encourage: () => void;
  welcome: () => void;
  /** Say a random funny line for the current page/game. */
  sayContextLine: () => void;
  /** Toggle always-visible Milo mode. */
  togglePinned: () => void;
  pinned: boolean;
  bubbleOpen: boolean;
  text: string;
  animation: MascotAnimation;
}
