"use client";

import { useEffect, useMemo, type CSSProperties } from "react";
import { SpiderMusicPlayer } from "@/components/leibox/spider-music-player/SpiderMusicPlayer";
import type { SpiderMusicTrack } from "@/components/leibox/spider-music-player/SpiderMusicPlayerEngine";
import type { MusicTrack } from "./MusicPlayer";

/**
 * 展开页：LeiBox 蜘蛛点唱机。
 * 平时不挂载，点击悬浮播放器的「展开」后才加载 1.4MB 的组件源码。
 * 播放进度、曲目、播放状态全部由外层的 <audio> 托管。
 */

const FALLBACK_COVER = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#1d4ed8"/><stop offset="1" stop-color="#60a5fa"/></linearGradient></defs><rect width="600" height="600" fill="url(#g)"/><path d="M405 170a16 16 0 0 0-19.8-15.7l-150 34A16 16 0 0 0 222 204v154a62 62 0 1 0 32 54V252l118-26v104a62 62 0 1 0 32 54V170Z" fill="#fff" fill-opacity=".92"/></svg>`,
)}`;

interface SpiderPlayerOverlayProps {
  musics: MusicTrack[];
  trackIndex: number;
  playing: boolean;
  position: number;
  duration?: number;
  onTrackChange: (index: number) => void;
  onPlayChange: (playing: boolean) => void;
  onSeek: (seconds: number) => void;
  onClose: () => void;
}

export default function SpiderPlayerOverlay({
  musics,
  trackIndex,
  playing,
  position,
  duration,
  onTrackChange,
  onPlayChange,
  onSeek,
  onClose,
}: SpiderPlayerOverlayProps) {
  const tracks = useMemo<SpiderMusicTrack[]>(
    () =>
      musics.map((music) => ({
        id: String(music.id),
        title: music.musicName,
        artist: music.musicAuthor,
        album: "Moon Blog",
        duration: 480,
        year: "2026",
        genre: "Moon · 音乐",
        source: music.musicUrl,
        artwork: music.cover || FALLBACK_COVER,
        copyright: "Moon Blog · 在线试听",
      })),
    [musics],
  );

  const options = useMemo(
    () => ({
      track: trackIndex,
      playing,
      position,
      duration,
      tracks,
      onTrackChange,
      onPlayChange,
      onSeek,
    }),
    [
      trackIndex,
      playing,
      position,
      duration,
      tracks,
      onTrackChange,
      onPlayChange,
      onSeek,
    ],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      // 组件内部的搜索框 / 添加弹窗优先处理 Esc，不关闭展开页
      const editing = event
        .composedPath()
        .some(
          (node) =>
            node instanceof HTMLElement &&
            (node.tagName === "INPUT" ||
              node.tagName === "TEXTAREA" ||
              node.tagName === "SELECT"),
        );
      if (!editing) onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-label="蜘蛛点唱机"
      className="pointer-events-none fixed inset-0 z-[100] flex items-end justify-start p-4 pb-7 sm:pb-8"
    >
      <div
        className="animate-in fade-in-0 pointer-events-auto relative duration-300"
        style={
          {
            "--spider-width": "min(680px, 94vw, calc(65vh * 1.31))",
          } as CSSProperties
        }
      >
        <button
          type="button"
          aria-label="关闭展开播放器"
          onClick={onClose}
          className="absolute -top-11 right-1 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-neutral-500 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.45)] ring-1 ring-black/10 backdrop-blur transition-colors hover:bg-white hover:text-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black/40"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        {/* 裁掉 LeiBox 场景四周的灰色台面，只保留双屏设备本身 */}
        <div
          className="relative overflow-hidden shadow-[0_30px_90px_-30px_rgba(0,0,0,0.7)]"
          style={{
            width: "var(--spider-width)",
            aspectRatio: "1228 / 868",
            borderRadius: "calc(var(--spider-width) * 0.06352)",
          }}
        >
          <div
            className="absolute"
            style={{
              width: "calc(var(--spider-width) * 1.153094)",
              left: "calc(var(--spider-width) * -0.076547)",
              top: "calc(var(--spider-width) * -0.086319)",
            }}
          >
            <SpiderMusicPlayer options={options} className="h-full w-full" />
          </div>
        </div>
      </div>
    </div>
  );

}
