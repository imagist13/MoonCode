import type { MotionOptions, MotionController } from "./motion-runtime";

export interface SpiderMusicTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  year?: string;
  genre?: string;
  source?: string;
  artwork: string;
  copyright?: string;
  file?: string;
}

export type SpiderMusicPlayerOptions = MotionOptions & {
  track?: number;
  playing?: boolean;
  /** Seconds elapsed. Supplying it hands the playhead to the host (the built-in timer stops). */
  position?: number;
  /** Duration in seconds for the current track. */
  duration?: number;
  /** Host playlist; falls back to the LeiBox demo tracks when omitted. */
  tracks?: SpiderMusicTrack[];
  onTrackChange?: (index: number) => void;
  onPlayChange?: (playing: boolean) => void;
  onSeek?: (seconds: number) => void;
};

export function mountSpiderMusicPlayer(
  target: HTMLElement,
  options?: SpiderMusicPlayerOptions,
): Omit<MotionController, "update"> & {
  update(options: SpiderMusicPlayerOptions): void;
};
