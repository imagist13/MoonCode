"use client";

import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { formatTime } from "@/lib/utils";
import styles from "./category-folders.module.css";

export interface FolderArticle {
  id: number;
  title: string;
  cover?: string;
  time?: string;
}

export interface CategoryFolderItem {
  id: number;
  name: string;
  count: number;
  articles: FolderArticle[];
}

/** 玻璃文件夹的轮廓（与 LeiBox 组件同一套几何） */
const BACK_PATH =
  "M0 56A22 22 0 0 1 22 34L146 34C170 34 172 0 198 0L318 0A22 22 0 0 1 340 22L340 250A22 22 0 0 1 318 272L22 272A22 22 0 0 1 0 250Z";
const FRONT_PATH =
  "M0 22A22 22 0 0 1 22 0L118 0C144 0 146 32 172 32L318 32A22 22 0 0 1 340 54L340 176A22 22 0 0 1 318 198L22 198A22 22 0 0 1 0 176Z";

function hashString(value: string) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash = Math.imul(hash ^ value.charCodeAt(i), 16777619);
  }
  return hash >>> 0;
}

export function CategoryFolderGrid({ items }: { items: CategoryFolderItem[] }) {
  const [openId, setOpenId] = useState<number | null>(null);
  const rootRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (openId === null) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpenId(null);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenId(null);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [openId]);

  return (
    <ul ref={rootRef} className={styles.grid}>
      {items.map((item, index) => (
        <CategoryFolder
          key={item.id}
          item={item}
          index={index}
          open={openId === item.id}
          onToggle={() =>
            setOpenId((current) => (current === item.id ? null : item.id))
          }
        />
      ))}
    </ul>
  );
}

function CategoryFolder({
  item,
  index,
  open,
  onToggle,
}: {
  item: CategoryFolderItem;
  index: number;
  open: boolean;
  onToggle: () => void;
}) {
  const hostRef = useRef<HTMLLIElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const filesId = useId();
  const cover = item.articles.find((article) => article.cover)?.cover;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const observer = new ResizeObserver(() => {
      const width = host.clientWidth;
      if (width > 0) setScale(Math.min(1, width / 340));
    });
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLLIElement>) => {
      if (event.pointerType === "touch") return;
      const host = hostRef.current;
      const stage = stageRef.current;
      if (!host || !stage) return;

      const rect = host.getBoundingClientRect();
      const px = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const py = ((event.clientY - rect.top) / rect.height) * 2 - 1;
      stage.style.setProperty("--px", px.toFixed(3));
      stage.style.setProperty("--py", py.toFixed(3));
    },
    [],
  );

  const handlePointerLeave = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;
    stage.style.setProperty("--px", "0");
    stage.style.setProperty("--py", "0");
  }, []);

  const visibleCount = item.articles.length;

  return (
    <li
      ref={hostRef}
      className={styles.folder}
      data-open={open ? "true" : undefined}
      style={{ "--k": scale, "--i": index } as CSSProperties}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <div ref={stageRef} className={styles.stage}>
        <div className={styles.tilt}>
          <div className={styles.shadow} aria-hidden="true" />

          <div
            className={styles.back}
            style={{ clipPath: `path('${BACK_PATH}')` }}
            aria-hidden="true"
          >
            {cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className={styles.artImg} src={cover} alt="" loading="lazy" />
            ) : (
              <div className={styles.art} data-preset={index % 5} />
            )}
            <div className={styles.sheen} />
          </div>

          <div
            className={styles.front}
            style={{ clipPath: `path('${FRONT_PATH}')` }}
          >
            <div className={styles.tint} aria-hidden="true" />
            <div className={styles.spec} aria-hidden="true" />
            <button
              type="button"
              className={styles.hit}
              onClick={onToggle}
              aria-expanded={open}
              aria-controls={filesId}
              aria-label={`${open ? "收起" : "展开"}「${item.name}」的文件夹`}
            />
            <div className={styles.label}>
              <span className={styles.title} title={item.name}>
                {item.name}
              </span>
              <span className={styles.meta}>{item.count} 篇文章</span>
            </div>
          </div>

          <div
            id={filesId}
            className={styles.files}
            inert={!open}
            aria-label={`「${item.name}」最新文章`}
          >
            {visibleCount === 0 ? (
              <div
                className={`${styles.sheet} ${styles.sheetEmpty}`}
                style={
                  {
                    "--slot": 0,
                    "--depth": 0,
                    "--jx": "0px",
                    "--jr": "0deg",
                    zIndex: 1,
                  } as CSSProperties
                }
              >
                暂无文章
              </div>
            ) : (
              item.articles.map((article, position) => {
                const seed = hashString(`${item.id}-${article.id}`);
                const slot = visibleCount <= 1 ? 0 : (position / (visibleCount - 1)) * 2 - 1;
                const jx = ((seed % 100) / 100 - 0.5) * 10;
                const jr = (((seed >> 9) % 100) / 100 - 0.5) * 3.2;

                return (
                  <Link
                    key={article.id}
                    href={`/articles/${article.id}`}
                    className={styles.sheet}
                    data-art={article.cover ? "true" : undefined}
                    tabIndex={open ? undefined : -1}
                    style={
                      {
                        "--slot": slot,
                        "--depth": visibleCount - 1 - position,
                        "--jx": `${jx.toFixed(2)}px`,
                        "--jr": `${jr.toFixed(2)}deg`,
                        zIndex: position + 1,
                      } as CSSProperties
                    }
                  >
                    {article.cover ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          className={styles.sheetArt}
                          src={article.cover}
                          alt=""
                          loading="lazy"
                        />
                        <span className={styles.sheetShade} aria-hidden="true" />
                      </>
                    ) : (
                      <span className={styles.lines} aria-hidden="true">
                        {[86, 92, 64, 88, 42].map((width) => (
                          <i key={width} style={{ width: `${width}%` }} />
                        ))}
                      </span>
                    )}
                    <span className={styles.sheetHead}>
                      <span className={styles.sheetName}>{article.title}</span>
                      <span className={styles.sheetMeta}>
                        {article.time ? formatTime(article.time) : ""}
                      </span>
                    </span>
                  </Link>
                );
              })
            )}
          </div>

          <Link
            href={`/?category=${item.id}`}
            className={styles.key}
            aria-label={`查看「${item.name}」全部文章`}
            title="查看全部"
          >
            <ArrowUpRight className={styles.keyIcon} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </li>
  );
}
