"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useIsMobile } from "@/hooks/use-mobile";

// 展开页体积较大（LeiBox 蜘蛛点唱机），只在第一次打开时下载。
const SpiderPlayerOverlay = dynamic(() => import("./SpiderPlayerOverlay"), {
  ssr: false,
  loading: () => (
    <div className="pointer-events-none fixed inset-0 z-[100] flex items-end justify-start p-4 pb-7">
      <div className="flex h-12 items-center gap-2.5 rounded-full bg-white/90 px-4 text-xs text-zinc-600 shadow-lg backdrop-blur dark:bg-zinc-800/90 dark:text-zinc-300">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-500 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
        </span>
        正在展开点唱机…
      </div>
    </div>
  ),
});

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080/api/v1";

export interface MusicTrack {
  id: number;
  musicName: string;
  musicAuthor: string;
  musicUrl: string;
  /** 封面图地址（可选；没有时展示蓝色音符占位） */
  cover?: string;
}

interface MusicListResponse {
  data?: MusicTrack[] | null;
}

/**
 * 博客全站悬浮音乐播放器。
 *
 * 1:1 复刻 demo/dim_stack 的 MusicPlayer：
 * 平时收起在屏幕左边缘，悬停展开；封面点击播放/暂停，进度可拖动，
 * 「列表」在面板上方展开，播放中可用左右方向键切歌，播完自动下一首。
 */
export function MusicPlayer() {
  const [musics, setMusics] = useState<MusicTrack[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [brokenCover, setBrokenCover] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const audioRef = useRef<HTMLAudioElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const blockTimeUpdateRef = useRef(false);
  const isLoadingPlayRef = useRef(false);
  const isPlayingRef = useRef(false);
  const musicsRef = useRef<MusicTrack[]>(musics);
  const currentIndexRef = useRef(currentIndex);

  const currentMusic = musics[currentIndex] ?? null;
  const hasMusic = musics.length > 0;

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);
  useEffect(() => {
    musicsRef.current = musics;
  }, [musics]);
  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  /* ---------------- 音乐列表 ---------------- */
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/music/enabled`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const json = (await res.json()) as MusicListResponse;
        const list = Array.isArray(json.data)
          ? json.data.filter((item) => item?.musicUrl)
          : [];
        if (!cancelled) {
          setMusics(list);
          setCurrentIndex(0);
        }
      } catch {
        // 没有音乐接口时静默隐藏播放器，不影响其它页面
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  /* ---------------- 外部点击 ---------------- */
  useEffect(() => {
    if (!isExpanded) return;
    const handleOutsideTouch = (e: TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsExpanded(false);
        setShowPlaylist(false);
      }
    };
    document.addEventListener("touchstart", handleOutsideTouch);
    return () => document.removeEventListener("touchstart", handleOutsideTouch);
  }, [isExpanded]);

  /* ---------------- 播放控制 ---------------- */
  const changeTrack = useCallback((index: number, autoplay: boolean) => {
    const list = musicsRef.current;
    const audio = audioRef.current;
    if (!audio || index < 0 || index >= list.length) return;

    // 允许在上一首还在加载时直接切歌
    isLoadingPlayRef.current = false;
    blockTimeUpdateRef.current = true;
    currentIndexRef.current = index;
    setProgress(0);
    setCurrentTime(0);
    setTotalTime(0);
    setCurrentIndex(index);
    audio.src = list[index].musicUrl;
    audio.load();

    if (!autoplay) {
      setIsPlaying(false);
      blockTimeUpdateRef.current = false;
      return;
    }

    isLoadingPlayRef.current = true;
    const onReady = () => {
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false))
        .finally(() => {
          isLoadingPlayRef.current = false;
          blockTimeUpdateRef.current = false;
        });
      audio.removeEventListener("canplay", onReady);
    };
    audio.addEventListener("canplay", onReady, { once: true });
  }, []);

  const selectAndPlay = useCallback(
    (index: number) => {
      setShowPlaylist(false);
      changeTrack(index, true);
    },
    [changeTrack],
  );

  const playAudio = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || isLoadingPlayRef.current) return;
    isLoadingPlayRef.current = true;
    const attemptPlay = () => {
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false))
        .finally(() => {
          isLoadingPlayRef.current = false;
          audio.removeEventListener("canplay", attemptPlay);
        });
    };
    if (audio.readyState >= 2) {
      attemptPlay();
    } else {
      audio.addEventListener("canplay", attemptPlay, { once: true });
      audio.load();
    }
  }, []);

  const pauseAudio = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pauseAudio();
    } else {
      playAudio();
    }
  }, [isPlaying, pauseAudio, playAudio]);

  /* ---------------- 展开页联动 ---------------- */
  const openOverlay = useCallback(() => {
    setShowPlaylist(false);
    setIsExpanded(true);
    setIsOverlayOpen(true);
  }, []);

  const closeOverlay = useCallback(() => setIsOverlayOpen(false), []);

  const handleSpiderTrackChange = useCallback(
    (index: number) => {
      // 展开页会回传由本组件发起的曲目变更，避免重复加载
      if (index === currentIndexRef.current) return;
      changeTrack(index, isPlayingRef.current);
    },
    [changeTrack],
  );

  const handleSpiderPlayChange = useCallback(
    (next: boolean) => {
      if (next) playAudio();
      else pauseAudio();
    },
    [pauseAudio, playAudio],
  );

  const handleSpiderSeek = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const duration =
      Number.isFinite(audio.duration) && audio.duration > 0
        ? audio.duration
        : seconds;
    const target = Math.max(0, Math.min(duration, seconds));
    if (!Number.isFinite(target)) return;
    audio.currentTime = target;
    setCurrentTime(target);
    if (audio.duration > 0) {
      setProgress((target / audio.duration) * 100);
    }
  }, []);

  /* ---------------- 音频事件 ---------------- */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      if (blockTimeUpdateRef.current) return;
      setCurrentTime(audio.currentTime);
      if (audio.duration && !Number.isNaN(audio.duration)) {
        setProgress((audio.currentTime / audio.duration) * 100 || 0);
      }
    };
    const onEnded = () => {
      setIsPlaying(false);
      const idx = currentIndexRef.current;
      const len = musicsRef.current.length;
      if (len > 0) selectAndPlay((idx + 1) % len);
    };
    const onError = () => {
      setIsPlaying(false);
      // 加载失败时释放锁，避免按钮一直处于「加载中」而无法再操作
      isLoadingPlayRef.current = false;
      blockTimeUpdateRef.current = false;
    };
    const onLoadedMetadata = () => {
      if (audio.duration && Number.isFinite(audio.duration)) {
        setTotalTime(audio.duration);
      }
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
    };
  }, [hasMusic, selectAndPlay]);

  /* ---------------- 首次加载首曲 ---------------- */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentMusic) return;
    if (!audio.getAttribute("src")) {
      audio.src = currentMusic.musicUrl;
    }
  }, [currentMusic]);

  /* ---------------- 键盘切歌（播放中生效） ---------------- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // 展开页内部有独立的键盘控制，避免左右键触发两次切歌
      if (isOverlayOpen) return;
      if (!isPlayingRef.current) return;
      const len = musicsRef.current.length;
      if (len === 0) return;
      const idx = currentIndexRef.current;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        selectAndPlay((idx + 1) % len);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        selectAndPlay((idx - 1 + len) % len);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOverlayOpen, selectAndPlay]);

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration || Number.isNaN(audio.duration)) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = Math.max(
      0,
      Math.min(1, (e.clientX - rect.left) / rect.width),
    );
    const time = percent * audio.duration;
    if (Number.isFinite(time)) {
      audio.currentTime = time;
      setCurrentTime(time);
      setProgress(percent * 100);
    }
  };

  const formatTime = (seconds: number) => {
    if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!hasMusic) return null;

  const coverArt =
    currentMusic?.cover && currentMusic.cover !== brokenCover
      ? currentMusic.cover
      : null;

  return (
    <>
      <div
        ref={containerRef}
        aria-hidden={isOverlayOpen || undefined}
        inert={isOverlayOpen || undefined}
        className={`music-player fixed z-50 flex flex-col items-stretch transition-all duration-300 ease-out ${
          isOverlayOpen ? "pointer-events-none opacity-0" : ""
        }`}
        style={{
          left: isExpanded ? 0 : isMobile ? "-13.5rem" : "-15.84rem",
          bottom: isMobile ? "1.75rem" : "2rem",
        }}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => {
          setIsExpanded(false);
          setShowPlaylist(false);
        }}
      >
      {showPlaylist && (
        <div className="music-playlist-panel">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="music-track-name text-xs font-medium">播放列表</span>
            <span className="music-time text-[10px]">{musics.length} 首</span>
          </div>
          <div className="music-playlist custom-scrollbar max-h-40 overflow-y-auto rounded-lg p-1">
            {musics.map((music, idx) => (
              <div
                key={music.id}
                onClick={() => selectAndPlay(idx)}
                className={`mb-0.5 flex cursor-pointer items-center gap-2 rounded p-1.5 transition-all last:mb-0 ${
                  currentMusic?.id === music.id
                    ? "music-playlist-active"
                    : "music-playlist-item"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[10px] font-medium">
                    {music.musicName}
                  </div>
                  <div className="truncate text-[10px] opacity-60">
                    {music.musicAuthor}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div
        className={`music-player-panel${showPlaylist ? " has-playlist" : ""}`}
        onClick={
          isExpanded
            ? undefined
            : (e) => {
                e.stopPropagation();
                setIsExpanded(true);
              }
        }
      >
        <div
          className={`music-cover-wrapper${isExpanded ? "" : " pointer-events-none"}`}
          onClick={togglePlay}
          title={isPlaying ? "暂停" : "播放"}
        >
          {coverArt ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverArt}
              alt=""
              className="music-cover-img"
              onError={() => setBrokenCover(currentMusic?.cover ?? null)}
            />
          ) : (
            <div className="music-cover-placeholder">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
              </svg>
            </div>
          )}
          <div className="music-cover-overlay">
            {isPlaying ? (
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
        </div>

        <div className={`music-body${isExpanded ? "" : " pointer-events-none"}`}>
          <div className="flex items-center justify-between">
            <div className="music-track-name truncate text-[11px] font-medium">
              {currentMusic?.musicName || "暂无音乐"}
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <button
                type="button"
                className="music-list-toggle shrink-0"
                aria-expanded={showPlaylist}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPlaylist(!showPlaylist);
                }}
              >
                {showPlaylist ? "收起" : "列表"}
              </button>
              <button
                type="button"
                className="music-list-toggle shrink-0"
                aria-label="展开蜘蛛点唱机"
                aria-haspopup="dialog"
                aria-expanded={isOverlayOpen}
                onClick={(e) => {
                  e.stopPropagation();
                  openOverlay();
                }}
              >
                展开
              </button>
            </div>
          </div>
          <div className="music-seek-area cursor-pointer" onClick={handleSeek}>
            <div className="music-progress-track group relative h-[3px] overflow-hidden rounded-full">
              <div
                className="music-progress-bar relative h-full rounded-full transition-all"
                style={{ width: `${progress}%` }}
              >
                <div className="music-progress-handle absolute right-0 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            </div>
            <div className="mt-0.5 flex justify-between">
              <span className="music-time text-[9px]">
                {formatTime(currentTime)}
              </span>
              <span className="music-time text-[9px]">{formatTime(totalTime)}</span>
            </div>
          </div>
        </div>
      </div>

      <audio ref={audioRef} preload="auto" />

      <style>{`
        .music-player-panel {
          display: flex;
          border-radius: 0.75rem;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(229, 231, 235, 0.5);
          box-shadow: 4px 4px 24px rgba(0, 0, 0, 0.08), 2px 2px 8px rgba(0, 0, 0, 0.04);
          width: ${isMobile ? "15.5rem" : "18rem"};
          height: ${isMobile ? "4rem" : "4.25rem"};
          padding: 0.5rem;
          gap: 0.5rem;
          align-items: stretch;
        }
        .music-player-panel.has-playlist {
          border-radius: 0 0 0.75rem 0.75rem;
          border-top: none;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
        }

        .music-cover-wrapper {
          position: relative;
          width: ${isMobile ? "3rem" : "3.25rem"};
          height: ${isMobile ? "3rem" : "3.25rem"};
          border-radius: 0.5rem;
          overflow: hidden;
          cursor: pointer;
          flex-shrink: 0;
        }
        .music-cover-img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .music-cover-placeholder {
          width: 100%; height: 100%;
          background-color: #dbeafe;
          display: flex; align-items: center; justify-content: center;
          color: #3b82f6;
        }
        .music-cover-overlay {
          position: absolute; inset: 0;
          background: rgba(0, 0, 0, 0.3);
          display: flex; align-items: center; justify-content: center;
          color: white; opacity: 0; transition: opacity 0.2s ease;
        }
        .music-cover-wrapper:hover .music-cover-overlay { opacity: 1; }

        .music-body {
          flex: 1; min-width: 0;
          display: flex; flex-direction: column;
          justify-content: center; gap: 0.25rem;
        }
        .music-track-name { color: #1f2937; }
        .music-list-toggle {
          font-size: 9px; color: #9ca3af; cursor: pointer;
          transition: color 0.15s ease;
          background: none; border: none; padding: 0; line-height: 1; white-space: nowrap;
        }
        .music-list-toggle:hover { color: #3b82f6; }
        .music-time { color: #9ca3af; font-variant-numeric: tabular-nums; }

        .music-progress-track { background-color: #e5e7eb; }
        .music-progress-bar { background: linear-gradient(90deg, #3b82f6, #60a5fa); }
        .music-progress-handle { background-color: #3b82f6; box-shadow: 0 0 6px rgba(59, 130, 246, 0.4); }

        .music-playlist-panel {
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(229, 231, 235, 0.5);
          border-bottom: none;
          border-radius: 0.75rem 0.75rem 0 0;
          padding: 0.625rem;
          box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.06);
          width: ${isMobile ? "15.5rem" : "18rem"};
        }
        .music-playlist { background-color: rgba(0, 0, 0, 0.02); border: 1px solid rgba(0, 0, 0, 0.05); }
        .music-playlist-item { color: #374151; }
        .music-playlist-item:hover { background-color: rgba(0, 0, 0, 0.04); }
        .music-playlist-active { background-color: rgba(59, 130, 246, 0.1); color: #1d4ed8; }

        .music-player .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .music-player .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .music-player .custom-scrollbar::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 10px; }
        .music-player .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #9ca3af; }

        /* 暗色主题适配（布局与尺寸保持不变） */
        .dark .music-player-panel {
          background: rgba(31, 41, 55, 0.88);
          border-color: rgba(75, 85, 99, 0.5);
          box-shadow: 4px 4px 24px rgba(0, 0, 0, 0.3);
        }
        .dark .music-player-panel.has-playlist { box-shadow: 0 4px 24px rgba(0, 0, 0, 0.24); }
        .dark .music-playlist-panel {
          background: rgba(31, 41, 55, 0.94);
          border-color: rgba(75, 85, 99, 0.5);
          box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.24);
        }
        .dark .music-track-name { color: #f3f4f6; }
        .dark .music-list-toggle:hover { color: #60a5fa; }
        .dark .music-progress-track { background-color: #374151; }
        .dark .music-cover-placeholder { background-color: #1e3a8a; color: #93c5fd; }
        .dark .music-playlist {
          background-color: rgba(255, 255, 255, 0.04);
          border-color: rgba(255, 255, 255, 0.08);
        }
        .dark .music-playlist-item { color: #d1d5db; }
        .dark .music-playlist-item:hover { background-color: rgba(255, 255, 255, 0.06); }
        .dark .music-playlist-active { background-color: rgba(59, 130, 246, 0.2); color: #93c5fd; }
      `}</style>
      </div>

      {isOverlayOpen && (
        <SpiderPlayerOverlay
          musics={musics}
          trackIndex={currentIndex}
          playing={isPlaying}
          position={Math.floor(currentTime)}
          duration={totalTime > 0 ? Math.round(totalTime) : undefined}
          onTrackChange={handleSpiderTrackChange}
          onPlayChange={handleSpiderPlayChange}
          onSeek={handleSpiderSeek}
          onClose={closeOverlay}
        />
      )}
    </>
  );
}

export default MusicPlayer;
