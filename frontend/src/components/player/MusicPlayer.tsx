"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause, SkipBack, SkipForward, ListMusic, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Track {
  id: number | string;
  title: string;
  artist?: string;
  src: string;
  cover?: string;
}

interface MusicPlayerProps {
  playlist: Track[];
  autoPlay?: boolean;
}

/** 悬浮音乐播放器（spec §6.6） */
export function MusicPlayer({ playlist, autoPlay = false }: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [playlistOpen, setPlaylistOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    setIsMobile(mq.matches);
    const handler = () => setIsMobile(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const current = playlist[index];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !current) return;
    audio.src = current.src;
    if (playing) audio.play().catch(() => setPlaying(false));
  }, [current, index]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) audio.play().catch(() => setPlaying(false));
    else audio.pause();
  }, [playing]);

  useEffect(() => {
    if (!autoPlay) return;
    setPlaying(true);
  }, [autoPlay]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!current) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setIndex((i) => (i - 1 + playlist.length) % playlist.length);
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        setIndex((i) => (i + 1) % playlist.length);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [current, playlist.length]);

  if (!current) return null;

  const panelWidth = isMobile ? "15.5rem" : "18rem";
  const panelHeight = isMobile ? "4rem" : "4.25rem";
  const offsetX = expanded ? 0 : isMobile ? "-13.5rem" : "-15.84rem";

  const fmt = (sec: number) => {
    if (!sec || isNaN(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className={cn(
        "music-player-panel group fixed bottom-8 z-50 flex items-center gap-2 rounded-xl p-2 transition-all duration-300 ease-out",
      )}
      style={{
        width: panelWidth,
        height: playlistOpen ? "auto" : panelHeight,
        left: `calc(2rem + ${offsetX})`,
      )}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      {/* 封面 */}
      <button
        type="button"
        onClick={() => setPlaying((v) => !v)}
        className="relative shrink-0 overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-700"
        style={{ width: "3.25rem", height: "3.25rem" }}
      >
        {current.cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={current.cover}
            alt={current.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600 text-lg text-white">
            ♫
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
          {playing ? <Pause className="h-4 w-4 text-white" /> : <Play className="h-4 w-4 text-white" />}
        </div>
      </button>

      {/* 信息 + 进度 */}
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-1" style={{ height: "3.25rem" }}>
        <div className="flex items-center justify-between gap-1">
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-medium text-gray-900 dark:text-gray-100">
              {current.title}
            </div>
            {current.artist && (
              <div className="truncate text-[10px] text-gray-500">{current.artist}</div>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => setIndex((i) => (i - 1 + playlist.length) % playlist.length)}
              className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-700"
              aria-label="上一首"
            >
              <SkipBack className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={() => setIndex((i) => (i + 1) % playlist.length)}
              className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-700"
              aria-label="下一首"
            >
              <SkipForward className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={() => setPlaylistOpen((v) => !v)}
              className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-700"
              aria-label="播放列表"
            >
              <ListMusic className="h-3 w-3" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="shrink-0 text-[10px] text-gray-500 tabular-nums">{fmt(currentTime)}</span>
          <div
            className="music-progress-track flex-1"
            onClick={(e) => {
              const audio = audioRef.current;
              if (!audio) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const ratio = (e.clientX - rect.left) / rect.width;
              audio.currentTime = ratio * (duration || 0);
              setProgress(ratio);
            }}
          >
            <div
              className="music-progress-fill"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <span className="shrink-0 text-[10px] text-gray-500 tabular-nums">{fmt(duration)}</span>
        </div>
      </div>

      {/* 播放列表 */}
      {playlistOpen && (
        <div className="absolute bottom-full left-0 right-0 mb-2 max-h-60 overflow-y-auto rounded-xl bg-white/95 p-2 shadow-lg backdrop-blur-md dark:bg-gray-800/95">
          <div className="mb-1 flex items-center justify-between px-1">
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              播放列表 ({playlist.length})
            </span>
            <button
              type="button"
              onClick={() => setPlaylistOpen(false)}
              className="text-gray-400 hover:text-gray-600"
              aria-label="关闭列表"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
          <ul className="space-y-1">
            {playlist.map((t, i) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => {
                    setIndex(i);
                    setPlaying(true);
                  }}
                  className={cn(
                    "block w-full truncate rounded p-1.5 text-left text-xs transition-colors",
                    i === index
                      ? "music-playlist-active"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700",
                  )}
                >
                  {t.title}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <audio
        ref={audioRef}
        preload="metadata"
        onTimeUpdate={(e) => {
          const a = e.currentTarget;
          setCurrentTime(a.currentTime);
          if (a.duration) setProgress(a.currentTime / a.duration);
        }}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={() => setIndex((i) => (i + 1) % playlist.length)}
      />
    </div>
  );
}