"use client";

import {
  useEffect,
  useRef,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { ArrowUpRight } from "@phosphor-icons/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface FriendLink {
  id: number;
  linkName: string;
  linkAvatar: string;
  linkAddress: string;
  linkIntro: string;
}

function normalizeAddress(address: string): string {
  if (/^https?:\/\//i.test(address)) return address;
  if (/^javascript:/i.test(address)) return "#";
  return `https://${address}`;
}

function hostOf(address: string): string {
  try {
    return new URL(normalizeAddress(address)).hostname.replace(/^www\./, "");
  } catch {
    return address;
  }
}

function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

interface FloodController {
  flood: (target: number, x: number, y: number) => void;
}

/**
 * 卡片内的一层程序化水墨：从指针进入的位置铺开，向离开的位置收拢。
 * 只用 2D 画布与噪声纹理，不上 WebGL；减少动态效果时直接静态显隐。
 */
function useLiquidFlood(seed: number) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const controllerRef = useRef<FloodController | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const surface = canvas?.parentElement;
    if (!canvas || !surface) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const state = {
      x: 0.5,
      y: 0.5,
      progress: 0,
      from: 0,
      target: 0,
      started: 0,
      duration: 520,
      frame: 0,
    };
    let width = 0;
    let height = 0;
    let mask: HTMLCanvasElement | null = null;
    let tinted: HTMLCanvasElement | null = null;
    let inkColor = "#12120f";
    let liquidColor = "#0a84ff";

    const hash = (x: number, y: number) => {
      let h = Math.imul(x ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(y ^ seed, 0xc2b2ae35);
      h = Math.imul(h ^ (h >>> 13), 0x27d4eb2d);
      return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
    };

    const noise = (x: number, y: number) => {
      const xi = Math.floor(x);
      const yi = Math.floor(y);
      const fx = smoothstep(x - xi);
      const fy = smoothstep(y - yi);
      const a = hash(xi, yi);
      const b = hash(xi + 1, yi);
      const c = hash(xi, yi + 1);
      const d = hash(xi + 1, yi + 1);
      return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
    };

    const fbm = (x: number, y: number) => {
      let value = 0;
      let amplitude = 0.5;
      let px = x;
      let py = y;
      for (let i = 0; i < 4; i += 1) {
        value += amplitude * noise(px, py);
        px = px * 2.03 + 17.1;
        py = py * 2.03 - 9.7;
        amplitude *= 0.5;
      }
      return value;
    };

    // 低分辨率灰度纹理，放大后自带柔和的流动边缘
    const buildMask = () => {
      const maskWidth = Math.max(120, Math.min(420, Math.round(width / 1.6)));
      const maskHeight = Math.max(72, Math.round((maskWidth * height) / Math.max(width, 1)));
      const nextMask = document.createElement("canvas");
      nextMask.width = maskWidth;
      nextMask.height = maskHeight;
      const maskContext = nextMask.getContext("2d");
      if (!maskContext) return;
      const image = maskContext.createImageData(maskWidth, maskHeight);

      for (let y = 0; y < maskHeight; y += 1) {
        for (let x = 0; x < maskWidth; x += 1) {
          const nx = (x / maskWidth) * 4.2;
          const ny = (y / maskHeight) * 2.6;
          const warp = fbm(nx * 0.8 + 2.3, ny * 0.8 + 7.1);
          const field = fbm(nx * 0.7 + warp * 2.4, ny * 0.7 + warp * 1.8 + 3.4);
          // 噪声扭曲后的细条带，形成流动的水墨丝纹
          const ribbon = Math.abs(Math.sin(nx * 2.4 + ny * 1.4 + field * 12));
          const wash = 0.05 * smoothstep(Math.min(1, Math.max(0, field)));
          const alpha = Math.round(
            Math.min(1, Math.pow(ribbon, 10) * 1.1 + wash) * 255,
          );
          const index = (y * maskWidth + x) * 4;
          image.data[index] = 255;
          image.data[index + 1] = 255;
          image.data[index + 2] = 255;
          image.data[index + 3] = alpha;
        }
      }
      maskContext.putImageData(image, 0, 0);
      mask = nextMask;
    };

    // 用当前主题的文字色给纹理上色，明暗模式各有一套墨色
    const buildTint = () => {
      if (!mask || width < 1 || height < 1) return;
      const nextTint = document.createElement("canvas");
      nextTint.width = Math.round(width);
      nextTint.height = Math.round(height);
      const tintContext = nextTint.getContext("2d");
      if (!tintContext) return;
      tintContext.drawImage(mask, 0, 0, nextTint.width, nextTint.height);
      tintContext.globalCompositeOperation = "source-in";
      inkColor = getComputedStyle(surface).color;
      // 用站点强调色给液体上色，保留一层文字墨色作为兜底
      const themeRoot = surface.closest(".blog-theme") ?? document.documentElement;
      liquidColor =
        getComputedStyle(themeRoot).getPropertyValue("--blog-accent").trim() || inkColor;
      tintContext.fillStyle = liquidColor;
      tintContext.fillRect(0, 0, nextTint.width, nextTint.height);
      tinted = nextTint;
    };

    const render = (progress: number, now: number) => {
      context.clearRect(0, 0, width, height);
      if (!tinted || progress <= 0.002) return;

      const seconds = now * 0.001;
      const originX = state.x * width;
      const originY = state.y * height;
      const radius = progress * Math.hypot(width, height) * 1.08;
      const isDark = document.documentElement.classList.contains("dark");

      context.save();
      context.beginPath();
      const steps = 72;
      for (let i = 0; i <= steps; i += 1) {
        const angle = (i / steps) * Math.PI * 2;
        const wobble =
          1 +
          0.035 * Math.sin(angle * 3 + seconds * 1.7) +
          0.018 * Math.sin(angle * 5 - seconds * 1.1);
        const px = originX + Math.cos(angle) * radius * wobble;
        const py = originY + Math.sin(angle) * radius * wobble;
        if (i === 0) context.moveTo(px, py);
        else context.lineTo(px, py);
      }
      context.closePath();
      context.clip();
      // 淡罩色，让液体铺开的边界更可感知
      context.globalAlpha = isDark ? 0.06 : 0.04;
      context.fillStyle = liquidColor;
      context.fillRect(0, 0, width, height);
      // 铺满后纹理持续漂移、轻微摆动，像液体在卡片里流动
      const driftX =
        (Math.sin(seconds * 0.55) * 0.055 + Math.sin(seconds * 1.3 + 1.7) * 0.015) *
        width;
      const driftY =
        (Math.cos(seconds * 0.42) * 0.055 + Math.cos(seconds * 1.05 + 0.6) * 0.015) *
        height;
      context.translate(width / 2 + driftX, height / 2 + driftY);
      context.rotate(Math.sin(seconds * 0.38) * 0.018);
      context.scale(1.22, 1.22);
      context.globalAlpha = isDark ? 0.52 : 0.55;
      context.drawImage(tinted, -width / 2, -height / 2, width, height);
      context.restore();
    };

    // 液体铺满后保持缓慢流动，直到指针离开
    const flow = (now: number) => {
      render(1, now);
      state.frame = requestAnimationFrame(flow);
    };

    const step = (now: number) => {
      const t = Math.min(1, (now - state.started) / state.duration);
      // 先慢后快再收住，液体铺开的过程更接近真实注入
      const eased = smoothstep(t);
      state.progress = state.from + (state.target - state.from) * eased;
      render(state.progress, now);
      if (t < 1) {
        state.frame = requestAnimationFrame(step);
      } else {
        state.progress = state.target;
        render(state.progress, now);
        if (state.target === 1 && !reduceMotion.matches) {
          state.frame = requestAnimationFrame(flow);
        } else {
          state.frame = 0;
        }
      }
    };

    const flood = (target: number, x: number, y: number) => {
      state.x = Math.min(1, Math.max(0, x));
      state.y = Math.min(1, Math.max(0, y));

      if (reduceMotion.matches) {
        if (state.frame) cancelAnimationFrame(state.frame);
        state.frame = 0;
        state.progress = target;
        state.from = target;
        state.target = target;
        render(target, performance.now());
        return;
      }

      if (state.progress === target && state.target === target) {
        // 已经到位：重复触发（如悬停中点击聚焦）时不要打断正在流动的纹理
        if (target === 1 && !state.frame) {
          state.frame = requestAnimationFrame(flow);
        }
        return;
      }

      if (state.frame) cancelAnimationFrame(state.frame);
      state.frame = 0;
      state.from = state.progress;
      state.target = target;
      state.started = performance.now();
      state.duration = target > state.progress ? 1100 : 750;
      state.frame = requestAnimationFrame(step);
    };

    controllerRef.current = { flood };

    const resize = () => {
      const rect = surface.getBoundingClientRect();
      const nextWidth = Math.max(1, Math.round(rect.width));
      const nextHeight = Math.max(1, Math.round(rect.height));
      if (nextWidth === width && nextHeight === height) return;

      width = nextWidth;
      height = nextHeight;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildMask();
      buildTint();
      render(state.progress, performance.now());
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(surface);
    resize();

    // 主题切换后重新取色
    const themeObserver = new MutationObserver(() => {
      buildTint();
      render(state.progress, performance.now());
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      resizeObserver.disconnect();
      themeObserver.disconnect();
      if (state.frame) cancelAnimationFrame(state.frame);
      controllerRef.current = null;
    };
  }, [seed]);

  const onPointerEnter = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType === "touch") return;
    const rect = event.currentTarget.getBoundingClientRect();
    controllerRef.current?.flood(
      1,
      (event.clientX - rect.left) / rect.width,
      (event.clientY - rect.top) / rect.height,
    );
  };

  const onPointerLeave = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType === "touch") return;
    const rect = event.currentTarget.getBoundingClientRect();
    controllerRef.current?.flood(
      0,
      (event.clientX - rect.left) / rect.width,
      (event.clientY - rect.top) / rect.height,
    );
  };

  const onFocus = () => {
    controllerRef.current?.flood(1, 0.5, 0.5);
  };

  const onBlur = () => {
    controllerRef.current?.flood(0, 0.5, 0.5);
  };

  return {
    canvasRef,
    handlers: { onPointerEnter, onPointerLeave, onFocus, onBlur },
  };
}

export function LiquidLinkCard({ link }: { link: FriendLink }) {
  const { canvasRef, handlers } = useLiquidFlood(link.id);
  const host = hostOf(link.linkAddress);

  return (
    <a
      href={normalizeAddress(link.linkAddress)}
      target="_blank"
      rel="noopener noreferrer"
      {...handlers}
      className="group relative isolate flex aspect-[4/5] h-full w-full flex-col overflow-hidden rounded-2xl border border-blog-line bg-blog-surface p-4 transition-colors duration-300 hover:border-blog-ink/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blog-ink/30 focus-visible:ring-offset-2 focus-visible:ring-offset-blog-bg"
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 h-full w-full"
      />

      <div className="relative z-10 flex w-full flex-1 flex-col items-center justify-center text-center">
        <ArrowUpRight className="absolute right-0 top-0 h-4 w-4 text-blog-soft transition-[transform,color] duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-blog-ink" />

        <Avatar className="h-12 w-12 border border-blog-line">
          <AvatarImage src={link.linkAvatar} alt={link.linkName} />
          <AvatarFallback className="bg-blog-muted text-[12px] text-blog-soft">
            {link.linkName.slice(0, 2)}
          </AvatarFallback>
        </Avatar>

        <span className="mt-3 w-full truncate text-[14px] font-semibold text-blog-ink">
          {link.linkName}
        </span>
        <div className="mt-0.5 w-full truncate text-[11px] text-blog-soft transition-colors duration-300 group-hover:text-blog-ink/60">
          {host}
        </div>
        {link.linkIntro && (
          <p className="mt-2 line-clamp-3 text-[12px] leading-relaxed text-blog-soft transition-colors duration-300 group-hover:text-blog-ink/75">
            {link.linkIntro}
          </p>
        )}
      </div>
    </a>
  );
}
