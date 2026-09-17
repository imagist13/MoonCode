"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Download, X, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageLightboxProps {
  images: { src: string; alt?: string }[];
  initialIndex?: number;
  open: boolean;
  onClose: () => void;
}

/** 图片灯箱（spec §6.3） */
export function ImageLightbox({ images, initialIndex = 0, open, onClose }: ImageLightboxProps) {
  const [index, setIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [loading, setLoading] = useState(true);
  const dragRef = useRef<{ startX: number; startY: number; ox: number; oy: number; active: boolean }>({
    startX: 0,
    startY: 0,
    ox: 0,
    oy: 0,
    active: false,
  });

  useEffect(() => {
    if (!open) {
      setScale(1);
      setPos({ x: 0, y: 0 });
      setIndex(initialIndex);
    }
  }, [open, initialIndex]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + images.length) % images.length);
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % images.length);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, images.length, onClose]);

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale((s) => Math.max(0.5, Math.min(3, s * delta)));
  };

  const onMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      ox: pos.x,
      oy: pos.y,
      active: true,
    };
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragRef.current.active) return;
    setPos({
      x: dragRef.current.ox + (e.clientX - dragRef.current.startX),
      y: dragRef.current.oy + (e.clientY - dragRef.current.startY),
    });
  };

  const onMouseUp = () => {
    dragRef.current.active = false;
  };

  const reset = () => {
    setScale(1);
    setPos({ x: 0, y: 0 });
  };

  if (!open) return null;

  const current = images[index];
  if (!current) return null;

  const downloadImage = async () => {
    try {
      const url = current.src.includes("?") ? `${current.src}&download=true` : current.src;
      window.open(url, "_blank");
    } catch {
      /* noop */
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 p-4 backdrop-blur-lg">
      {/* 顶部工具条 */}
      <div className="absolute left-1/2 top-4 z-20 flex -translate-x-1/2 items-center gap-3 rounded-full bg-white/80 px-4 py-2 shadow-lg backdrop-blur-sm">
        <button
          type="button"
          onClick={reset}
          className="text-xs text-gray-700 hover:text-blue-600"
          title="重置"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
        <span className="text-xs font-medium text-gray-700">{Math.round(scale * 100)}%</span>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-700 hover:text-red-600"
          aria-label="关闭"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* 左右导航 */}
      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => setIndex((i) => (i - 1 + images.length) % images.length)}
            className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/80 p-3 text-gray-800 shadow-lg backdrop-blur-sm transition-all hover:bg-white"
            aria-label="上一张"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => setIndex((i) => (i + 1) % images.length)}
            className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/80 p-3 text-gray-800 shadow-lg backdrop-blur-sm transition-all hover:bg-white"
            aria-label="下一张"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* 图片 */}
      <div
        className={cn(
          "relative flex max-h-[90vh] max-w-full items-center justify-center",
          scale > 1 ? "cursor-move" : "cursor-zoom-in",
        )}
        onWheel={onWheel}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-white" />
          </div>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current.src}
          alt={current.alt || ""}
          className="max-h-[90vh] max-w-full object-contain transition-transform"
          style={{
            transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
            opacity: loading ? 0 : 1,
          }}
          onLoad={() => setLoading(false)}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = "/image_error.svg";
            setLoading(false);
          }}
          draggable={false}
        />
      </div>

      {/* 底部工具条 */}
      {images.length > 0 && (
        <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3 rounded-full bg-white/80 px-4 py-2 text-xs shadow-lg backdrop-blur-sm">
          <span className="font-medium text-gray-700">
            {index + 1} / {images.length}
          </span>
          <button
            type="button"
            onClick={downloadImage}
            className="inline-flex items-center gap-1 text-gray-700 hover:text-blue-600"
          >
            <Download className="h-3 w-3" />
            下载原图
          </button>
        </div>
      )}
    </div>
  );
}