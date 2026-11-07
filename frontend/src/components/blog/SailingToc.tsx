"use client";

/**
 * 帆船滚动目录：视觉与动效参考 LeiBox「Sailing Scroll Contents」(sailing-toc)。
 * 设计参考：Emir Ayaz — https://x.com/emirayaz/status/2113414926911881647/video/1
 * 本实现改为读取文章的真实标题，帆船跟随页面滚动，而不是示例文档。
 */

import { useEffect, useRef, useState } from "react";
import styles from "./sailing-toc.module.css";

export interface SailingTocHeading {
  level: number;
  text: string;
  id: string;
}

interface Navigation {
  from: number;
  to: number;
  elapsed: number;
  duration: number;
}

/** 航线与帆船的横向坐标（px，SVG 无 viewBox，单位即像素） */
const ROUTE_X = 12;
const BEND_X = 38;
/** 航线两端越过第一个 / 最后一个条目的距离 */
const END_INSET = 26;
/** 点击目录后标题停在视口顶部下方多远 */
const SCROLL_OFFSET = 96;

export function SailingToc({ headings }: { headings: SailingTocHeading[] }) {
  const [active, setActive] = useState(0);

  const asideRef = useRef<HTMLElement | null>(null);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const shipRef = useRef<HTMLDivElement | null>(null);
  const routeRef = useRef<SVGPathElement | null>(null);
  const startDotRef = useRef<SVGCircleElement | null>(null);
  const startDotInnerRef = useRef<SVGCircleElement | null>(null);
  const endDotRef = useRef<SVGCircleElement | null>(null);
  const endDotInnerRef = useRef<SVGCircleElement | null>(null);
  const wakesRef = useRef<Array<SVGEllipseElement | null>>([]);
  const linkRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    if (headings.length === 0) return;

    const buttons = linkRefs.current.filter(
      (button): button is HTMLButtonElement => button !== null,
    );
    if (buttons.length === 0) return;

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const reduced = () => media.matches;
    const clamp = (value: number, min: number, max: number) =>
      Math.max(min, Math.min(max, value));

    const centers: number[] = [];
    let current = 0;
    let alive = true;

    const s = {
      y: 0,
      target: 0,
      velocity: 0,
      roll: 0,
      yaw: 0,
      phase: 0,
      scrollSpeed: 0,
      previousScroll: window.scrollY,
      frame: 0,
      last: 0,
      navigation: null as Navigation | null,
      ready: false,
      visible: true,
    };

    const draw = () => {
      if (centers.length === 0) return;

      const first = centers[0];
      const last = centers[centers.length - 1];
      const bob = reduced() ? 0 : Math.sin(s.phase * 2.2) * 0.9;
      const center = clamp(s.y + bob, first, last);

      const ship = shipRef.current;
      if (ship) {
        const half = ship.offsetHeight / 2;
        ship.style.transform = `translateY(${center - half}px) perspective(300px) rotateY(${s.yaw}deg) rotateZ(${s.roll}deg)`;
      }

      const start = first - END_INSET;
      const end = last + END_INSET;
      const route = routeRef.current;
      if (route) {
        const span = last - first;
        if (span < 8) {
          route.setAttribute("d", `M${ROUTE_X} ${start}L${ROUTE_X} ${end}`);
        } else {
          // 航线在当前章节处向右弯出一段，绕开船帆
          const room = Math.min(20, Math.max(6, span / 2));
          const bend = clamp(center, first + room, last - room);
          const shoulder = room * 0.55;
          route.setAttribute(
            "d",
            `M${ROUTE_X} ${start}` +
              `L${ROUTE_X} ${bend - room}` +
              `C${ROUTE_X} ${bend - shoulder} ${BEND_X} ${bend - shoulder} ${BEND_X} ${bend}` +
              `C${BEND_X} ${bend + shoulder} ${ROUTE_X} ${bend + shoulder} ${ROUTE_X} ${bend + room}` +
              `L${ROUTE_X} ${end}`,
          );
        }
      }

      startDotRef.current?.setAttribute("cy", String(start));
      startDotInnerRef.current?.setAttribute("cy", String(start));
      endDotRef.current?.setAttribute("cy", String(end));
      endDotInnerRef.current?.setAttribute("cy", String(end));

      wakesRef.current.forEach((ripple, index) => {
        if (!ripple) return;
        const progress = ((s.phase / 2.4 + index / 2) % 1 + 1) % 1;
        ripple.setAttribute("rx", String(24 + progress * 42));
        ripple.setAttribute("ry", String(6 + progress * 13));
        ripple.style.opacity = reduced()
          ? "0"
          : String(Math.sin(progress * Math.PI) ** 2 * 0.28);
      });
    };

    const schedule = () => {
      if (alive && s.visible && !document.hidden && !s.frame) {
        s.frame = window.requestAnimationFrame(tick);
      }
    };

    const select = (index: number, snap = false) => {
      if (centers.length === 0) return;
      current = clamp(index, 0, headings.length - 1);
      setActive(current);
      s.target = centers[current];
      if (snap || reduced()) {
        s.y = s.target;
        s.velocity = 0;
        s.roll = 0;
        s.yaw = 0;
        draw();
      } else {
        schedule();
      }
    };

    const pick = () => {
      if (!s.ready || s.navigation) return;
      let next = 0;
      const anchor = window.scrollY + 140;
      for (let i = 0; i < headings.length; i += 1) {
        const el = document.getElementById(headings[i].id);
        if (!el) continue;
        if (el.getBoundingClientRect().top + window.scrollY <= anchor) next = i;
      }
      const doc = document.documentElement;
      if (window.scrollY + window.innerHeight >= doc.scrollHeight - 2) {
        next = headings.length - 1;
      }
      if (next !== current) select(next);
    };

    const navigate = (index: number) => {
      const heading = headings[index];
      const el = heading ? document.getElementById(heading.id) : null;
      if (!heading || !el) return;

      select(index);
      const to = Math.max(
        0,
        Math.round(el.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET),
      );
      const from = window.scrollY;
      window.history.replaceState(null, "", `#${heading.id}`);

      if (reduced()) {
        window.scrollTo(0, to);
        s.y = s.target;
        s.velocity = 0;
        s.roll = 0;
        s.yaw = 0;
        draw();
        return;
      }

      s.navigation = {
        from,
        to,
        elapsed: 0,
        duration: clamp(0.65 + Math.abs(to - from) / 4200, 0.65, 1.45),
      };
      schedule();
    };

    const tick = (now: number) => {
      s.frame = 0;
      if (!alive || !s.visible || document.hidden) {
        s.last = 0;
        return;
      }

      const dt = Math.min(0.032, (now - (s.last || now)) / 1000);
      s.last = now;

      if (s.navigation) {
        s.navigation.elapsed += dt;
        const p = clamp(s.navigation.elapsed / s.navigation.duration, 0, 1);
        const ease = p < 0.5 ? 4 * p ** 3 : 1 - (-2 * p + 2) ** 3 / 2;
        window.scrollTo(
          0,
          s.navigation.from + (s.navigation.to - s.navigation.from) * ease,
        );
        if (p === 1) s.navigation = null;
      }

      if (reduced()) {
        s.y = s.target;
        s.velocity = 0;
        s.roll = 0;
        s.yaw = 0;
      } else {
        s.phase += dt;
        // 弹簧跟随 + 随滚动方向倾斜 / 偏航
        const speed =
          dt > 0
            ? clamp((window.scrollY - s.previousScroll) / dt, -16000, 16000)
            : 0;
        s.scrollSpeed += (speed - s.scrollSpeed) * (1 - Math.exp(-dt * 10));
        s.velocity += (180 * (s.target - s.y) - 24 * s.velocity) * dt;
        s.y += s.velocity * dt;
        const smooth = 1 - Math.exp(-dt * 12);
        s.roll +=
          (clamp(s.velocity * 0.035 + s.scrollSpeed * 0.012, -20, 20) +
            Math.sin(s.phase * 1.8) * 1.4 -
            s.roll) *
          smooth;
        s.yaw +=
          (clamp(s.velocity * 0.05 + s.scrollSpeed * 0.06, -48, 48) +
            Math.sin(s.phase * 0.9) * 3 -
            s.yaw) *
          smooth;
        if (Math.abs(s.target - s.y) < 0.1 && Math.abs(s.velocity) < 0.2) {
          s.y = s.target;
          s.velocity = 0;
        }
      }

      s.previousScroll = window.scrollY;
      draw();

      if (
        s.navigation ||
        Math.abs(s.target - s.y) > 0.1 ||
        Math.abs(s.velocity) > 0.2
      ) {
        schedule();
      } else {
        // 停稳后不再空转，等下一次交互
        s.last = 0;
        s.roll = 0;
        s.yaw = 0;
        draw();
      }
    };

    const interrupt = () => {
      if (!s.navigation) return;
      s.navigation = null;
      pick();
    };

    const measure = () => {
      const shell = shellRef.current;
      if (!shell) return;
      const top = shell.getBoundingClientRect().top;
      centers.length = 0;
      for (const button of buttons) {
        const rect = button.getBoundingClientRect();
        centers.push(rect.top - top + rect.height / 2);
      }
      if (centers.length === 0) return;
      s.ready = true;
      shell.dataset.ready = "true";
      select(current, true);
      pick();
    };

    const onScroll = () => pick();
    const onResize = () => measure();
    const onWheel = () => interrupt();
    const onTouchStart = () => interrupt();
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === "ArrowDown" ||
        event.key === "ArrowUp" ||
        event.key === "PageDown" ||
        event.key === "PageUp" ||
        event.key === "Home" ||
        event.key === "End" ||
        event.key === " "
      ) {
        interrupt();
      }
    };

    const buttonCleanups = buttons.map((button, index) => {
      const onClick = () => navigate(index);
      const onButtonKeyDown = (event: KeyboardEvent) => {
        let next = index;
        if (event.key === "ArrowDown") next = Math.min(buttons.length - 1, index + 1);
        else if (event.key === "ArrowUp") next = Math.max(0, index - 1);
        else if (event.key === "Home") next = 0;
        else if (event.key === "End") next = buttons.length - 1;
        else return;
        event.preventDefault();
        buttons[next]?.focus({ preventScroll: true });
      };
      button.addEventListener("click", onClick);
      button.addEventListener("keydown", onButtonKeyDown);
      return () => {
        button.removeEventListener("click", onClick);
        button.removeEventListener("keydown", onButtonKeyDown);
      };
    });

    const onVisibilityChange = () => {
      s.last = 0;
      s.previousScroll = window.scrollY;
      if (!document.hidden && !reduced()) {
        schedule();
      } else {
        window.cancelAnimationFrame(s.frame);
        s.frame = 0;
      }
    };

    const onMotionChange = () => {
      s.previousScroll = window.scrollY;
      s.scrollSpeed = 0;
      if (reduced()) {
        if (s.navigation) window.scrollTo(0, s.navigation.to);
        s.navigation = null;
        window.cancelAnimationFrame(s.frame);
        s.frame = 0;
        s.last = 0;
        select(current, true);
      } else {
        schedule();
      }
    };

    const intersection = new IntersectionObserver(([entry]) => {
      s.visible = entry.isIntersecting;
      s.last = 0;
      s.previousScroll = window.scrollY;
      if (s.visible && !reduced()) {
        schedule();
      } else {
        window.cancelAnimationFrame(s.frame);
        s.frame = 0;
      }
    });
    if (asideRef.current) intersection.observe(asideRef.current);

    const resizeObserver = new ResizeObserver(() => measure());
    if (shellRef.current) resizeObserver.observe(shellRef.current);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("visibilitychange", onVisibilityChange);
    media.addEventListener("change", onMotionChange);

    const start = () => {
      if (!alive) return;
      measure();
      const hash = decodeURIComponent(window.location.hash.slice(1));
      const index = hash ? headings.findIndex((heading) => heading.id === hash) : -1;
      if (index > -1) {
        const el = document.getElementById(hash);
        if (el) {
          window.scrollTo(
            0,
            Math.max(
              0,
              el.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET,
            ),
          );
        }
        select(index, true);
      }
    };
    const initialFrame = window.requestAnimationFrame(() =>
      window.requestAnimationFrame(start),
    );
    document.fonts?.ready
      .then(() => {
        if (alive) measure();
      })
      .catch(() => {
        /* 字体加载失败时沿用首次测量结果 */
      });

    return () => {
      alive = false;
      window.cancelAnimationFrame(s.frame);
      window.cancelAnimationFrame(initialFrame);
      buttonCleanups.forEach((cleanup) => cleanup());
      resizeObserver.disconnect();
      intersection.disconnect();
      media.removeEventListener("change", onMotionChange);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <aside ref={asideRef} className={styles.aside}>
      <nav className={styles.nav} aria-label="文章目录">
        <div className={styles.caption}>目录</div>
        <div ref={shellRef} className={styles.shell}>
          <svg className={styles.rail} width="52" height="100%" aria-hidden="true">
            <path ref={routeRef} className={styles.route} d="" />
            <circle
              ref={startDotRef}
              className={styles.end}
              cx={ROUTE_X}
              cy="0"
              r="3.5"
            />
            <circle
              ref={startDotInnerRef}
              className={styles.endDot}
              cx={ROUTE_X}
              cy="0"
              r="1"
            />
            <circle
              ref={endDotRef}
              className={styles.end}
              cx={ROUTE_X}
              cy="0"
              r="3.5"
            />
            <circle
              ref={endDotInnerRef}
              className={styles.endDot}
              cx={ROUTE_X}
              cy="0"
              r="1"
            />
          </svg>

          <div ref={shipRef} className={styles.ship} aria-hidden="true">
            <svg className={styles.wake} viewBox="0 0 100 88">
              <ellipse
                ref={(el) => {
                  wakesRef.current[0] = el;
                }}
                cx="51"
                cy="79"
                rx="24"
                ry="6"
              />
              <ellipse
                ref={(el) => {
                  wakesRef.current[1] = el;
                }}
                cx="51"
                cy="79"
                rx="45"
                ry="12"
              />
            </svg>
            <svg viewBox="0 0 100 88">
              <path d="M7 65C29 75 66 73 93 57L92 64C72 83 32 88 14 73Z" />
              <path
                className={styles.line}
                d="M8 65C32 72 65 69 93 57M14 73C36 80 70 76 92 64"
              />
              <path className={styles.line} d="M29 13V71M56 3V69M79 12V64" />
              <path d="M29 17C19 14 14 19 18 28L29 32Z" />
              <path d="M29 34C16 28 11 38 18 47L29 51Z" />
              <path d="M29 53C19 47 15 56 23 66L29 70Z" />
              <path d="M56 8C46 3 39 9 42 20L56 25Z" />
              <path d="M56 29C40 22 35 32 43 44L56 49Z" />
              <path d="M56 51C41 44 37 54 46 65L56 69Z" />
              <path d="M80 16Q92 30 95 48L80 56Z" />
              <path
                className={styles.line}
                d="M1 61L29 48M8 65L29 58M29 69L56 38M56 68L79 42M29 13L34 12V16H29M56 3H62V7H56"
              />
            </svg>
          </div>

          <ul className={styles.links}>
            {headings.map((heading, index) => (
              <li
                key={`${heading.id}-${index}`}
                className={styles.item}
                data-level={heading.level}
              >
                <button
                  ref={(el) => {
                    linkRefs.current[index] = el;
                  }}
                  type="button"
                  className={styles.link}
                  data-active={active === index ? "true" : undefined}
                  aria-current={active === index ? "location" : undefined}
                >
                  {heading.text}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </aside>
  );
}
